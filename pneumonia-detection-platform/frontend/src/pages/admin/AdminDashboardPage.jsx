import Navbar from '../../components/Navbar'
import StatCard from '../../components/StatCard'

export default function AdminDashboardPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Users" value="--" />
          <StatCard title="Total Scans" value="--" />
          <StatCard title="Pending Reviews" value="--" />
        </div>
      </main>
    </div>
  )
}
