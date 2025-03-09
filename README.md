<h1 align="center">VisionMATE: Sign Language to Text and Speech Conversion</h1>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

</div>

---

<p align="center">
A computer vision-based system that converts American Sign Language (ASL) gestures into text and speech in real-time using CNN and MediaPipe.
</p>

## 📝 Table of Contents

- [Problem Statement](#problem_statement)
- [Solution](#solution)
- [Features](#features)
- [System Architecture](#architecture)
- [Technology Stack](#tech_stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Results](#results)
- [Future Scope](#future_scope)

## 🧐 Problem Statement <a name="problem_statement"></a>

Over 70 million deaf people worldwide use sign language as their primary means of communication. While sign language enables them to communicate within their community, there exists a significant communication barrier with people who don't understand sign language. This creates challenges in their daily interactions, education, work, and access to services.

## 💡 Solution <a name="solution"></a>

VisionMATE provides a real-time sign language interpretation system that:

- Captures hand gestures through a webcam
- Uses MediaPipe for accurate hand landmark detection
- Employs CNN for gesture classification
- Converts recognized gestures to text
- Transforms text to speech output

## ✨ Features <a name="features"></a>

- Real-time hand gesture recognition
- Background-independent processing using MediaPipe landmarks
- Support for American Sign Language alphabet (A-Z)
- 97-99% accuracy in various conditions
- Text and speech output
- User-friendly interface

## 🏗 System Architecture <a name="architecture"></a>

1. **Input Layer**: Webcam capture and hand detection
2. **Processing Layer**:

- MediaPipe hand landmark detection
- Landmark drawing on white background
- CNN-based classification

3. **Output Layer**: Text display and speech synthesis

## ⚡ Technology Stack <a name="tech_stack"></a>

- Python 3.9
- OpenCV
- MediaPipe
- TensorFlow/Keras
- NumPy
- pyttsx3

## 📋 Prerequisites <a name="prerequisites"></a>

- Windows 8 or higher
- Webcam
- PyCharm IDE (recommended)
- Python 3.9

## 🔧 Installation <a name="installation"></a>

```bash
git clone https://github.com/yourusername/VisionMATE.git
```

```bash
cd VisionMATE
```

```bash
pip install opencv-python mediapipe tensorflow numpy pyttsx3
```

## 🎈 Usage <a name="usage"></a>

1. Launch the application
2. Position your hand in front of the webcam
3. Perform ASL gestures
4. View the text interpretation
5. Listen to the speech output

## 📊 Results <a name="results"></a>

- 97% accuracy in varied backgrounds and lighting conditions
- 99% accuracy in optimal conditions
- Real-time processing capability
- Successful classification of similar hand gestures using landmark patterns

## 🚀 Future Scope <a name="future_scope"></a>

- Support for complete sentence construction
- Integration of more sign languages
- Mobile application development
- Real-time two-way communication system
- Support for dynamic gestures
- Cloud-based deployment

## 👥 Contributors

- [Akshit Jain](https://github.com/akshitjain16)
- [Harshit Soni](https://github.com/Harshit-Soni78/)
- [Vishnu Kumar Jangid](https://github.com/vishnujangid88/)
- [Darshil Pungalia](https://github.com/DarshilPungalia)
- [Mukand Jirawla](https://github.com/Mukandjirawla)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
