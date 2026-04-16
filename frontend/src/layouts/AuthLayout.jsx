export default function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">{title}</h1>
        {children}
      </div>
    </div>
  )
}
