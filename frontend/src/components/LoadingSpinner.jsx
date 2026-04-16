export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
    </div>
  )
}
