const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
const allowedExtensions = [".png", ".jpg", ".jpeg"];

export function isValidImageFile(file) {
  if (!file) return false;

  const mimeValid = allowedTypes.includes(file.type);
  const nameLower = file.name?.toLowerCase() || "";
  const extValid = allowedExtensions.some((ext) => nameLower.endsWith(ext));

  return mimeValid || extValid;
}

export function getReadableFileSize(bytes) {
  if (!bytes && bytes !== 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
