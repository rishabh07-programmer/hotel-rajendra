import { useState, useEffect } from 'react'
import axios from 'axios'
import { getAuth, clearAuth } from '../utils/auth'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

function Developer() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = getAuth('developer').token

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const logout = () => {
    clearAuth('developer')
    window.location.href = '/'
  }

  const fetchOwners = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/auth/owners', {
        headers: { authorization: token }
      })
      setOwners(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load active sessions')
    } finally {
      setLoading(false)
    }
  }

  const forceLogoutOwner = async (id) => {
    if (!window.confirm('Force logout this device? The owner will be able to login fresh on any device.')) return
    try {
      await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/auth/owner/force-logout/${id}`, {}, { headers: { authorization: token } })
      fetchOwners()
    } catch (err) {
      alert('Failed to force logout device')
    }
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#1a1a1a', padding: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', margin: 0 }}>Developer Console</h2>
        <button onClick={() => setShowLogoutConfirm(true)} style={{
          padding: '6px 14px', backgroundColor: '#cc0000', color: 'white',
          border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
        }}>Logout</button>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: 'white', margin: 0 }}>Active Sessions — Owner</h3>
          <button onClick={fetchOwners} style={{
            padding: '6px 14px', backgroundColor: '#333', color: 'white',
            border: '1px solid #555', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
          }}>Refresh</button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span style={{ width: '32px', height: '32px', border: '4px solid #333', borderTopColor: '#e65c00', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#999', marginTop: '12px' }}>Loading...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ backgroundColor: '#3d1a1a', border: '1px solid #cc0000', borderRadius: '8px', padding: '16px' }}>
            <p style={{ color: '#ff8a80', margin: 0 }}>{error}</p>
          </div>
        )}

        {!loading && !error && owners.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center' }}>No owner accounts found</p>
        )}

        {!loading && !error && owners.map(owner => (
          <div key={owner._id} style={{
            backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '16px',
            marginBottom: '12px', borderLeft: '4px solid #e65c00'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', marginBottom: '4px' }}>{owner.name}</div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '12px' }}>ID: {owner.userId}</div>

            {owner.deviceId ? (
              <>
                <div style={{ color: '#ccc', fontSize: '13px', marginBottom: '10px' }}>
                  📱 Active on: <strong>{owner.deviceName || 'Unknown device'}</strong>
                </div>
                <button onClick={() => forceLogoutOwner(owner._id)} style={{
                  padding: '8px 16px', backgroundColor: '#ff9800', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
                }}>Force Logout</button>
              </>
            ) : (
              <span style={{ color: '#777', fontSize: '13px' }}>No device linked yet</span>
            )}
          </div>
        ))}
      </div>

      {showLogoutConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', width: '300px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px' }}>Logout</h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>Are you sure you want to logout?</p>
            <button onClick={logout} style={{ width: '100%', padding: '12px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>Yes, Logout</button>
            <button onClick={() => setShowLogoutConfirm(false)} style={{ width: '100%', padding: '12px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Developer
