let song = null;

//"노트의 종류", "노트가 생기는 시각", "노트가 생길 좌표", "노트 순서", "동타 여부", "롱노트 일때 지속시간"
class Note{
    constructor(type, time, pos, seq, isSame, longNoteTime, isShow) {
        // this.id = id;
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

    init(sound){
        this.sound = sound;
        this.playbackRangeElement = document.querySelector("#playback");
        this.timeElement = document.querySelector("#playTime");
        this.screen = document.querySelector("#screen");
        

        this.frameInterval = setInterval(()=>{
            this.frame();
        },100);

        this.screen.addEventListener('click',(event)=>{
            const clickX = event.pageX - this.screen.offsetLeft;
            const clickY = event.pageY - this.screen.offsetTop;
            
            console.log(`클릭한 좌표: X=${clickX}, Y=${clickY}`);
            this.addNote("normal",clickX,clickY);
        });
    }



    //"노트의 종류", "노트가 생기는 시각", "노트가 생길 좌표", "노트 순서", "동타 여부", "롱노트 일때 지속시간"
    addNote(type,x, y){
        this.pattern.push(new Note(type,this.sound.seek(), `${x}.${y}`,this.pattern.length, false, 0, false));
        console.log(this.pattern);
        
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
        document.querySelectorAll('.show').forEach(noteEle =>{
            noteEle.remove();
        })

    }

    changeTimeElement(){
        const currentTime = this.sound.seek();
        playTime.innerHTML = getFormatTime(currentTime);
    }

    frame(){
        //시간, 바 표시
        this.playbackRangeElement.value = this.sound.seek() * 100;
        this.changeTimeElement();
        
        this.pattern.forEach((note, index) =>{
            //노트 표시
            if(this.sound.seek() <= note.time && this.sound.seek() > note.time - 0.5){
                const div =document.querySelector(`.id-${index}`);
                if(div){
                    console.log('이미 존재하는 노트');
                    
                    return;
                }
                
                console.log(this.sound.seek(),'에노트찍힘');
                


                note.isShow = true;
                const diamondDiv = document.createElement('div');
                diamondDiv.className = `diamond id-${index} show`;
                diamondDiv.style = `
                left:${note.pos.split('.')[0]}px;
                top:${note.pos.split('.')[1]}px;
                `
                this.screen.appendChild(diamondDiv);
            }
            //TODO: 제거 시간 늦추기
            //노트 제거
            else if(this.sound.seek() > note.time){
                
                const deleteNote= document.querySelector(`.id-${index}`);
                // console.log('제거->',`.id-${index}`, deleteNote);
                
                // deleteNote.className = 'noShow';
                deleteNote?.remove();
                // if(deleteNote) deleteNote.style.display = "none";

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