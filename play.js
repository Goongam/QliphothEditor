let song = null;

class Note{
    constructor(type, time, longNoteTime) {
        this.type = type;
        this.time = time;
        this.longNoteTime = longNoteTime;
    }   
}

class Song{
    sound = null;
    frame = null;
    timeElement = null;
    playbackRangeElement = null;
    pattern = [];

    init(sound){
        this.sound = sound;
        this.playbackRangeElement = document.querySelector("#playback");
        this.timeElement = document.querySelector("#playTime");

        this.frame = setInterval(()=>{
            // console.log(this.sound.seek());
            
            this.playbackRangeElement.value = this.sound.seek();
     
            this.changeTimeElement();
        },10);
    }

    start(){
        this.sound.play();
        console.log(this.sound.duration());
    }
    
    pause(){
        this.sound.pause();
    }

    duration() {
        console.log(this.sound.seek());
    }
    
    changeTime(ele) {
        this.sound.seek(ele.value); //해당 재생 분,초로 이동

        this.changeTimeElement();
        
    }

    changeTimeElement(){
        // console.log("vv"+this.playbackRangeElement.value);
        const currentTime = this.sound.seek();

        const m = `${Math.floor(currentTime / 60)}`.padStart(2,'0');
        const s = `${Math.floor(currentTime % 60)}`.padStart(2,'0');
        const ms = `${currentTime}`.split('.')[1]?.slice(0,1);
        
        playTime.innerHTML = `${m}:${s}:${ms ?? '0'}`;
    }
}

function newSong(){
    const sound = new Howl({
        src: ["./test.mp3"],
        onload: ()=>{
            const playback = document.querySelector("#playback");

            playback.max = sound.duration();
        }
    });
    song = new Song();
    song.init(sound);
}