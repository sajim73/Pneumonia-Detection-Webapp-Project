def allowed_file(filename: str, allowed_extensions=None):
    if allowed_extensions is None:
        allowed_extensions = {"png", "jpg", "jpeg"}
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions
