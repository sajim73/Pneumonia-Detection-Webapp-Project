import Navbar from '../components/Navbar'

export default function ResultsPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Scan Results</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Original X-ray</h2>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">Image Placeholder</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Grad-CAM Heatmap</h2>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">Heatmap Placeholder</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <p><strong>Prediction:</strong> Placeholder</p>
          <p><strong>Confidence:</strong> Placeholder</p>
        </div>
      </main>
    </div>
  )
}
