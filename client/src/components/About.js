import React from "react";
import akshit from "../assets/images/akshit.jpeg";
import harshit from "../assets/images/harshit.jpeg";
import darshil from "../assets/images/darshil.jpeg";
import vishnu from "../assets/images/vishnu.jpeg";
import mukund from "../assets/images/mukund.jpeg";
import { motion } from "framer-motion";

const TeamMember = ({ name, image, profileLink }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="relative group w-64 h-80 rounded-xl overflow-hidden shadow-2xl"
  >
    <img 
      src={image} 
      alt={name} 
      className="w-full h-full object-cover transition-transform group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
      <h3 className="text-white text-xl font-bold">{name}</h3>
      {profileLink && (
        <a 
          href={profileLink}
          target="_blank"
          rel="noopener noreferrer" 
          className="text-blue-400 hover:text-blue-300 mt-2"
        >
          View Profile →
        </a>
      )}
    </div>
  </motion.div>
);

function About() {
  return (
    <section id="about-us" className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-6xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-800">
          About us
        </h2>
        
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <p className="text-xl leading-relaxed text-gray-700">
            We're Computer Science students pursuing our B.Tech at MBM UNIVERSITY. Our flagship app,{" "}
            <span className="font-bold text-amber-700">VisionMATE</span>, is designed specifically 
            for visually disabled students. With <span className="font-bold text-amber-700">VisionMATE</span>,
            students can access textbooks, take notes, and understand their surroundings without barriers. 
            The app leverages advanced technologies including speech-to-text, text-to-speech, and object
            detection, ensuring seamless content interaction for all users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 px-8 max-w-7xl mx-auto">
          <TeamMember name="Akshit Jain" image={akshit} profileLink="https://www.linkedin.com/in/akshitjain16/" />
          <TeamMember name="Harshit Soni" image={harshit} />
          <TeamMember name="Mukund Jirawla" image={mukund} />
          <TeamMember name="Darshil" image={darshil} />
          <TeamMember name="Vishnu Jangid" image={vishnu} />
        </div>
      </motion.div>
    </section>
  );
}

export default About;