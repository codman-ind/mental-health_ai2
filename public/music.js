let isMusicPlaying = false;

const backgroundMusic = new Audio("/audio/calming-rain-257596.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.06;


function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play();
    }
    isMusicPlaying = !isMusicPlaying;


}


window.addEventListener("load", () => {
    backgroundMusic.play();
    isMusicPlaying = true;
});
