export default function LoadingSpinner({
  text = "Loading...",
  fullScreen = false,
  small = false
}) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-[70vh]" : "py-8"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className={`animate-spin rounded-full border-4 border-slate-200 border-t-teal-700 ${
            small ? "h-8 w-8" : "h-12 w-12"
          }`}
        />
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
