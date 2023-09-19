

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

//"노트의 종류", "노트가 생기는 시각", "노트가 생길 좌표", "노트 순서", "동타 여부", "롱노트 일때 지속시간"
class Note{
    constructor(id, type, time, pos, seq, isSame, longNoteTime, isShow) {
        this.id = id;
        this.type = type;
        this.time = time;
        this.pos = pos;
        this.seq = seq;
        this.isSame = isSame;
        this.longNoteTime = longNoteTime;
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


    init(sound){
        this.sound = sound;
        this.playbackRangeElement = document.querySelector("#playback");
        this.timeElement = document.querySelector("#playTime");
        this.screen = document.querySelector("#screen");
        this.noteTypeElement = document.querySelector("#selectedNoteType");
        this.noteTypeBtn = document.querySelectorAll(".noteTypeBtn");
        this.noteIdx = 0;

        this.selectNoteId = undefined;


        this.selectNoteType = NOTE_TYPE.normal1;


        this.frameInterval = setInterval(()=>{
            this.frame();
        },100);

        this.screen.addEventListener('click',(event)=>{
            const clickX = event.pageX - this.screen.offsetLeft;
            const clickY = event.pageY - this.screen.offsetTop;
            
            const elementClicked = document.elementFromPoint(event.pageX, event.pageY);
        
            //다른 노트와 겹치는 경우
            if (elementClicked && elementClicked.classList.contains('diamond')) {
                elementClicked.classList.forEach(className => {
                    if(className.startsWith('id')){
                        this.setNoteDetail(className.split('id-')[1]);
                    }
                })
                
            } else { //다른 노트와 겹치지 않는 경우
                this.addNote(this.selectNoteType,clickX,clickY);
                console.log('클릭한 위치에 diamond 클래스를 가진 요소가 없습니다.');
            }        
        });
    }



    //"노트의 종류", "노트가 생기는 시각", "노트가 생길 좌표", "노트 순서", "동타 여부", "롱노트 일때 지속시간"
    addNote(type,x, y){
        this.pattern.push(new Note(this.noteIdx++,type,this.sound.seek(), `${x}.${y}`,this.pattern.length, false, 0, false));
        console.log(this.pattern);
        
    }
    deleteNote(){
        this.pattern = this.pattern.filter(note => note.id != this.selectNoteId);
        
        const deleteNote= document.querySelector(`.id-${this.selectNoteId}`);
        deleteNote?.remove();

        this.selectNoteId = undefined;

        document.querySelector("#detailID").className = 'inactive';
        document.querySelector('#noteDetail').className = 'inactive';
        document.querySelector("#detailType").className = 'inactive';
        document.querySelector("#detailTime").className = 'inactive';
        document.querySelector("#detailEndTime").className = 'inactive';
        document.querySelector("#detailDeleteBtn").className = 'inactive';

        document.querySelector("#detailID").innerText = '-';
        document.querySelector("#detailType").value = '';
        document.querySelector("#detailTime").value = getFormatTime(0);
        document.querySelector("#detailEndTime").value = getFormatTime(0);

    }


    start(){
        this.sound.play();
    }
    
    pause(){
        this.sound.pause();
    }

    duration() {
        console.log(this.sound.seek());
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
        })

    }

    

    setNoteDetail(noteId){
        
        // console.log(this.pattern);
        
        this.pattern.forEach((note)=>{
           if( note.id == +noteId){
            console.log("클릭한 노트:",note);

            this.selectNoteId = note.id;


            document.querySelector('#noteDetail').className = 'active';
            document.querySelector("#detailType").className = 'active';
            document.querySelector("#detailTime").className = 'active';
            document.querySelector("#detailEndTime").className = 'active';
            document.querySelector("#detailDeleteBtn").className = 'active';

            document.querySelector("#detailID").className = 'active';

            document.querySelector("#detailID").innerText = note.id;
            document.querySelector("#detailType").value = note.type;
            document.querySelector("#detailTime").value = getFormatTime(note.time);
            document.querySelector("#detailEndTime").value = getFormatTime(note.time);
            
           }
        });

    }

    frame(){
        //시간, 바 표시
        this.playbackRangeElement.value = this.sound.seek() * 100;
        this.changeTimeElement();
        
        

        this.pattern.forEach((note, index) =>{

            // console.log(this.sound.seek() ,note.time);
            

            //노트 표시
            if(this.sound.seek() <= note.time && this.sound.seek() > note.time - 0.5){
                const div =document.querySelector(`.id-${note.id}`);
    
                if(div){
                    // console.log('이미 존재하는 노트');
                    return;
                }

                // note.isShow = true;
                //노트생성
                const diamondDiv = document.createElement('div');
                diamondDiv.className = `diamond id-${note.id} show`;
                diamondDiv.style = `
                    width: ${NOTE_SIZE[note.type]}px;
                    height: ${NOTE_SIZE[note.type]}px;
                    left:${note.pos.split('.')[0]}px;
                    top:${note.pos.split('.')[1]}px;
                    background-color: ${NOTE_COLOR[note.type]};
                    transform: translate(-${NOTE_SIZE[note.type] / 2}px, -${NOTE_SIZE[note.type] / 2}px) rotate(45deg);
                    display:flex;
                    justify-content: center;
                    align-items: center;
                `;
                diamondDiv.innerHTML = `
                <div style="transform: rotate(-45deg);">${note.id}</div>`;
                this.screen.appendChild(diamondDiv);

                //보더생성
                const borderDiv = document.createElement('div');
                borderDiv.className = `noteBorder`;
                borderDiv.style= `
                    left:${note.pos.split('.')[0] -NOTE_SIZE[note.type] / 2}px;
                    top:${note.pos.split('.')[1] - NOTE_SIZE[note.type] / 2}px;
                    width: ${NOTE_SIZE[note.type]}px; /* 초기 크기 */
                    height: ${NOTE_SIZE[note.type]}px; /* 초기 크기 */
                `;

                setTimeout(() => {
                    // const element = document.querySelector(".noteBorder");
                    borderDiv.classList.add("loaded");
                }, 1);

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
    const ms = `${time}`.split('.')[1]?.slice(0,1);

    return `${m}:${s}:${ms ?? '0'}`;
}

function newSong(){
    const sound = new Howl({
        src: ["./test.mp3"],
        onload: ()=>{
            const playback = document.querySelector("#playback");

            playback.max = sound.duration() * 100;
            document.querySelector("#endTime").innerHTML = getFormatTime(sound.duration());
        }
    });
    song = new Song();
    song.init(sound);
}