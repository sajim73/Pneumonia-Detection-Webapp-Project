from pathlib import Path


def generate_gradcam(image_path: str, output_path: str):
    Path(output_path).write_bytes(b"")
    return output_path
