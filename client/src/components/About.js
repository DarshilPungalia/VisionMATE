import React from "react";
import akshit from "../assets/images/akshit.jpeg";
import harshit from "../assets/images/harshit.jpeg";
import darshil from "../assets/images/darshil.jpeg";
import vishnu from "../assets/images/vishnu.jpeg";
import mukund from "../assets/images/mukund.jpeg";
import Card from "./Card";
function About() {
  return (
    <section id="about-us" className="mt-6">
      <h3
        className="text-6xl text-black text-center py-3"
        style={{
          fontFamily: `'Inter', sans-serif;`,
          background: `linear-gradient(89.77deg, #E7CCA4 26.41%, #DDA348 91.21%)`,
        }}
      >
        About us
      </h3>
      {/* About us description */}
      <div className="py-10 px-[36px] lg:px-[70px]">
        <p className="text-black text-xl text-justify">
          We're Computer Science students pursuing our B.Tech at MBM UNIVERSITY. Our flagship app,{" "}
          <b>
            <i>VisionMATE,</i>
          </b>
          is designed specifically for visually disabled students. With{" "}
          <b>
            <i>VisionMATE,</i>
          </b>
          students can access textbooks, take notes, can have knowledge about
          things around them all without barriers. The app features advanced
          technologies like speech-to-text, text-to-speech, and object
          detection, to ensure that students can interact with the content in a
          way that works best for them.
        </p>
      </div>
      {/* Cards container */}
      <div className="flex flex-col lg:flex-row items-center lg:justify-evenly gap-4 w-full font-mono overflow-scroll scroll-smooth">
        <Card name={"Akshit Jain"} image={akshit} profileLink={"https://www.linkedin.com/in/akshitjain16/"} />
        <Card
          name={"Harshit Soni"}
          image={harshit}
          profileLink={""}
        />
        <Card name={"Mukund Jirawla"} image={mukund} profileLink={""} />
        <Card name={"Darshil"} image={darshil} profileLink={""} />
        <Card name={"Vishnu Jangid"} image={vishnu} profileLink={""} />
      </div>
    </section>
  );
}

export default About;
