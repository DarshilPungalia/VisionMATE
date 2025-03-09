// Create speech utility
const speech = new SpeechSynthesisUtterance();

export const initializeSpeechHover = () => {
  if (!window.speechSynthesis) {
    return;
  }
  // Add hover listeners to elements with 'speech-hover' class
  const hoverElements = document.querySelectorAll('.speech-hover');
  
  hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      // Get text from element or alt text if image
      const textToSpeak = element.tagName === 'IMG' 
        ? element.alt 
        : element.innerText;
        
      speech.text = textToSpeak;
      window.speechSynthesis.speak(speech);
    });

    element.addEventListener('mouseleave', () => {
      window.speechSynthesis.cancel();
    });
  });
};
