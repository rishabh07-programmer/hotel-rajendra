import { useState } from 'react'
import axios from 'axios'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

function Login() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://shark-app-2tu4l.ondigitalocean.app/api/auth/login', {
        userId,
        password
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('name', res.data.name)

      if (res.data.role === 'waiter') window.location.href = '/waiter'
      if (res.data.role === 'owner') window.location.href = '/counter'
      if (res.data.role === 'kitchen') window.location.href = '/kitchen'

    } catch (err) {
      setError('Wrong ID or password')
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '300px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>
          Hotel Rajendra
        </h2>

        <input
          type='text'
          placeholder='Enter your ID'
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />

        <input
          type='password'
          placeholder='Enter password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#e65c00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default Login