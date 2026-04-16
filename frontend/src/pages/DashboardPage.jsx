import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Patient Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Scans" value="--" />
          <StatCard title="Last Result" value="--" />
          <StatCard title="Reports Downloaded" value="--" />
        </div>
      </main>
    </div>
  )
}
