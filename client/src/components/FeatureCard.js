import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { initializeSpeechHover } from './speechUtils';
function FeatureCard({ title, description, image, link }) {
    useEffect(() => {
      initializeSpeechHover();
    }, []);
  return (
    <div className="flex px-[36px] lg:px-[70px] mt-10">
      <div className="flex flex-col items-start w-full md:w-10/12">
        <h2
          className="speech-hover text-black font-bold text-2xl"
          style={{ fontFamily: `'Inter', sans-serif` }}
        >
          {title}
        </h2>
        <br />
        <p
          className=" speech-hover text-black text-xl text-justify"
          style={{ fontFamily: `'Inter', sans-serif;` }}
        >
          {description}
          <Link
            to={link}
            className="speech-hover bg-black border-none text-white px-4 py-1 rounded-3xl shadow-2xl text-center block w-32 mt-10"
          >
            Try now
          </Link>
        </p>
      </div>
      <div className="px-15 w-full hidden md:flex justify-end items-center">
        <img class="speech-hover" src={image} width="200px" height="200px" alt="image" />
      </div>
    </div>
  );
}

export default FeatureCard;
