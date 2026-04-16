import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/api/scan/upload', formData)
    setMessage('Upload successful')
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Upload Scan</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button className="btn-primary">Process Scan</button>
          {message && <p className="text-green-600">{message}</p>}
        </form>
      </main>
    </div>
  )
}
