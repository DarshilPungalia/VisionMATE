# Real-Time Object Detection with YOLOv8 and Flask

This project demonstrates real-time object detection using the YOLOv8 model integrated with a Flask web application. The application captures video input from your camera, performs object detection, and displays the detected objects in real-time.

---

## Features

- **Real-Time Object Detection:** Uses YOLOv8 to detect objects in real-time.
- **Flask Framework Integration:** Displays the video stream and detection results via a web interface.
- **Detection API:** Exposes an API endpoint to fetch the list of detected objects.

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Download the YOLOv8 model weights (yolov8s.pt) from Ultralytics YOLOv8.

## Usage

1. Run the application:

   ```bash
   bash
   ```

2. Open your browser and navigate to `http://127.0.0.1:5000/`.

## API Endpoints

- **GET /video_feed**: Streams the real-time video feed with object detection.
- **GET /get_predictions**: Returns a JSON array of the detected objects.

## Requirements

- Python 3.x
- Flask
- OpenCV
- Ultralytics YOLOv8
- PyTorch

## Project Structure

- `app.py`: Main Flask application.
- `templates/index.html`: Frontend template for the web interface.
- `requirements.txt`: List of dependencies.

## Contributing

Feel free to contribute by submitting issues or pull requests.
