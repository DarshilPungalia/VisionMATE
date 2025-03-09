from flask import Flask, render_template, Response, jsonify
import cv2
from ultralytics import YOLO
import torch

app = Flask(__name__)
model = YOLO("yolov8s.pt")  # Load YOLOv8 model

detected_objects = set()

def generate_frames():
    global detected_objects
    cap = cv2.VideoCapture(0)  # Open the camera
    while True:
        success, frame = cap.read()
        if not success:
            break
        
        results = model(frame)
        detected_objects.clear()
        
        for result in results:
            for cls in result.boxes.cls:
                detected_objects.add(result.names[int(cls)])
        
        for result in results:
            for box in result.boxes.xyxy:
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, ', '.join(detected_objects), (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    cap.release()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_predictions')
def get_predictions():
    return jsonify(list(detected_objects))

if __name__ == '__main__':
    app.run(debug=True)
