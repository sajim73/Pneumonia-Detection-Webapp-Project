import Navbar from '../components/Navbar'

export default function ReportPreviewPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Report Preview</h1>
        <div className="bg-white rounded-xl shadow p-6 h-[600px] flex items-center justify-center text-gray-400">
          PDF Preview Placeholder
        </div>
      </main>
    </div>
  )
}
