import Navbar from '../components/Navbar'

export default function HistoryPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Saved Scans</h1>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Prediction</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4">Placeholder</td>
                <td className="p-4">Placeholder</td>
                <td className="p-4">Placeholder</td>
                <td className="p-4">View</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
