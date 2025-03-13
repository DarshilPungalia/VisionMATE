import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/LoginSignup";
import Home from "./components/Home";
import PrivateRoute from "./PrivateRoutes";
import ObjectDetection from "./components/ObjectDetection";
import VoiceNavigation from "./components/VoiceNavigation";
import {PDFAudiobook} from "./components/PDFAudiobook";
import STT from "./components/STT";
import ToDoList from "./components/ToDoList";
function Routess() {
  return (
    <BrowserRouter>
      <VoiceNavigation />
      <Routes>
        <Route path="/signin" exact element={<Login element="login" />} />
        <Route path="/signup" exact element={<Login element="signup" />} />
        <Route
          path="/"
          exact
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/object-detection"
          exact
          element={
            <PrivateRoute>
              <ObjectDetection />
            </PrivateRoute>
          }
        />
        <Route
          path="/tts"
          exact
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <PDFAudiobook />
    </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/todo-list"
          exact
          element={
            <PrivateRoute>
              <ToDoList />
            </PrivateRoute>
          }
        />
        <Route
          path="/stt"
          exact
          element={
            <PrivateRoute>
              <STT />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Routess;
