import { useState, useEffect } from 'react'
import axios from 'axios'

function Waiter() {
  const [step, setStep] = useState('table')
  const [tableNumber, setTableNumber] = useState('')
  const [menu, setMenu] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [orderItems, setOrderItems] = useState([])
  const [qtyItem, setQtyItem] = useState(null)
  const [qtyCount, setQtyCount] = useState(1)
  const [variableItem, setVariableItem] = useState(null)
  const [variablePrice, setVariablePrice] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [showCustomPrice, setShowCustomPrice] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const [existingOrder, setExistingOrder] = useState(null)
  const [activeOrders, setActiveOrders] = useState([])

  const token = sessionStorage.getItem('token')
  const name = sessionStorage.getItem('name')

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/menu')
        setMenu(res.data)
        if (res.data.length > 0) setSelectedCategory(res.data[0].category)
      } catch (err) {
        console.log(err)
      }
    }
    fetchMenu()
  }, [])

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/orders/active',
          { headers: { authorization: token } }
        )
        setActiveOrders(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchActive()
    const interval = setInterval(fetchActive, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkTable = async (num) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/orders/table/${num}`,
        { headers: { authorization: token } }
      )
      if (res.data) {
        setExistingOrder(res.data)
        setTableNumber(num)
        setStep('tablecheck')
      } else {
        setTableNumber(num)
        setExistingOrder(null)
        setStep('menu')
      }
    } catch (err) {
      setTableNumber(num)
      setExistingOrder(null)
      setStep('menu')
    }
  }

  const addItem = (item) => {
    if (item.variable) {
      setVariableItem(item)
      return
    }
    setQtyItem(item)
    setQtyCount(1)
  }

  const confirmQty = () => {
    if (!qtyItem || qtyCount <= 0) return
    const existingIndex = orderItems.findIndex(i => i.name === qtyItem.name && i.price === qtyItem.price)
    if (existingIndex >= 0) {
      const updated = [...orderItems]
      updated[existingIndex].qty += qtyCount
      setOrderItems(updated)
    } else {
      setOrderItems([...orderItems, { name: qtyItem.name, price: qtyItem.price, qty: qtyCount }])
    }
    setQtyItem(null)
    setQtyCount(1)
  }

  const addVariableItem = () => {
    if (!variablePrice || variablePrice <= 0) return
    const existingIndex = orderItems.findIndex(i => i.name === variableItem.name)
    if (existingIndex >= 0) {
      const updated = [...orderItems]
      updated[existingIndex].qty += 1
      setOrderItems(updated)
    } else {
      setOrderItems([...orderItems, { name: variableItem.name, price: parseInt(variablePrice), qty: 1 }])
    }
    setVariableItem(null)
    setVariablePrice('')
  }

  const changeItemPrice = (index) => {
    setSelectedItemIndex(index)
    setCustomPrice(orderItems[index].price.toString())
    setShowCustomPrice(true)
  }

  const confirmCustomPrice = () => {
    if (!customPrice || customPrice <= 0) return
    const updated = [...orderItems]
    updated[selectedItemIndex].price = parseInt(customPrice)
    setOrderItems(updated)
    setShowCustomPrice(false)
    setCustomPrice('')
    setSelectedItemIndex(null)
  }

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0)

  const sendOrder = async () => {
    if (orderItems.length === 0) return
    try {
      if (existingOrder) {
        await axios.post(`http://localhost:8080/api/orders/addItems/${existingOrder._id}`,
          { items: orderItems },
          { headers: { authorization: token } }
        )
      } else {
        await axios.post('http://localhost:8080/api/orders/new',
          { tableNumber: tableNumber, items: orderItems },
          { headers: { authorization: token } }
        )
      }
      setOrderItems([])
      setExistingOrder(null)
      setStep('success')
    } catch (err) {
      console.log(err)
      alert('Failed to send order: ' + (err.response?.data?.message || 'Server error. Check if backend is running.'))
    }
  }

  const cancelOrder = async () => {
    if (!existingOrder) return
    try {
      await axios.post(`http://localhost:8080/api/orders/cancel/${existingOrder._id}`,
        {},
        { headers: { authorization: token } }
      )
      setExistingOrder(null)
      setOrderItems([])
      setStep('table')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>

      <div style={{ backgroundColor: '#e65c00', padding: '16px', color: 'white' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Hotel Rajendra</h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Waiter: {name}</p>
      </div>

      {step === 'table' && (
        <div style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Select Table</h3>

          <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>Regular Tables</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {Array.from({ length: 11 }, (_, i) => i + 1).map(num => {
              const isActive = activeOrders.some(o => o.tableNumber == num)
              return (
                <button key={num} onClick={() => checkTable(num)}
                  style={{
                    padding: '20px 0', fontSize: '18px', fontWeight: 'bold',
                    backgroundColor: isActive ? '#fff0eb' : 'white',
                    border: isActive ? '2px solid #e65c00' : '2px solid #ddd',
                    borderRadius: '8px', cursor: 'pointer', color: '#e65c00',
                    position: 'relative'
                  }}>
                  {num}
                  {isActive && <div style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: '#e65c00'
                  }}></div>}
                </button>
              )
            })}
          </div>

          <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>Family Tables</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {Array.from({ length: 6 }, (_, i) => `F${i + 1}`).map(num => {
              const isActive = activeOrders.some(o => o.tableNumber == num)
              return (
                <button key={num} onClick={() => checkTable(num)}
                  style={{
                    padding: '20px 0', fontSize: '18px', fontWeight: 'bold',
                    backgroundColor: isActive ? '#fff0eb' : '#fff8f5',
                    border: isActive ? '2px solid #e65c00' : '2px solid #ff9966',
                    borderRadius: '8px', cursor: 'pointer', color: '#e65c00',
                    position: 'relative'
                  }}>
                  {num}
                  {isActive && <div style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: '#e65c00'
                  }}></div>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 'tablecheck' && (
        <div style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>Table {tableNumber}</h3>
          <p style={{ color: '#e65c00', marginBottom: '24px' }}>This table already has an active order</p>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Current Order:</p>
            {existingOrder?.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>{item.name} x{item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '8px' }}>
              <span>Total so far</span>
              <span>₹{existingOrder?.totalAmount}</span>
            </div>
          </div>

          <button onClick={() => setStep('menu')} style={{
            width: '100%', padding: '16px', backgroundColor: '#e65c00',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '16px', cursor: 'pointer', marginBottom: '12px'
          }}>
            + Add More Items
          </button>

          <button onClick={() => setStep('table')} style={{
            width: '100%', padding: '16px', backgroundColor: '#ddd',
            border: 'none', borderRadius: '8px',
            fontSize: '16px', cursor: 'pointer', marginBottom: '12px'
          }}>
            ← Back to Tables
          </button>

          <button onClick={cancelOrder} style={{
            width: '100%', padding: '16px', backgroundColor: '#ff4444',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '16px', cursor: 'pointer'
          }}>
            Cancel Entire Order
          </button>
        </div>
      )}

      {step === 'menu' && (
        <div>
          <div style={{ padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold' }}>Table {tableNumber}</span>
          </div>

          <div style={{ display: 'flex', overflowX: 'auto', padding: '12px 16px', gap: '8px', backgroundColor: 'white' }}>
            {menu.map(cat => (
              <button key={cat.category} onClick={() => setSelectedCategory(cat.category)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  backgroundColor: selectedCategory === cat.category ? '#e65c00' : '#f0f0f0',
                  color: selectedCategory === cat.category ? 'white' : 'black'
                }}>
                {cat.category}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', paddingBottom: '80px' }}>
            {menu.find(cat => cat.category === selectedCategory)?.items.map(item => (
              <button key={item.name} onClick={() => addItem(item)}
                style={{
                  padding: '14px', backgroundColor: 'white', border: '1px solid #ddd',
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
                }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{item.name}</div>
                <div style={{ color: '#e65c00', fontSize: '13px' }}>
                  {item.variable ? 'Add Price' : `₹${item.price}`}
                </div>
              </button>
            ))}
          </div>

          {orderItems.length > 0 && (
            <div onClick={() => setStep('review')} style={{
              position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: '#e65c00', color: 'white', padding: '14px 28px',
              borderRadius: '30px', fontSize: '15px', fontWeight: 'bold',
              cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 99,
              boxShadow: '0 4px 12px rgba(230,92,0,0.4)'
            }}>
              View Order ({orderItems.length} items) · ₹{totalAmount}
            </div>
          )}
        </div>
      )}

      {step === 'review' && (
        <div style={{ padding: '16px' }}>
          <button onClick={() => setStep('menu')} style={{
            padding: '8px 16px', backgroundColor: '#666', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px'
          }}>
            ← Add More Items
          </button>

          <h3 style={{ marginBottom: '12px' }}>Table {tableNumber} — Order Summary</h3>

          {orderItems.length === 0 && <p style={{ color: '#999' }}>No items added</p>}

          {orderItems.map((item, index) => (
            <div key={index} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  x{item.qty} × ₹{item.price}
                  <span onClick={() => changeItemPrice(index)}
                    style={{ color: '#e65c00', marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Change Price
                  </span>
                </div>
              </div>
              <span style={{ fontWeight: 'bold', marginRight: '12px' }}>₹{item.price * item.qty}</span>
              <button onClick={() => removeItem(index)} style={{
                backgroundColor: '#ff4444', color: 'white', border: 'none',
                borderRadius: '4px', padding: '4px 8px', cursor: 'pointer'
              }}>X</button>
            </div>
          ))}

          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <button onClick={sendOrder} style={{
            width: '100%', padding: '16px', backgroundColor: '#2ecc71',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '18px', cursor: 'pointer', marginTop: '16px'
          }}>
            Confirm Order
          </button>
        </div>
      )}

      {step === 'success' && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ color: '#2ecc71', marginBottom: '8px' }}>Order Confirmed!</h2>
          <p style={{ color: '#666', marginBottom: '32px' }}>Table {tableNumber} order confirmed</p>
          <button onClick={() => { setStep('table'); setOrderItems([]) }} style={{
            width: '100%', padding: '16px', backgroundColor: '#e65c00',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '18px', cursor: 'pointer'
          }}>
            Take New Order
          </button>
        </div>
      )}

      {qtyItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '280px' }}>
            <h3 style={{ marginBottom: '4px' }}>{qtyItem.name}</h3>
            <p style={{ color: '#999', marginBottom: '16px' }}>₹{qtyItem.price} each</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
              <button onClick={() => setQtyCount(Math.max(1, qtyCount - 1))} style={{
                width: '44px', height: '44px', fontSize: '22px', borderRadius: '50%',
                border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#f5f5f5'
              }}>-</button>
              <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{qtyCount}</span>
              <button onClick={() => setQtyCount(qtyCount + 1)} style={{
                width: '44px', height: '44px', fontSize: '22px', borderRadius: '50%',
                border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#f5f5f5'
              }}>+</button>
            </div>
            <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '16px' }}>
              Total: ₹{qtyItem.price * qtyCount}
            </p>
            <button onClick={confirmQty} style={{
              width: '100%', padding: '12px', backgroundColor: '#e65c00',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px'
            }}>Add to Order</button>
            <button onClick={() => { setQtyItem(null); setQtyCount(1) }} style={{
              width: '100%', padding: '12px', backgroundColor: '#ddd',
              border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {variableItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '280px' }}>
            <h3 style={{ marginBottom: '4px' }}>{variableItem.name}</h3>
            <p style={{ color: '#999', marginBottom: '16px' }}>Enter price</p>
            <input type='number' placeholder='₹ Enter amount'
              value={variablePrice} onChange={(e) => setVariablePrice(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', marginBottom: '12px' }} />
            <button onClick={addVariableItem} style={{
              width: '100%', padding: '12px', backgroundColor: '#e65c00',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px'
            }}>Add to Order</button>
            <button onClick={() => { setVariableItem(null); setVariablePrice('') }} style={{
              width: '100%', padding: '12px', backgroundColor: '#ddd',
              border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {showCustomPrice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '280px' }}>
            <h3 style={{ marginBottom: '4px' }}>Change Price</h3>
            <p style={{ color: '#999', marginBottom: '16px' }}>
              {selectedItemIndex !== null ? orderItems[selectedItemIndex]?.name : ''}
            </p>
            <input type='number' placeholder='Enter new price'
              value={customPrice} onChange={(e) => setCustomPrice(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', marginBottom: '12px' }} />
            <button onClick={confirmCustomPrice} style={{
              width: '100%', padding: '12px', backgroundColor: '#e65c00',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px'
            }}>Confirm</button>
            <button onClick={() => { setShowCustomPrice(false); setCustomPrice('') }} style={{
              width: '100%', padding: '12px', backgroundColor: '#ddd',
              border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Waiter
