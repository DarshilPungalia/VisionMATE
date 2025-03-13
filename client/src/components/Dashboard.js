import React, { useEffect } from "react";
import ObjectCover from "../assets/images/object-detection.png";
import ToDoList from "../assets/images/to-do-list.png";
import TTS from "../assets/images/TTS.png";
import STT from "../assets/images/STT.webp";
import { Link } from "react-router-dom";
import { initializeSpeechHover } from './speechUtils';


function Dashboard() {
  useEffect(() => {
    initializeSpeechHover();
  }, []);
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: "Object Detection", image: ObjectCover, link: "/object-detection", alt: "Object Detection" },
          { title: "Text-to-Speech", image: TTS, link: "/tts", alt: "Text-to-Speech" },
          { title: "Speech-to-Text", image: STT, link: "/stt", alt: "Speech-to-Text" },
          { title: "To Do List", image: ToDoList, link: "https://v0-speech-to-text-technology.vercel.app/",  alt: "To Do List" }
        ].map((item, index) => (
          <a 
            href={item.link} 
            key={index}
            target={item.link.startsWith('http') ? "_blank" : "_self"}
            rel={item.link.startsWith('http') ? "noopener noreferrer" : ""}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="aspect-square">
              <img
                src={item.image}
                alt={item.title}
                className="speech-hover object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h2 className="speech-hover absolute bottom-4 left-4 text-2xl font-bold text-white">
                {item.title}
              </h2>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;