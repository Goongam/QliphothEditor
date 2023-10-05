

let song = null;

const NOTE_TYPE = {
    normal1: "normal1",
    normal2: "normal2",
    normal3: "normal3",
    long : "long",
    slide: "slide",
}
const NOTE_SIZE = {
    normal1: 100,
    normal2: 170,
    normal3: 250,
    long:250,
    slide:170,
}

const NOTE_COLOR = {
    normal1: '#87CEEB',
    normal2: '#87CEEB',
    normal3: '#87CEEB',
    long:'#E6E6FA',
    slide:'orange',
}

const NOTE_EXPORT_NAME = {
    normal1 : "smallNormalNote",
    normal2: "normalNote",
    normal3:"bigNormalNote",
    long:"longNote",
    slide:"slideNote",
}

const NOTE_IMPORT_NAME = {
    smallNormalNote : "normal1",
    normalNote: "normal2",
    bigNormalNote:"normal3",
    longNote:"long",
    slideNote:"slide",
}


const SMRY_WIDTH_PER_SEC = 50;


//"노트의 종류", "노트가 생기는 시각", "노트가 생길 좌표", "노트 순서", "동타 여부", "롱노트 일때 지속시간"
class Note{
    constructor(id, type, time, pos, seq, isSame, endTime, isShow) {
        this.id = id;
        this.type = type;
        this.time = time;
        this.pos = pos;
        this.seq = seq;
        this.isSame = isSame;
        this.endTime = endTime;
        this.isShow = isShow;
    }
}

class Song{
    sound = null;
    frameInterval = null;
    timeElement = null;
    playbackRangeElement = null;
    pattern = [];
    showPattern = [];
    selectNoteType = NOTE_TYPE.normal1;

    //이벤트 리스너
    screenMouseDownEvent = (event)=>{
        this.screen.classList.add('event');

        const clickX = event.pageX - this.screen.offsetLeft;
        const clickY = event.pageY - this.screen.offsetTop;
        
        const elementClicked = document.elementFromPoint(event.clientX, event.clientY);
    
        //다른 노트와 겹치는 경우
        if (elementClicked && elementClicked.classList.contains('note')) {
            elementClicked.classList.forEach(className => {
                if(className.startsWith('id')){
                    this.setNoteDetail(className.split('id-')[1]);
                    this.clickedNoteElement  = elementClicked;
                    
                }
            })
            
        } else { //다른 노트와 겹치지 않는 경우
            this.addNote(this.selectNoteType,clickX,clickY);
        }        
    }

    screenMouseMoveEvent = (e)=>{
        this.screen.classList.add('mousemove');
        const prevPreviews = document.querySelectorAll('.preview');

        prevPreviews.forEach((prevPreview) => prevPreview.remove());

        const clickX = e.pageX - this.screen.offsetLeft;
        const clickY = e.pageY - this.screen.offsetTop;

        const elementOnMouse = document.elementFromPoint(e.clientX, e.clientY);
    
        
        if(!(elementOnMouse.id === 'screen')){
            return;
        }
        
        //노트 미리보기
        const preview = document.createElement('div');
        preview.className = "preview";
        preview.style = `
            left:${clickX - NOTE_SIZE[this.selectNoteType] / 2}px;
            top:${clickY - NOTE_SIZE[this.selectNoteType] / 2}px;
            width: ${NOTE_SIZE[this.selectNoteType]}px; /* 초기 크기 */
            height: ${NOTE_SIZE[this.selectNoteType]}px; /* 초기 크기 */
            position: absolute;
            transform: rotate(45deg);
            border: 1px solid black;
        `;

        this.screen.appendChild(preview);
    }

    detailTypeChangeEvent = (e)=>{
        this.editNoteType(e);
    }

    detailTimeChangeEvent = (e)=>{
        this.editNoteTime(e);
        
    }

    detailEndTimeChangeEvent = (e)=>{
        this.editNoteEndTime(e);
    }

    summarySongTimeClickEvent = (e)=>{
        const clickX = e.offsetX;

        this.sound.seek(clickX / SMRY_WIDTH_PER_SEC);     
    }

    summaryNoteClickEvent = (e)=>{
        e.target.classList.forEach(className => {
            if(className.startsWith('sid-')){
                const findId = className.split('sid-')[1];
                this.setNoteDetail(findId);

                const findNote = document.querySelector(`.id-${findId}`);
                this.clickedNoteElement = findNote;
                
            }
        })
        
    }

    keydownEvenet = (e) => {
        const key = e.key.toUpperCase();

        switch(key){
            case 'A':
                this.sound.seek(this.sound.seek() - 0.5)
                break;
            case 'D':
                this.sound.seek(this.sound.seek() + 0.5);
                break;
            case 'S':
                this.onplay();
                break;
            case 'DELETE':
                this.deleteNote();
                break;
            case 'Q':
                this.changeNoteType(NOTE_TYPE.normal1, document.querySelector('#type-normal1-btn'));
                break;
            case 'W':
                this.changeNoteType(NOTE_TYPE.normal2, document.querySelector('#type-normal2-btn'));
                break;
            case 'E':
                this.changeNoteType(NOTE_TYPE.normal3, document.querySelector('#type-normal3-btn'));
                break;
            case 'R':
                this.changeNoteType(NOTE_TYPE.slide, document.querySelector('#type-slide-btn'));
                break;
            case 'T':
                this.changeNoteType(NOTE_TYPE.long, document.querySelector('#type-long-btn'));
                break;
            case 'ARROWRIGHT':
                if(this.selectNoteId != undefined) e.preventDefault(); //클릭된 노트 존재시 스크롤 방지
                this.editNotePos(1, 0);
                break;
            case 'ARROWLEFT':
                if(this.selectNoteId != undefined) e.preventDefault(); 
                this.editNotePos(-1, 0);
                break;
            case 'ARROWUP':
                if(this.selectNoteId != undefined) e.preventDefault();
                this.editNotePos(0, -1);
                break;
            case 'ARROWDOWN':
                if(this.selectNoteId != undefined) e.preventDefault();
                this.editNotePos(0, 1);
                break;

        }
        
    }

    init(sound){
        this.sound = sound;
        this.playbackRangeElement = document.querySelector("#playback");
        this.timeElement = document.querySelector("#playTime");
        this.screen = document.querySelector("#screen");
        // 노트 타입 선택
        this.noteTypeElement = document.querySelector("#selectedNoteType");
        this.noteTypeBtn = document.querySelectorAll(".noteTypeBtn");
        //롱 노트길이
        this.longNoteRangeElement = document.querySelector("#longNoteInput");
        // 노트 상세 element
        this.detailNoteTypeElement = document.querySelector("#detailType");
        this.detailNoteTimeElement = document.querySelector("#detailTime");
        this.detailEndTimeElement = document.querySelector("#detailEndTime");
        //요약
        this.summaryElement = document.querySelector("#summary");
        this.summarySongTimeElement = document.querySelector("#summarySongTime");
        this.summaryScreenElement = document.querySelector("#summaryScreen");
        this.summaryTimeLineElement = document.querySelector("#summaryTimeLine");

        //배속
        this.rateElement = document.querySelector('#rate').selectedIndex = 4

        this.clickedNoteElement = undefined;

        this.noteIdx = 0;

        this.selectNoteId = undefined;

        this.selectNoteType = NOTE_TYPE.normal1;

        this.frameInterval = setInterval(()=>{
            this.frame();    
        },100);

        this.screen.addEventListener('mousedown',this.screenMouseDownEvent);

        //미리보기
        this.screen.addEventListener("mousemove",this.screenMouseMoveEvent);

        
        //노트타입변경
        this.detailNoteTypeElement.addEventListener("change",this.detailTypeChangeEvent)
        //노트시간변경
        this.detailNoteTimeElement.addEventListener("change", this.detailTimeChangeEvent)
        //노트끝나는시간변경(롱)
        this.detailEndTimeElement.addEventListener("change", this.detailEndTimeChangeEvent)

        this.summarySongTimeElement.addEventListener("click", this.summarySongTimeClickEvent);

        this.playbackRangeElement.addEventListener("click", ()=>{
            this.unSelectNote();
        });

        //키보드 단축키
        window.addEventListener('keydown',this.keydownEvenet)
    }

    unload(){
        this.sound.unload();

        document.querySelectorAll(".diamond").forEach(e => e.remove());

        clearInterval(this.frameInterval);

        //노트생성 or 노트 선택
        this.screen.removeEventListener('mousedown', this.screenMouseDownEvent);

        //미리보기
        this.screen.removeEventListener("mousemove", this.screenMouseMoveEvent);

        
        //노트타입변경
        this.detailNoteTypeElement.removeEventListener("change", this.detailTypeChangeEvent)
        //노트시간변경
        this.detailNoteTimeElement.removeEventListener("change", this.detailTimeChangeEvent)
        //노트끝나는시간변경(롱)
        this.detailEndTimeElement.removeEventListener("change", this.detailEndTimeChangeEvent)

        this.summarySongTimeElement.removeEventListener("click", this.summarySongTimeClickEvent);

        
        // this.summaryNote.removeEventListener("click", this.summaryNoteClickEvent);
        document.querySelectorAll(".summaryNote").forEach(e => e.removeEventListener("click", this.summaryNoteClickEvent));
    }


    //"노트의 종류", "노트가 생기는 시각", "노트가 생길 좌표", "노트 순서", "동타 여부", "롱노트 일때 지속시간"
    addNote(type,x, y){
        const id = this.noteIdx++;

        const noteRange = type === NOTE_TYPE.long ? +this.longNoteRangeElement.value : 0;
        this.pattern.push(new Note(id,type,this.sound.seek(), `${x}.${y}`,this.pattern.length, false, this.sound.seek() + noteRange, false));
        
        this.summaryRefresh();
        
    }
    deleteNote(){
        this.pattern = this.pattern.filter(note => note.id != this.selectNoteId);
        
        const deleteNote= document.querySelector(`.id-${this.selectNoteId}`);
        deleteNote?.remove();

        //함수화
        this.selectNoteId = undefined;

        document.querySelectorAll(".active").forEach((ele) => {
            ele.className = 'inactive';
        })

        document.querySelector("#detailID").innerText = '-';
        document.querySelector("#detailType").value = '';
        document.querySelector("#detailTime").value = getFormatTime(0);
        document.querySelector("#detailEndTime").value = getFormatTime(0);
//

        this.summaryRefresh();
    }

    unSelectNote(){
        
        if(!this.selectNoteId) return;

        const selectedNote = document.querySelector(`.id-${this.selectNoteId}`);
        
        selectedNote?.classList.remove('highlight');

        document.querySelectorAll(".active").forEach((ele) => {
            ele.className = 'inactive';
        })

        document.querySelector("#detailID").innerText = '-';
        document.querySelector("#detailType").value = '';
        document.querySelector("#detailTime").value = getFormatTime(0);
        document.querySelector("#detailEndTime").value = getFormatTime(0);

        this.selectNoteId = undefined;

        this.summaryRefresh();
    }

    start(){
        this.sound.play();
    }
    
    pause(){
        this.sound.pause();
    }

    onplay(){
        const playbtn = document.querySelector('#playbtn');
        
        if(this.sound.playing()){
            this.pause();
            playbtn.innerText = "▶️"
        }else{
            this.start();
            playbtn.innerHTML = '<img src="https://cdn.icon-icons.com/icons2/1144/PNG/512/pausebutton_80847.png" width="30px" />'
        }
    }

    changeRate(e){
        const value = e.options[e.selectedIndex].value;
        this.sound.rate(+value);
    }

    changeSelectNoteTime(){
       const notetime =  document.querySelector("#detailTime").value;
       const time = getTimeFromFormatTime(notetime);
       this.sound.seek(time);
    
    }
    
    changeTime(ele) {
        this.sound.seek(ele.value / 100); //해당 재생 분,초로 이동

        this.changeTimeElement();
        
        //현재 보여지고 있는 노트 삭제
        // document.querySelectorAll('.show').forEach(noteEle =>{
        //     noteEle.remove();
        // })

    }

    changeTimeElement(){
        const currentTime = this.sound.seek();
        playTime.innerHTML = getFormatTime(currentTime);
    }

    changeNoteType(noteType, selectBtnElement){
        this.selectNoteType = noteType;

        this.noteTypeBtn.forEach((btn)=>{
            btn.style = 'background-color: white';
            selectBtnElement.style = 'background-color: yellow';
        });

        if(this.selectNoteType == NOTE_TYPE.long){
            document.querySelector("#longNoteInput").disabled = false;
        }else{
            document.querySelector("#longNoteInput").disabled = true;
        }

    }

    

    setNoteDetail(noteId){ 
        this.pattern.forEach((note)=>{
           if( note.id == +noteId){
  
                this.selectNoteId = note.id;
                

                document.querySelectorAll(".inactive").forEach((ele) => {
                    ele.className = 'active';
                })

                document.querySelector("#detailID").innerText = note.id;
                document.querySelector("#detailType").value = note.type;
                document.querySelector("#detailTime").value = getFormatTime(note.time);
  
                document.querySelector("#detailEndTime").value = getFormatTime(note.endTime);
                
                //노트 하이라이트
                    //기존 하이라이트 노트 class제거
                document.querySelectorAll('.highlight').forEach(h => h.classList.remove('highlight'));
                    //노트 하이라이트
                const selectnote = document.querySelector(`.id-${note.id}`);
                selectnote?.classList.add('highlight');
                    //요약 하이라이트
                const selectSummaryNote = document.querySelector(`.sid-${note.id}`);
                selectSummaryNote.classList.add('highlight');
            }
        });

    }

    editNoteType(e){
        const changeType = e.target.value;

        this.pattern.map((note) => {
            if(note.id === this.selectNoteId){
                //롱노트 였다면 endtime을 startTime과 맞춰줌
                if(note.type === NOTE_TYPE.long){
                    note.endTime = note.time;
                }

                note.type = changeType;
                
                this.clickedNoteElement.classList.forEach((className)=>{
                    if(className.startsWith('type-')){
                        this.clickedNoteElement.classList.replace(className,`type-${changeType}`);     
                    }
                })  
            }
        });

        this.summaryRefresh();
    }

    editNoteTime(e){
        this.pattern.map((note) => {
            if(note.id === this.selectNoteId){
                //끝나는 시간 수정
                
                if(note.type !== NOTE_TYPE.long){
                    note.endTime = getTimeFromFormatTime(e.target.value);   
                }else{
                    note.endTime = getTimeFromFormatTime(e.target.value + (note.endTime - note.time));
                }

                //시작 시간 수정
                note.time = getTimeFromFormatTime(e.target.value);         
                
            }
        });

        this.summaryRefresh();

        
    }

    editNoteEndTime(e){
   
        this.pattern.map((note) => {
            if(note.id === this.selectNoteId){
                //시작 시간이 보다 작으면 return, 롱노트가 아니면 return
                if(note.time > getTimeFromFormatTime(e.target.value) || note.type !== NOTE_TYPE.long){    
                    return;
                }
                //끝나는 시간 수정

                note.endTime = getTimeFromFormatTime(e.target.value);   
            }
        });

        this.summaryRefresh();  
    }

    editNotePos(dirX, dirY){
  
        this.pattern.map((note) => {
            if(note.id === this.selectNoteId){
                let [x, y] = note.pos.split('.');
  
                x = Math.min(Math.max(0, +x + dirX), 1920);
                y = Math.min(Math.max(0, +y + dirY), 1080);
                note.pos = `${x}.${y}`;
               
                
                this.clickedNoteElement.style.left = `${x}px`;
                this.clickedNoteElement.style.top = `${y}px`;
            }

        });
    }
  
    summaryRefresh(){
        //이전 노트 제거
        const prevSummaryNotes = document.querySelectorAll(".summaryNote");
        prevSummaryNotes.forEach(note => note.remove());

        //정렬
        this.pattern.sort((a,b) => a.time - b.time);
        //모든 노트 생성
        this.pattern.forEach(({id, type, time, endTime}) => {
            const noteRange = type === NOTE_TYPE.long ? endTime - time : 0;

            const summaryNote = document.createElement('div');
            summaryNote.className = `summaryNote sid-${id} ${id === this.selectNoteId && "highlight"}`;
            //50/2 = 0.5초
            summaryNote.style = `
                left: ${time * SMRY_WIDTH_PER_SEC - SMRY_WIDTH_PER_SEC/2}px;
                width: ${noteRange * SMRY_WIDTH_PER_SEC + SMRY_WIDTH_PER_SEC/2}px;
                background-color: ${type === NOTE_TYPE.long ? '#87ceeb' : type === NOTE_TYPE.slide ? 'orange' : 'white'};
            `;
            //시작, 끝 시간 표시
            const startTimeEle = document.createElement('span');
            startTimeEle.className = `sid-${id}`;
            startTimeEle.style = `font-size : 10px; height:10px`
            startTimeEle.innerText = time.toFixed(2);
            const endTimeEle = document.createElement('span');
            endTimeEle.className = `sid-${id}`;
            endTimeEle.style = `font-size : 10px; height:10px; margin-left: auto;`;
            endTimeEle.innerText = (time + noteRange).toFixed(2);

            //롱노트 치는 타이밍
            if(type === NOTE_TYPE.long){
                const border = document.createElement('div');
                border.className = "summaryLong";
                summaryNote.append(border);
            }

            //클릭이벤트
            summaryNote.addEventListener("click",this.summaryNoteClickEvent);

            summaryNote.appendChild(startTimeEle);
            summaryNote.appendChild(endTimeEle);
            this.summaryScreenElement.appendChild(summaryNote);
        });

    }

    //new Note("slideNote", "11.2", "(1000,700,0)", "12", "false", "")
    export(){
        const ptn =this.pattern.sort((a,b) => a.time - b.time);
        

        //동치 계산
        const samePtn = ptn.map((note,idx) => {
            const copyNote = {...note};

            const prevIdx = idx - 1;
            const nextIdx = idx + 1;
            if(idx !== 0 && ptn[prevIdx].time.toFixed(2) === copyNote.time.toFixed(2)) copyNote.isSame = true;
            else if(idx !== ptn.length - 1 && ptn[nextIdx].time.toFixed(2) === copyNote.time.toFixed(2)) copyNote.isSame = true;
            
            return copyNote;
        });


        //pos계산 (중앙 0,0)
        const posCalcPtn = samePtn.map((note) => {
            const clickX = note.pos.split('.')[0];
            const clickY = note.pos.split('.')[1];
    
            const x = clickX - 960;
            const y = 1080 - clickY - 540;

            return {...note, x,y};
        });

        const result = posCalcPtn.map((note,idx) => `new Note("${NOTE_EXPORT_NAME[note.type]}","${note.time.toFixed(2)}","(${note.x},${note.y},0)","${idx+1}","${note.isSame}","${(note.endTime - note.time).toFixed(1)}")`)
        
        document.querySelector("#exportContent").innerText = result.join(',\n');
        openExportPanel();   
    }

    import(){
        let a = true;
        if(this.pattern.length >= 1){//찍고있는 패턴이 존재하는경우
            a = confirm('주의: 현재 작업이 초기화 됩니다. 계속하시겠습니까?');
        }

        if(a) openImportPanel();
    }

    doImport(){
        try{
            const importValue = document.querySelector('#importContent').value;

            const lines = importValue.trim().split('\n');
            const splitLines = lines.map((line) => line.split('new Note(')[1].split(','));
            
            this.pattern = [];

            splitLines.map((splitLine, i) => {
                const [type, time, posX, posY, posZ, seq, isSame, longTime] = splitLine;
                
                //new Note(id,type,this.sound.seek(), `${x}.${y}`,this.pattern.length, false, this.sound.seek() + noteRange, false));

                const startTime = +time.slice(1,-1);
                // const x = clickX - 960;
                // const y = 1080 - clickY - 540;
                
                const x = +posX.slice(2) + 960;
                const y = 1080-(+posY + 540);
                const endTime = startTime + +longTime.slice(1,-2);

                this.pattern.push(
                    new Note(
                        i, 
                        NOTE_IMPORT_NAME[type.slice(1,-1)],
                        startTime,
                        `${x}.${y}`,
                        i,
                        false,
                        endTime,
                        false
                    )
                );
                
            });
            this.noteIdx = this.pattern.length;
            this.summaryRefresh();

        }catch(e){
            alert('잘못된 형식입니다');
        }
        
        
        
    }

    frame(){
        //시간, 바 표시
        this.playbackRangeElement.value = this.sound.seek() * 100;
        this.changeTimeElement();

        
        this.summaryTimeLineElement.style.left = `${this.sound.seek() * SMRY_WIDTH_PER_SEC}px`;
        //재생바 높이 = 노트 길이, 패딩, 보더(50, 5, 2) * 노트개수 + 상단시간바
        this.summaryTimeLineElement.style.height = `${this.pattern.length * (5 + 2 + SMRY_WIDTH_PER_SEC) + 20}px`
        this.pattern.forEach((note, index) =>{

            //노트 표시
            if(this.sound.seek() <= note.endTime && this.sound.seek() > note.time - 0.5){
                const div =document.querySelector(`.id-${note.id}`);
    
                if(div){
                    return;
                }

                // note.isShow = true;
                //노트생성
                const diamondDiv = document.createElement('div');
                diamondDiv.className = `note diamond id-${note.id} show type-${note.type} ${note.id === this.selectNoteId && "highlight"}`;
                diamondDiv.style = `
                    // width: ${NOTE_SIZE[note.type]}px;
                    // height: ${NOTE_SIZE[note.type]}px;
                    left:${note.pos.split('.')[0]}px;
                    top:${note.pos.split('.')[1]}px;
                    // background-color: ${NOTE_COLOR[note.type]};
                    // transform: translate(-${NOTE_SIZE[note.type] / 2}px, -${NOTE_SIZE[note.type] / 2}px) rotate(45deg);
                    display:flex;
                    justify-content: center;
                    align-items: center;
                `;
                diamondDiv.innerHTML = `
                <div style='transform: rotate(-45deg);' class="note id-${note.id}">${note.id}</div>
                `;
                this.screen.appendChild(diamondDiv);

                //보더생성
                const borderDiv = document.createElement('div');
                borderDiv.className = `noteBorder`;
                borderDiv.style= `
                    left:${note.pos.split('.')[0] -NOTE_SIZE[note.type] / 2}px;
                    top:${note.pos.split('.')[1] - NOTE_SIZE[note.type] / 2}px;
                    width: ${NOTE_SIZE[note.type]}px; /* 초기 크기 */
                    height: ${NOTE_SIZE[note.type]}px; /* 초기 크기 */
                    z-index: -1;
                `;

                setTimeout(() => {
                    borderDiv.classList.add("loaded");
                    
                }, 20);

                setTimeout(() => {
                    borderDiv.remove();
                }, 500);
                
                this.screen.appendChild(borderDiv);
                // borderDiv.classList.add("loaded");
            }
            //TODO: 제거 시간 늦추기
            //노트 제거
            else{
                const deleteNote= document.querySelector(`.id-${note.id}`);
                deleteNote?.remove();
            }
        });

    }
}

function getFormatTime(time){
    const m = `${Math.floor(time / 60)}`.padStart(2,'0');
    const s = `${Math.floor(time % 60)}`.padStart(2,'0');
    const ms = `${time.toFixed(2)}`.split('.')[1];
    
    return `${m}:${s}:${ms ?? '00'}`;
}

function getTimeFromFormatTime(formatTime){
    const sp = formatTime.split(':');
    return +sp[0] * 60 + +sp[1] + (+sp[2])/100;
}

function closeExportPanel() {
    document.querySelector("#exportPanel").style.display = "none";
  }

function openExportPanel(){
    document.querySelector("#exportPanel").style.display = "flex";
}

function closeImportPanel() {
    document.querySelector("#importPanel").style.display = "none";
  }

function openImportPanel(){
    
    document.querySelector("#importPanel").style.display = "flex";

}

function summaryInit(sound){
    //요약 초기화
    summarySongTimeElement = document.querySelector("#summarySongTime");
    summaryScreenElement = document.querySelector("#summaryScreen");
    document.querySelectorAll('.timeUnit').forEach((e)=>e.remove());

    //초 당 px
    summarySongTimeElement.style = `
        width: ${sound.duration() * 51}px;
    `;
    summaryScreenElement.style = `
        width: ${sound.duration() * 51}px;
    `;

    for(let i = 0 ; i < sound.duration();i++){
        const timeUnit = document.createElement('div');
            timeUnit.className = 'timeUnit';
            timeUnit.innerText = i;
        summarySongTimeElement.appendChild(timeUnit);
    }

    song.summaryRefresh();
}

function displayOption(){

    const options = document.querySelectorAll('.option');
   
    options.forEach(optionEle => optionEle.style.display = 'flex');
}

function newSong(){
    const sound = new Howl({
        src: ["./test.mp3"],
        onload: ()=>{
   
            const playback = document.querySelector("#playback");

            //재생바
            playback.max = sound.duration() * 100;
            document.querySelector("#endTime").innerHTML = getFormatTime(sound.duration());

            summaryInit(sound);
            
            
        }
    });
    song = new Song();
    song.init(sound);
}

function addsong(event) {

    song?.unload();

    // Read the file from the input
    if (event.files.length > 0) {

        const file = event.files[0];
        const reader = new FileReader();
  
        reader.addEventListener('load', () => {
      
            const data = reader.result;
   
            // Create a Howler sound
            const sound = new Howl({
              src: [data],
              format: file.name.split('.').pop().toLowerCase(), // always give file extension: this is optional but helps
              onload: ()=>{
                const playback = document.querySelector("#playback");
    
                //재생바
                playback.max = sound.duration() * 100;
                document.querySelector("#endTime").innerHTML = getFormatTime(sound.duration());
    
                summaryInit(sound);
                displayOption();
                },
                
            });

            song = new Song();
            song.init(sound);
            
  
            
        });
        reader.readAsDataURL(file);

        //뒤롤가기 방지
        history.pushState(null, null, location.href); 
        window.onpopstate = function(event) { 
          const cf = confirm('현재 작업이 저장되지 않습니다. 뒤로가시겠습니까?') 
            if(cf) history.back();
            else history.go(1);
        };

        //새로고침, 종료 방지
        window.addEventListener('beforeunload', (event) => {
            // 표준에 따라 기본 동작 방지
            event.preventDefault();
            // Chrome에서는 returnValue 설정이 필요함
            event.returnValue = '';
          });
    }
}