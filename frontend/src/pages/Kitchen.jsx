import { useState, useEffect } from 'react'
import axios from 'axios'

function Kitchen() {
  const [orders, setOrders] = useState([])
  const token = localStorage.getItem('token')

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/orders/active',
        { headers: { authorization: token } }
      )
      setOrders(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.post(`http://localhost:8080/api/orders/status/${id}`,
        { status },
        { headers: { authorization: token } }
      )
      fetchOrders()
    } catch (err) {
      console.log(err)
    }
  }

  const markOrderDone = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/orders/bill/${id}`,
        {},
        { headers: { authorization: token } }
      )
      fetchOrders()
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders()
      setOrders(prev => prev.filter(order => {
        if (order.kitchenStatus === 'ready') {
          const readyTime = new Date(order.updatedAt)
          const now = new Date()
          const minutesSinceReady = Math.floor((now - readyTime) / 60000)
          return minutesSinceReady < 10
        }
        return true
      }))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    if (status === 'received') return '#f39c12'
    if (status === 'ready') return '#2ecc71'
    return '#e74c3c'
  }

  const getStatusLabel = (status) => {
    if (status === 'received') return 'Preparing'
    if (status === 'ready') return 'Ready'
    return 'Pending'
  }

  const getMinutesAgo = (date) => {
    const now = new Date()
    return Math.floor((now - new Date(date)) / 60000)
  }

  const getReadyMinutes = (order) => {
    if (order.kitchenStatus !== 'ready') return null
    const now = new Date()
    const readyTime = new Date(order.updatedAt)
    const minutes = Math.floor((now - readyTime) / 60000)
    return 10 - minutes
  }

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#1a1a1a', padding: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'white', margin: 0 }}>Kitchen Display</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2ecc71' }}></div>
          <span style={{ color: '#2ecc71', fontSize: '14px' }}>Live</span>
        </div>
      </div>

      {orders.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <p style={{ color: '#666', fontSize: '20px' }}>No active orders</p>
        </div>
      )}

      {/* Order cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {orders.map(order => {
          const minutesAgo = getMinutesAgo(order.createdAt)
          const remainingMinutes = getReadyMinutes(order)

          return (
            <div key={order._id} style={{
              backgroundColor: order.kitchenStatus === 'ready' ? '#1a3d2b' :
                minutesAgo >= 15 ? '#3d1a1a' : '#2a2a2a',
              borderRadius: '12px', padding: '16px',
              border: `2px solid ${getStatusColor(order.kitchenStatus)}`
            }}>

              {/* Order header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ color: 'white', margin: 0, fontSize: '22px' }}>
                  Table {order.tableNumber}
                </h3>
                <span style={{
                  backgroundColor: getStatusColor(order.kitchenStatus),
                  color: 'white', padding: '4px 10px',
                  borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
                }}>
                  {getStatusLabel(order.kitchenStatus)}
                </span>
              </div>

              {/* Time info */}
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#999', fontSize: '13px' }}>
                  {minutesAgo === 0 ? 'Just now' : `${minutesAgo} min ago`} · {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {remainingMinutes !== null && (
                  <span style={{
                    color: remainingMinutes <= 3 ? '#e74c3c' : '#2ecc71',
                    fontSize: '13px', marginLeft: '8px', fontWeight: 'bold'
                  }}>
                    · Auto removes in {remainingMinutes} min
                  </span>
                )}
              </div>

              {/* Items */}
              {order.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #333'
                }}>
                  <span style={{ color: 'white', fontSize: '16px' }}>{item.name}</span>
                  <span style={{
                    backgroundColor: '#e65c00', color: 'white',
                    borderRadius: '6px', padding: '2px 10px',
                    fontWeight: 'bold', fontSize: '16px'
                  }}>x{item.qty}</span>
                </div>
              ))}

              {/* Action buttons */}
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.kitchenStatus === 'pending' && (
                  <button onClick={() => updateStatus(order._id, 'received')}
                    style={{
                      width: '100%', padding: '12px', backgroundColor: '#f39c12',
                      color: 'white', border: 'none', borderRadius: '8px',
                      fontSize: '15px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                    Order Received
                  </button>
                )}

                {order.kitchenStatus === 'received' && (
                  <button onClick={() => updateStatus(order._id, 'ready')}
                    style={{
                      width: '100%', padding: '12px', backgroundColor: '#2ecc71',
                      color: 'white', border: 'none', borderRadius: '8px',
                      fontSize: '15px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                    Mark Ready ✓
                  </button>
                )}

                {order.kitchenStatus === 'ready' && (
                  <div style={{
                    width: '100%', padding: '10px', backgroundColor: '#1a5c35',
                    color: '#2ecc71', borderRadius: '8px',
                    fontSize: '15px', textAlign: 'center', fontWeight: 'bold',
                    boxSizing: 'border-box'
                  }}>
                    ✓ Food Ready — Being Served
                  </div>
                )}

                <button onClick={() => markOrderDone(order._id)}
                  style={{
                    width: '100%', padding: '10px', backgroundColor: '#444',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '14px', cursor: 'pointer'
                  }}>
                  Order Done — Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Kitchen