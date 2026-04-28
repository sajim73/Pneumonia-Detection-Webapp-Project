import os
import uuid

import cv2
import numpy as np
import tensorflow as tf
from flask import current_app
from PIL import Image

from services.inference import get_model, prepare_image


def _get_last_conv_layer(model):
    """Return the last Conv2D layer, works for Sequential and Functional models."""
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer
    raise ValueError("No Conv2D layer found in model for Grad-CAM.")


def _make_heatmap(batch, model, target_layer, class_index=None):
    """
    Compute Grad-CAM heatmap by watching the target conv layer output directly.
    This works for both Sequential and Functional models because it does NOT
    require building a sub-Model (which fails on unbuilt Sequential models).
    """
    with tf.GradientTape() as tape:
        x = batch
        conv_outputs = None

        for layer in model.layers:
            x = layer(x)
            if layer.name == target_layer.name:
                conv_outputs = x
                tape.watch(conv_outputs)

        predictions = x  # final output after all layers

        if predictions.shape[-1] == 1:
            class_channel = predictions[:, 0]
        else:
            if class_index is None:
                class_index = int(tf.argmax(predictions[0]))
            class_channel = predictions[:, class_index]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    heatmap = conv_outputs[0] @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0)

    max_val = tf.reduce_max(heatmap)
    if float(max_val) > 0:
        heatmap = heatmap / max_val

    return heatmap.numpy()


def generate_gradcam_assets(image_path: str, class_index: int = None):
    model = get_model()
    batch, preprocess_mode, _ = prepare_image(image_path)

    target_layer = _get_last_conv_layer(model)

    heatmap = _make_heatmap(batch, model, target_layer, class_index=class_index)

    original = Image.open(image_path).convert("RGB")
    original_np = np.array(original)
    h, w = original_np.shape[:2]

    heatmap_uint8 = np.uint8(255 * heatmap)
    heatmap_resized = cv2.resize(heatmap_uint8, (w, h))
    heatmap_color = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)

    original_bgr = cv2.cvtColor(original_np, cv2.COLOR_RGB2BGR)
    overlay = cv2.addWeighted(original_bgr, 0.65, heatmap_color, 0.35, 0)

    os.makedirs(current_app.config["HEATMAP_FOLDER"], exist_ok=True)

    base_name = uuid.uuid4().hex
    heatmap_filename = f"heatmap_{base_name}.png"
    overlay_filename = f"overlay_{base_name}.png"

    heatmap_path = os.path.join(current_app.config["HEATMAP_FOLDER"], heatmap_filename)
    overlay_path = os.path.join(current_app.config["HEATMAP_FOLDER"], overlay_filename)

    cv2.imwrite(heatmap_path, heatmap_color)
    cv2.imwrite(overlay_path, overlay)

    return {
        "heatmap_filename": heatmap_filename,
        "overlay_filename": overlay_filename,
        "heatmap_path": heatmap_path,
        "overlay_path": overlay_path,
        "gradcam_layer": target_layer.name,
        "preprocess_mode": preprocess_mode,
    }
