export default function StatCard({ title, value, color = 'bg-white' }) {
  return (
    <div className={`${color} rounded-xl shadow-sm p-4 border`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
