const hoverDiv = document.getElementById("hoverDiv");
const speech = new SpeechSynthesisUtterance();

hoverDiv.addEventListener("mouseenter", () => {
    speech.text = hoverDiv.innerText;
    window.speechSynthesis.speak(speech);
});

hoverDiv.addEventListener("mouseleave", () => {
    audio.pause();
    audio.currentTime = 0;
    window.speechSynthesis.cancel();
});