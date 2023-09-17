let song = null;

class Song{
    sound = null;
    frame = null;
    timeElement = null;
    playbackRangeElement = null;

    init(sound){
        this.sound = sound;
        this.playbackRangeElement = document.querySelector("#playback");
        this.timeElement = document.querySelector("#playTime");

        this.frame = setInterval(()=>{
            console.log(this.sound.seek());
            
            this.playbackRangeElement.value = this.sound.seek();
            this.changeTimeElement();
        },200);
    }

    start(){
        this.sound.play();
        console.log(this.sound.duration());
    }
    
    duration() {
        console.log(this.sound.seek());
    }
    
    changeTime(ele) {
        this.sound.seek(ele.value); //해당 재생 분,초로 이동

        this.changeTimeElement();
        
    }

    changeTimeElement(){
        const m = `${Math.floor(this.playbackRangeElement.value / 60)}`.padStart(2,'0');
        const s = `${this.playbackRangeElement.value % 60}`.padStart(2,'0');
        console.log(this.playbackRangeElement);
        
        playTime.innerHTML = `${m}:${s}`;
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