import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from typing import Dict, Tuple

import gdown
import numpy as np
import tensorflow as tf
from PIL import Image
from flask import current_app


_MODEL_CACHE = {
    "model": None,
    "model_path": None,
}


def ensure_model_exists():
    model_path = current_app.config["MODEL_PATH"]
    model_dir = current_app.config["MODEL_FOLDER"]
    drive_id = current_app.config.get("MODEL_GOOGLE_DRIVE_ID")

    os.makedirs(model_dir, exist_ok=True)

    if os.path.exists(model_path):
        return model_path

    if not drive_id:
        raise FileNotFoundError(
            "Model file is missing and MODEL_GOOGLE_DRIVE_ID is not configured."
        )

    url = f"https://drive.google.com/uc?id={drive_id}"
    gdown.download(url, model_path, quiet=False)

    if not os.path.exists(model_path):
        raise FileNotFoundError("Model download failed.")

    return model_path


def get_model():
    model_path = ensure_model_exists()

    if _MODEL_CACHE["model"] is None or _MODEL_CACHE["model_path"] != model_path:
        _MODEL_CACHE["model"] = tf.keras.models.load_model(model_path, compile=False)
        _MODEL_CACHE["model_path"] = model_path

    return _MODEL_CACHE["model"]


def get_input_size(model=None) -> Tuple[int, int]:
    model = model or get_model()
    shape = model.input_shape

    if isinstance(shape, list):
        shape = shape[0]

    height = shape[1] if len(shape) > 2 and shape[1] else 224
    width = shape[2] if len(shape) > 2 and shape[2] else 224
    return int(width), int(height)


def _apply_preprocess(batch: np.ndarray, mode: str) -> np.ndarray:
    mode = (mode or "rescale_255").lower()

    if mode == "rescale_255":
        return batch / 255.0

    if mode == "densenet":
        return tf.keras.applications.densenet.preprocess_input(batch)

    if mode == "mobilenet_v2":
        return tf.keras.applications.mobilenet_v2.preprocess_input(batch)

    raise ValueError(
        "Unsupported MODEL_PREPROCESS_MODE. Use one of: "
        "rescale_255, densenet, mobilenet_v2"
    )


def prepare_image(image_path: str, preprocess_mode: str = None):
    model = get_model()
    width, height = get_input_size(model)

    image = Image.open(image_path).convert("RGB")
    resized = image.resize((width, height))
    arr = np.asarray(resized).astype("float32")
    batch = np.expand_dims(arr, axis=0)

    preprocess_mode = preprocess_mode or current_app.config["MODEL_PREPROCESS_MODE"]
    batch = _apply_preprocess(batch, preprocess_mode)

    return batch, preprocess_mode, (width, height)


def predict_image(image_path: str) -> Dict:
    model = get_model()
    batch, preprocess_mode, input_size = prepare_image(image_path)

    preds = model.predict(batch, verbose=0)
    preds = np.array(preds)

    class_names = current_app.config.get("CLASS_NAMES", ["Normal", "Pneumonia"])

    if preds.ndim == 2 and preds.shape[1] == 2:
        normal_prob = float(preds[0][0])
        pneumonia_prob = float(preds[0][1])
        predicted_idx = int(np.argmax(preds[0]))
        confidence = float(preds[0][predicted_idx])

    elif preds.ndim == 2 and preds.shape[1] == 1:
        pneumonia_prob = float(preds[0][0])
        normal_prob = float(1.0 - pneumonia_prob)
        predicted_idx = 1 if pneumonia_prob >= 0.5 else 0
        confidence = max(normal_prob, pneumonia_prob)

    else:
        raise ValueError(f"Unexpected model output shape: {preds.shape}")

    predicted_label = class_names[predicted_idx]

    return {
        "predicted_index": predicted_idx,
        "predicted_label": predicted_label,
        "confidence": confidence,
        "normal_probability": normal_prob,
        "pneumonia_probability": pneumonia_prob,
        "preprocess_mode": preprocess_mode,
        "input_size": {
            "width": input_size[0],
            "height": input_size[1],
        },
        "model_version": current_app.config.get("MODEL_VERSION"),
    }
