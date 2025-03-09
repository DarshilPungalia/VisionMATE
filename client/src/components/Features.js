import React, { useEffect } from "react";
import ObjectDetection from "../assets/images/ObjectDetection.png";
import TTSF from "../assets/images/tts-feat.png";
import STTF from "../assets/images/stt-feat.png";
import FeatureCard from "./FeatureCard";
import { initializeSpeechHover } from './speechUtils';

function Features() {
  useEffect(() => {
    initializeSpeechHover();
  }, []);
  return (
    <section className="bg-gradient-to-r from-slate-50 to-slate-100 py-20" id="features">
      <div className="container mx-auto px-4">
        <h2 className="speech-hover text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">
          Features
        </h2>
        
        <div className="space-y-24">
          {[
            {
              title: "Object Detection",
              description: "Object detection is a computer vision technique that uses algorithms and neural networks to recognize and locate objects within digital images or videos. It can help visually impaired students identify and understand the objects around them, providing greater access to information and context.",
              image: ObjectDetection,
              link: "/object-detection"
            },
            {
              title: "Text-to-Speech",
              description: "Text-to-speech is a feature that converts written text into spoken words, helping visually impaired students access books and materials. Text-to-speech is an important feature for visually impaired students, as it provides a valuable alternative to traditional reading methods.",
              image: TTSF,
              link: "/tts"
            },
            {
              title: "Speech-to-Text",
              description: "Speech-to-text is a technology that converts spoken words into written text. It helps visually impaired students follow along with conversations and lectures, take notes, and stay organized. Examples include Live Caption and speech-based to-do lists.",
              image: STTF,
              link: "/todo-list"
            }
          ].map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;