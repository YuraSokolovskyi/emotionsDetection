import sys
from io import BytesIO
import cv2
from keras.models import *
import requests
import numpy as np
import os

classes = [
    "anger",
    "disgust",
    "fear",
    "happiness",
    "neutral",
    "sadness",
]


def processFile():
    result = []

#     model_path = f'{os.getcwd()}\\python\\models\\emotionModel.h5'
    model_path = f'{os.getcwd()}\\python\\models\\model.h5'
    model = load_model(model_path)

    face_cascade = cv2.CascadeClassifier(f"{os.getcwd()}\\python\\models\\haarcascade_frontalface_default.xml")
    image = cv2.imread(sys.argv[1])
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) != 0:
        for (x, y, w, h) in faces:
            face = gray[y:y + h, x:x + w]
            face = cv2.resize(face, (48, 48))
            face = np.expand_dims(face, axis=0)
            prediction = model.predict(face, verbose=0)
            result.append(classes[np.argmax(prediction)])
        return " ".join(result)
    return "noFaceDetected"


def processUrl():
    result = []

    model_path = f'{os.getcwd()}\\python\\models\\emotionModel.h5'
    model = load_model(model_path)

    face_cascade = cv2.CascadeClassifier(f"{os.getcwd()}\\python\\models\\haarcascade_frontalface_default.xml")

    try:
        response = requests.get(sys.argv[1])
        if response.status_code != 200:
            return "invalidUrl"
    except:
        return "invalidUrl"
    image_bytes = BytesIO(response.content)
    image_array = np.asarray(bytearray(image_bytes.read()), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) != 0:
        for (x, y, w, h) in faces:
            face = gray[y:y + h, x:x + w]
            face = cv2.resize(face, (48, 48))
            face = np.expand_dims(face, axis=0)
            prediction = model.predict(face, verbose=0)
            result.append(classes[np.argmax(prediction)])
        return " ".join(result)
    return "noFaceDetected"


def processImage():
    # print(sys.argv)
    if sys.argv[2] == "file":
        print(processFile())
    elif sys.argv[2] == "url":
        print(processUrl())


if __name__ == '__main__':
    processImage()
