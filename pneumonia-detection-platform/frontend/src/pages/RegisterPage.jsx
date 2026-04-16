import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import api from '../api/axios'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'patient' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/api/auth/register', form)
    setMessage('Registration successful')
    setTimeout(() => navigate('/login'), 1000)
  }

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" name="username" placeholder="Username" onChange={handleChange} />
        <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} />
        <select className="input" name="role" onChange={handleChange} defaultValue="patient">
          <option value="patient">Patient</option>
          <option value="admin">Admin</option>
        </select>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button className="btn-primary w-full">Create Account</button>
      </form>
      <p className="mt-4 text-sm text-center">Already have an account? <Link to="/login" className="text-primary underline">Login</Link></p>
    </AuthLayout>
  )
}
