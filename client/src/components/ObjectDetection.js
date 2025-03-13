import React, { useRef, useEffect, useState } from "react";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";
import FeatureTemplate from "./FeatureTemplate";
import Prev from "../assets/images/back.png";

function ObjectDetection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [object, setObject] = useState(null);
  const [prevObjects, setPrevObjects] = useState([]);
  const [lastSpokenTime, setLastSpokenTime] = useState(0);
  const [lastSpokenObject, setLastSpokenObject] = useState(null);

  const runCoco = async () => {
    const net = await cocossd.load({
      base: "mobilenet_v2"
    });
    setInterval(() => {
      detect(net);
    }, 8000);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const objects = await net.detect(video);

      const newObjects = objects.filter(
        (object) =>
          !prevObjects.some((prevObject) => object.class === prevObject.class)
      );

      if (newObjects.length > 0) {
        setObject(newObjects[0].class);
      }
      const ctx = canvasRef.current.getContext("2d");
      setPrevObjects(objects);
      drawRect(objects, ctx);
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      const voices = synth.getVoices();
      const voice = voices.find((v) => v.name === "Daniel");
      utterance.voice = voice;
      synth.speak(utterance);
    }
  };

  const drawRect = (detection, ctx) => {
    detection.forEach((prediction) => {
      const [x, y, width, height] = prediction["bbox"];
      let text = prediction["class"];

      const color = "red";
      ctx.strokeStyle = color;
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";

      ctx.beginPath();
      ctx.fillText(text, x, y);
      ctx.rect(x, y, width, height);
      ctx.stroke();

      const currentTime = Date.now();
      const timeDiff = currentTime - lastSpokenTime;

      // Speak immediately if object changed
      if (text !== lastSpokenObject) {
        speakText(text);
        setLastSpokenTime(currentTime);
        setLastSpokenObject(text);
      } 
      // Repeat same object after 10 seconds
      else if (timeDiff >= 10000) {
        speakText(text);
        setLastSpokenTime(currentTime);
      }

      text = text.toUpperCase();
      let str = text.slice(1, text.length);
      text = text.charAt(0) + str.toLowerCase();
      setObject(text);
    });
  };

  return (
    <FeatureTemplate>
      <div className="mt-4 p-4 lg:h-3/4 h-1/2">
        <div className="flex">
          <Link to="/" className="inline-block">
            <img src={Prev} width={30} height={30} alt="go back" />
          </Link>
          <p className="text-2xl font-semibold inline-block ml-3">
            Object Detection{" "}
          </p>
        </div>
        <div className="my-4 h-[400px] w-[400px] flex justify-center">
          <Webcam
            ref={webcamRef}
            muted={true}
            width={400}
            height={400}
            className="block px-2"
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              borderRadius: "20px",
            }}
          />

          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          />
        </div>

        <div className="h-28 flex justify-center items-start">
          <h1 className="text-2xl inline-block p-2">{object}</h1>
        </div>
      </div>
    </FeatureTemplate>
  );
}

export default ObjectDetection;