import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/')
    } catch {
      setError('Login failed')
    }
  }

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input className="input" name="password" type="password" placeholder="Password" onChange={handleChange} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="btn-primary w-full">Sign In</button>
      </form>
      <p className="mt-4 text-sm text-center">No account? <Link to="/register" className="text-primary underline">Register</Link></p>
    </AuthLayout>
  )
}
