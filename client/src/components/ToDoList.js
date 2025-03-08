import React, { useState, useEffect } from "react";
import FeatureTemplate from "./FeatureTemplate";
import Add from "../assets/images/Add.svg";
import Microphone from "../assets/images/Microphone.svg";
import Speak from "../assets/images/Speak25X20.svg";
import { addToList, getList, deleteItem } from "../api/TodoList_API";
import { Link } from "react-router-dom";
import Prev from "../assets/images/back.png";

function ToDoList() {
  const [text, setText] = useState(null);
  const [listeningText, setListeningText] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [item, setItem] = useState({
    listItem: "",
  });
  const [items, setItems] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false); // Use setIsPlaying
  const [synth, setSynth] = useState(null);

  useEffect(() => {
    populateItems();
  }, []);

  const populateItems = async () => {
    const res = await getList();
    if (res && res.items) { // Check if res and res.items exist
      setItems(res.items);
      let itemLists = res.items.map((item) => item.listItem + "\n");
      itemLists = itemLists.join("");
      setText(itemLists);
    }
  };


  const handleReset = (event) => {
    setText(null);
    setListeningText(null);
    setItem({ listItem: "" });
  };

  const handleAddToList = async (event) => {
    event.preventDefault();
    if (!item.listItem) return;

    let res = await addToList(item);
    if (res.ok) {
      setItem({ listItem: "" });
      setListeningText(null);
      await populateItems();
    } else {
      console.error("Error adding item:", res.status, res.statusText);
      // Handle error, e.g., display an error message to the user
    }
  };

  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    setListeningText(transcript);
    setItem({
      listItem: transcript,
    });
  };

  const handleStart = () => {
    setIsListening(true);
    recognition.start();
  };

  const handleStop = () => {
    setIsListening(false);
    recognition.abort();
  };

  const handleListening = () => {
    if (!isListening) {
      handleStart();
    } else {
      handleStop();
    }
  };

  const handleDelete = async (event) => {
    const res = await deleteItem(event.target.id);
    if (res.error) {
      console.error("Error deleting item:", res.error);
    }
    await populateItems();
  };


  useEffect(() => {
    const initSynth = () => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(" "); // Initialize with empty string
      setSynth(synth);
    };

    if (!synth) {
      initSynth();
    }
  }, [synth]);

  const handleSpeak = () => {
    if (!text) return; // Don't speak if text is empty
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const handleStopSpeaking = () => {
    if (synth && isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      handleStopSpeaking();
    } else {
      handleSpeak();
    }
    setIsPlaying(!isPlaying); // Toggle isPlaying
  };

  return (
    <FeatureTemplate>
      <div className="p-4 h-3/4">
        <div className="flex">
          <Link to="/" className="inline-block">
            <img src={Prev} width={30} height={30} alt="go back" />
          </Link>
          <p className="text-2xl font-semibold  inline-block ml-3">
            Text-to-Speech
          </p>
        </div>
        <br />
        <br />
        <div className="flex items-center justify-center microphone-button">
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
              alt="microphone"
              width="35px"
              className="inline-block"
            />
          </button>
        </div>

        <br />
        <div className="flex flex-col lg:flex-row items-center w-11/12 lg:w-7/12 mx-auto gap-2 lg:items-start">
          <div className="bg-white p-4 w-11/12 lg:w-7/12 mx-2 h-[100px] overflow-scroll">
            <p>
              {listeningText == null
                ? "Press on microphone icon to start listening!"
                : listeningText}
            </p>
          </div>
          <div className="bg-white p-4 w-11/12 lg:w-7/12 mx-2 h-[408px] overflow-scroll relative">
            <h1 className="font-bold border-b-2 border-b-red-500">
              Todo List{" "}
              <img
                src={Speak}
                alt="speak"
                className="inline-block mx-1 w-5 h-5"
                onClick={handlePlay}
              />
            </h1>
            <br />
            <ul style={{ listStyleType: "square" }} className="px-2">
              {items &&
                items.map((item, index) => {
                  return (
                    <li
                      key={item._id}
                      className="px-2"
                      onClick={handleDelete}
                      id={item._id}
                    >
                      {item.listItem}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <br />
        
        <div className="w-11/12 lg:w-7/12 mx-auto flex p-4 justify-start">
          <button
            className="bg-black text-white w-24 px-2 py-1 rounded-md"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="w-24 px-2 py-1 rounded-md mx-3 text-white flex items-center justify-center bg-blue-500"
            onClick={handleAddToList}
          >
            {"Add"}
            <img src={Add} alt="button" className="inline-block ml-3" />
          </button>
        </div>
      </div>
    </FeatureTemplate>
  );
}

export default ToDoList;