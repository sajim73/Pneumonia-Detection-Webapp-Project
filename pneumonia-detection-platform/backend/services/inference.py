import os


def load_model_once():
    model_path = os.getenv("MODEL_PATH", "models_saved/pneumoniaModel.h5")
    return {"status": "placeholder", "model_path": model_path}


MODEL = load_model_once()


def preprocess_image(image_path: str):
    return image_path


def run_inference(image_path: str):
    _ = preprocess_image(image_path)
    return "Pneumonia", 0.95
