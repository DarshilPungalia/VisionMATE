import React, { useState, useEffect } from "react";
import FeatureTemplate from "./FeatureTemplate";
import Microphone from "../assets/images/Microphone.svg";
import { Link } from "react-router-dom";
import Prev from "../assets/images/back.png";
import { initializeSpeechHover } from './speechUtils';

function STT() {
  const [listeningText, setListeningText] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const handleReset = (event) => {
    const textBox = document.getElementById("text-box");
    textBox.innerHTML = null;
  };

    useEffect(() => {
      initializeSpeechHover();
    }, []);

  const handleSaveToFile = () => {
    const textBox = document.getElementById("text-box");
    const text = textBox.innerText;
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "speech-to-text.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Speech to text code
  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    setListeningText(transcript);
    const textBox = document.getElementById("text-box");
    const paragraph = document.createElement("p");
    paragraph.innerHTML = " ↳ " + transcript;
    textBox.appendChild(paragraph);
  };

  const handleStart = () => {
    setIsListening(true);
    recognition.start();
    const startMsg = new SpeechSynthesisUtterance("Recording started");
    window.speechSynthesis.speak(startMsg);
  };

  const handleStop = () => {
    setIsListening(false);
    recognition.abort();
    const endMsg = new SpeechSynthesisUtterance("Recording ended");
    window.speechSynthesis.speak(endMsg);
  };

  const handleListening = () => {
    if (!isListening) {
      handleStart();
    } else {
      handleStop();
    }
  };

  // Handle speak function
  const [isPlaying, setisPlaying] = useState(false);
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    const initSynth = () => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const voice = voices.find((v) => v.name === "Daniel");
      const utterance = new SpeechSynthesisUtterance("Hello, World!");
      utterance.voice = voice;
      utterance.rate = 1;
      setSynth(synth);
    };

    if (!synth) {
      initSynth();
    }

    return () => {
      if (synth && isPlaying) {
        synth.cancel();
        setisPlaying(false);
      }
    };
  }, [synth, isPlaying]);

  return (
    <FeatureTemplate>
      <div className="p-4 h-3/4">
        <div className="flex">
          <Link to="/" className="inline-block">
            <img class="speech-hover" src={Prev} width={30} height={30} alt="go back" />
          </Link>
          <p className="speech-hover text-2xl font-semibold inline-block px-2 ml-3">
            Text-to-Speech Page
          </p>
        </div>
        <br />
        <br />
        <div className="flex items-center justify-center microphone-button relative">
          <button
            className={`bg-orange-500 w-28 h-28 py-1 rounded-full text-xl px-6 text-orange-100 items-center inline-block shadow-lg`}
            onClick={handleListening}
            style={
              isListening
                ? {
                    transform: "scale(1.1)",
                    transition: "transform 0.2s ease-in-out",
                  }
                : {
                    transform: "scale(1)",
                    transition: "transform 0.2s ease-in-out",
                  }
            }
          >
            <img

              src={Microphone}
              alt="microphone icon"
              width="35px"
              className="inline-block speech-hover"
            />
            {isListening && (
              <div className="absolute -top-2 -right-2">
                <div className="animate-pulse w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            )}
          </button>
        </div>

        <br />
        <div className="flex items-center w-full mx-auto">
          <div
            className="speech-hover bg-white w-11/12 lg:w-7/12 mx-auto h-[408px] overflow-scroll"
            id="text-box"
          ></div>
        </div>
        <br />
        <div className="w-11/12 lg:w-7/12 mx-auto flex justify-start gap-4">
          <button
            className="speech-hover bg-black text-white w-24 px-2 py-1 rounded-md"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="speech-hover bg-black text-white w-24 px-2 py-1 rounded-md"
            onClick={handleSaveToFile}
          >
            Save
          </button>
        </div>
      </div>
    </FeatureTemplate>
  );
}

export default STT;