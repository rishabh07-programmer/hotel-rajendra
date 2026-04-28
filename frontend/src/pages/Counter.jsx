import { useState, useEffect } from 'react'
import axios from 'axios'

function Counter() {
  const [activeTab, setActiveTab] = useState('orders')
  const [activeOrders, setActiveOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [menu, setMenu] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [discount, setDiscount] = useState(0)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [variableItem, setVariableItem] = useState(null)
  const [variablePrice, setVariablePrice] = useState('')
  const [qtyItem, setQtyItem] = useState(null)
  const [qtyCount, setQtyCount] = useState(1)

  // Order item price editing state
  const [editingOrderItem, setEditingOrderItem] = useState(null)
  const [editOrderPrice, setEditOrderPrice] = useState('')

  // Menu settings state
  const [editingItem, setEditingItem] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editVariable, setEditVariable] = useState(false)
  const [menuSettingsCategory, setMenuSettingsCategory] = useState('')
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('')
  const [newItemVariable, setNewItemVariable] = useState(false)

  // Waiter management state
  const [waiters, setWaiters] = useState([])
  const [showAddWaiter, setShowAddWaiter] = useState(false)
  const [newWaiterName, setNewWaiterName] = useState('')
  const [newWaiterId, setNewWaiterId] = useState('')
  const [newWaiterPassword, setNewWaiterPassword] = useState('')
  const [editingWaiter, setEditingWaiter] = useState(null)

  // Analytics state
  const [analyticsView, setAnalyticsView] = useState('today')
  const [todaySales, setTodaySales] = useState(null)
  const [monthSales, setMonthSales] = useState(null)
  const [yearSales, setYearSales] = useState(null)
  const [topItems, setTopItems] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const token = sessionStorage.getItem('token')

  const fetchMenu = async () => {
    try {
      const res = await axios.get('https://opt-wireless-clover.ngrok-free.dev/api/menu')
      setMenu(res.data)
      if (res.data.length > 0) {
        setSelectedCategory(res.data[0].category)
        setMenuSettingsCategory(res.data[0].category)
        setNewItemCategory(res.data[0].category)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get('https://opt-wireless-clover.ngrok-free.dev/api/orders/active', {
        headers: { authorization: token }
      })
      setActiveOrders(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchWaiters = async () => {
    try {
      const res = await axios.get('https://opt-wireless-clover.ngrok-free.dev/api/auth/waiters', {
        headers: { authorization: token }
      })
      setWaiters(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchTodaySales = async () => {
    try {
      const res = await axios.get('https://opt-wireless-clover.ngrok-free.dev/api/analytics/today', {
        headers: { authorization: token }
      })
      setTodaySales(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchMonthlySales = async (month, year) => {
    try {
      const res = await axios.get(`https://opt-wireless-clover.ngrok-free.dev/api/analytics/monthly/${year}/${month}`, {
        headers: { authorization: token }
      })
      setMonthSales(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchYearlySales = async (year) => {
    try {
      const res = await axios.get(`https://opt-wireless-clover.ngrok-free.dev/api/analytics/yearly/${year}`, {
        headers: { authorization: token }
      })
      setYearSales(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchTopItems = async () => {
    try {
      const res = await axios.get('https://opt-wireless-clover.ngrok-free.dev/api/analytics/top-items', {
        headers: { authorization: token }
      })
      setTopItems(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchMonthlyTopItems = async (month, year) => {
    try {
      const res = await axios.get(`https://opt-wireless-clover.ngrok-free.dev/api/analytics/top-items?month=${month}&year=${year}`, {
        headers: { authorization: token }
      })
      setTopItems(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchYearlyTopItems = async (year) => {
    try {
      const res = await axios.get(`https://opt-wireless-clover.ngrok-free.dev/api/analytics/top-items?year=${year}`, {
        headers: { authorization: token }
      })
      setTopItems(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchMenu()
    fetchActiveOrders()
    fetchWaiters()
    fetchTodaySales()
    fetchTopItems()
    const interval = setInterval(fetchActiveOrders, 5000)
    const menuInterval = setInterval(fetchMenu, 30000)
    return () => { clearInterval(interval); clearInterval(menuInterval) }
  }, [])

  const addItem = (item) => {
    if (item.variable) { setVariableItem(item); return }
    setQtyItem(item)
    setQtyCount(1)
  }

  const confirmQty = () => {
    if (!qtyItem || qtyCount <= 0) return
    if (selectedOrder) {
      const existingIndex = selectedOrder.items.findIndex(i => i.name === qtyItem.name && i.price === qtyItem.price)
      if (existingIndex >= 0) {
        const updatedItems = [...selectedOrder.items]
        updatedItems[existingIndex].qty += qtyCount
        const newTotal = updatedItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
        setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal })
      } else {
        setSelectedOrder({
          ...selectedOrder,
          items: [...selectedOrder.items, { name: qtyItem.name, price: qtyItem.price, qty: qtyCount }],
          totalAmount: selectedOrder.totalAmount + (qtyItem.price * qtyCount)
        })
      }
    }
    setQtyItem(null)
    setQtyCount(1)
  }

  const addVariableItem = () => {
    if (!variablePrice || variablePrice <= 0) return
    if (selectedOrder) {
      const existingIndex = selectedOrder.items.findIndex(i => i.name === variableItem.name)
      if (existingIndex >= 0) {
        const updatedItems = [...selectedOrder.items]
        updatedItems[existingIndex].qty += 1
        const newTotal = updatedItems.reduce((sum, i) => sum + (i.price * i.qty), 0)
        setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal })
      } else {
        setSelectedOrder({
          ...selectedOrder,
          items: [...selectedOrder.items, { name: variableItem.name, price: parseInt(variablePrice), qty: 1 }],
          totalAmount: selectedOrder.totalAmount + parseInt(variablePrice)
        })
      }
    }
    setVariableItem(null)
    setVariablePrice('')
  }

  const removeItem = (index) => {
    const updatedItems = selectedOrder.items.filter((_, i) => i !== index)
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
    setSelectedOrder({ ...selectedOrder, items: updatedItems, totalAmount: newTotal })
  }

  const sendToKitchen = async () => {
    try {
      if (selectedOrder._id) {
        await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/orders/addItems/${selectedOrder._id}`,
          { items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        const res = await axios.get('https://opt-wireless-clover.ngrok-free.dev/api/orders/active', { headers: { authorization: token } })
        const refreshed = res.data.find(o => o._id === selectedOrder._id)
        if (refreshed) setSelectedOrder(refreshed)
      } else {
        const res = await axios.post('https://opt-wireless-clover.ngrok-free.dev/api/orders/new',
          { tableNumber: selectedOrder.tableNumber, items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        setSelectedOrder(res.data.order)
      }
      setShowMenu(false)
      fetchActiveOrders()
      alert('Order confirmed!')
    } catch (err) { console.log(err) }
  }

  const saveAndBill = async () => {
    try {
      if (selectedOrder._id) {
        await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/orders/addItems/${selectedOrder._id}`,
          { items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/orders/bill/${selectedOrder._id}`, {}, { headers: { authorization: token } })
      } else {
        const res = await axios.post('https://opt-wireless-clover.ngrok-free.dev/api/orders/new',
          { tableNumber: selectedOrder.tableNumber, items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/orders/bill/${res.data.order._id}`, {}, { headers: { authorization: token } })
      }
      printBill()
      setSelectedOrder(null)
      setDiscount(0)
      fetchActiveOrders()
      fetchTodaySales()
    } catch (err) { console.log(err) }
  }

  const cancelOrder = async () => {
    if (!selectedOrder._id) { setSelectedOrder(null); return }
    try {
      await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/orders/cancel/${selectedOrder._id}`, {}, { headers: { authorization: token } })
      setSelectedOrder(null)
      setDiscount(0)
      fetchActiveOrders()
    } catch (err) { console.log(err) }
  }

  const printBill = () => {
    const billWindow = window.open('', '_blank')
    const finalTotal = selectedOrder.totalAmount - discount
    const itemRows = selectedOrder.items.map(item =>
      `<tr><td>${item.name}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">₹${item.price * item.qty}</td></tr>`
    ).join('')
    billWindow.document.write(`<html><head><title>Bill</title><style>body{font-family:monospace;width:280px;margin:0 auto;font-size:13px}h2{text-align:center;margin:4px 0;font-size:15px}p{text-align:center;margin:2px 0;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:8px}td{padding:3px 0}.divider{border-top:1px dashed black;margin:6px 0}.total{font-weight:bold;font-size:14px}.right{text-align:right}</style></head><body><h2>Hotel Rajendra</h2><p>& Sweet Home</p><p>Pargaon</p><div class="divider"></div><p>Table: ${selectedOrder.tableNumber} &nbsp;&nbsp; Date: ${new Date().toLocaleDateString('en-IN')}</p><p>Time: ${new Date().toLocaleTimeString('en-IN')}</p><div class="divider"></div><table><tr><td><b>Item</b></td><td style="text-align:center"><b>Qty</b></td><td style="text-align:right"><b>Amt</b></td></tr>${itemRows}</table><div class="divider"></div><table><tr><td>Subtotal</td><td class="right">₹${selectedOrder.totalAmount}</td></tr>${discount > 0 ? `<tr><td>Discount</td><td class="right">- ₹${discount}</td></tr>` : ''}<tr class="total"><td>Total</td><td class="right">₹${finalTotal}</td></tr></table><div class="divider"></div><p>Thank you for visiting!</p><p>Please visit again</p></body></html>`)
    billWindow.document.close()
    billWindow.print()
  }

  const handleTableSelect = (num) => {
    const existing = activeOrders.find(o => o.tableNumber == num)
    if (existing) { setSelectedOrder(existing); setShowMenu(false); setDiscount(0) }
    else { setSelectedOrder({ tableNumber: num, items: [], totalAmount: 0 }); setShowMenu(true) }
    setShowNewOrder(false)
    setSelectedCategory(menu.length > 0 ? menu[0].category : '')
  }

  const saveItemPrice = async (item) => {
    try {
      await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/menu/update/${item._id}`,
        { price: parseInt(editPrice), variable: editVariable },
        { headers: { authorization: token } }
      )
      setEditingItem(null)
      fetchMenu()
      alert('Price updated!')
    } catch (err) { alert('Failed to update price') }
  }

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/menu/delete/${item._id}`, {}, { headers: { authorization: token } })
      fetchMenu()
    } catch (err) { alert('Failed to delete item') }
  }

  const addNewItem = async () => {
    if (!newItemName || (!newItemVariable && !newItemPrice)) return
    try {
      await axios.post('https://opt-wireless-clover.ngrok-free.dev/api/menu/add',
        { category: newItemCategory, name: newItemName, price: newItemVariable ? 0 : parseInt(newItemPrice), variable: newItemVariable },
        { headers: { authorization: token } }
      )
      setShowAddItem(false)
      setNewItemName('')
      setNewItemPrice('')
      setNewItemVariable(false)
      fetchMenu()
      alert('Item added!')
    } catch (err) { alert('Failed to add item') }
  }

  const addWaiter = async () => {
    if (!newWaiterName || !newWaiterId || !newWaiterPassword) return
    try {
      await axios.post('https://opt-wireless-clover.ngrok-free.dev/api/auth/waiter/create',
        { name: newWaiterName, userId: newWaiterId, password: newWaiterPassword },
        { headers: { authorization: token } }
      )
      setShowAddWaiter(false)
      setNewWaiterName('')
      setNewWaiterId('')
      setNewWaiterPassword('')
      fetchWaiters()
      alert('Waiter added!')
    } catch (err) { alert('Failed to add waiter: ' + err.response?.data?.message) }
  }

  const deleteWaiter = async (id) => {
    if (!window.confirm('Delete this waiter?')) return
    try {
      await axios.post(`https://opt-wireless-clover.ngrok-free.dev/api/auth/waiter/delete/${id}`, {}, { headers: { authorization: token } })
      fetchWaiters()
    } catch (err) { alert('Failed to delete waiter') }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* Top bar with tabs */}
      <div style={{ display: 'flex', backgroundColor: '#e65c00', alignItems: 'center', padding: '8px 16px', gap: '8px' }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '15px', flex: 1 }}>Hotel Rajendra</span>
        <button onClick={() => setActiveTab('orders')} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: activeTab === 'orders' ? 'white' : 'transparent',
          color: activeTab === 'orders' ? '#e65c00' : 'white'
        }}>📋 Orders</button>
        <button onClick={() => setActiveTab('menu')} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: activeTab === 'menu' ? 'white' : 'transparent',
          color: activeTab === 'menu' ? '#e65c00' : 'white'
        }}>⚙ Menu</button>
        <button onClick={() => { setActiveTab('waiters'); fetchWaiters() }} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: activeTab === 'waiters' ? 'white' : 'transparent',
          color: activeTab === 'waiters' ? '#e65c00' : 'white'
        }}>👥 Waiters</button>
        <button onClick={() => { setActiveTab('analytics'); fetchTodaySales() }} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: activeTab === 'analytics' ? 'white' : 'transparent',
          color: activeTab === 'analytics' ? '#e65c00' : 'white'
        }}>📊 Analytics</button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '35%', backgroundColor: '#f5f5f5', padding: '16px', overflowY: 'auto' }}>
            <button onClick={() => setShowNewOrder(true)} style={{
              width: '100%', padding: '12px', backgroundColor: '#e65c00', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '16px'
            }}>+ New Order</button>
            <h3 style={{ marginBottom: '8px' }}>Active Tables</h3>
            {activeOrders.length === 0 && <p style={{ color: '#999' }}>No active orders</p>}
            {activeOrders.map(order => (
              <div key={order._id} onClick={() => { setSelectedOrder(order); setShowMenu(false); setDiscount(0) }}
                style={{
                  backgroundColor: selectedOrder?._id === order._id ? '#e65c00' : 'white',
                  color: selectedOrder?._id === order._id ? 'white' : 'black',
                  padding: '12px', borderRadius: '8px', marginBottom: '8px',
                  cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>Table {order.tableNumber}</b>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <small>{order.items.length} items</small>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {!selectedOrder && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><p style={{ color: '#999', fontSize: '18px' }}>Select a table or create new order</p></div>}
            {selectedOrder && !showMenu && (
              <div>
                <h3>Table {selectedOrder.tableNumber}</h3>
                <button onClick={() => setShowMenu(true)} style={{
                  padding: '8px 16px', backgroundColor: '#333', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px'
                }}>+ Add More Items</button>
                {selectedOrder.items.length === 0 && <p style={{ color: '#999' }}>No items added yet</p>}
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        x{item.qty} × ₹{item.price}
                        <span onClick={() => { setEditingOrderItem(index); setEditOrderPrice(item.price.toString()) }}
                          style={{ color: '#e65c00', marginLeft: '8px', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>
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
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Subtotal</span><span>₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>Discount (₹)</span>
                    <input type='number' value={discount} onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                      style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'right' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Total</span><span>₹{selectedOrder.totalAmount - discount}</span>
                  </div>
                </div>
                <button onClick={sendToKitchen} style={{
                  width: '100%', padding: '16px', backgroundColor: '#e65c00',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '18px', cursor: 'pointer', marginTop: '16px', marginBottom: '8px'
                }}>Confirm Order</button>
                <button onClick={saveAndBill} style={{
                  width: '100%', padding: '16px', backgroundColor: '#2ecc71',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '18px', cursor: 'pointer'
                }}>Print Bill & Close Table</button>
                <button onClick={cancelOrder} style={{
                  width: '100%', padding: '14px', backgroundColor: '#ff4444',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '16px', cursor: 'pointer', marginTop: '8px'
                }}>Cancel Order</button>
              </div>
            )}
            {selectedOrder && showMenu && (
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', display: 'block', marginBottom: '16px' }}>Table {selectedOrder.tableNumber}</span>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {menu.map(cat => (
                    <button key={cat.category} onClick={() => setSelectedCategory(cat.category)}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        backgroundColor: selectedCategory === cat.category ? '#e65c00' : '#ddd',
                        color: selectedCategory === cat.category ? 'white' : 'black'
                      }}>{cat.category}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {menu.find(cat => cat.category === selectedCategory)?.items.map(item => (
                    <button key={item.name} onClick={() => addItem(item)}
                      style={{
                        padding: '12px', backgroundColor: 'white', border: '1px solid #ddd',
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
                      }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.name}</div>
                      <div style={{ color: '#e65c00', fontSize: '13px' }}>{item.variable ? 'Add Price' : `₹${item.price}`}</div>
                    </button>
                  ))}
                </div>
                {selectedOrder.items.length > 0 && (
                  <div onClick={() => setShowMenu(false)} style={{
                    position: 'fixed', bottom: '24px', left: '60%', transform: 'translateX(-50%)',
                    backgroundColor: '#e65c00', color: 'white', padding: '14px 28px',
                    borderRadius: '30px', fontSize: '15px', fontWeight: 'bold',
                    cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 99,
                    boxShadow: '0 4px 12px rgba(230,92,0,0.4)'
                  }}>
                    View Order ({selectedOrder.items.length} items) · ₹{selectedOrder.totalAmount}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MENU SETTINGS TAB */}
      {activeTab === 'menu' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Menu Settings</h3>
            <button onClick={fetchMenu} style={{
              padding: '8px 16px', backgroundColor: '#e65c00', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
            }}>🔄 Refresh Menu</button>
            <button onClick={() => setShowAddItem(true)} style={{
              padding: '10px 20px', backgroundColor: '#e65c00', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>+ Add Item</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {menu.map(cat => (
              <button key={cat.category} onClick={() => setMenuSettingsCategory(cat.category)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  backgroundColor: menuSettingsCategory === cat.category ? '#e65c00' : '#ddd',
                  color: menuSettingsCategory === cat.category ? 'white' : 'black'
                }}>{cat.category}</button>
            ))}
          </div>
          {menu.find(cat => cat.category === menuSettingsCategory)?.items.map(item => (
            <div key={item._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px',
              marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: item.variable ? '#999' : '#e65c00' }}>
                  {item.variable ? 'Variable price' : `₹${item.price}`}
                </div>
              </div>
              {editingItem?._id === item._id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type='checkbox' checked={editVariable} onChange={(e) => setEditVariable(e.target.checked)} />
                    Variable
                  </label>
                  {!editVariable && (
                    <input type='number' value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                      style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
                  )}
                  <button onClick={() => saveItemPrice(item)} style={{
                    padding: '6px 12px', backgroundColor: '#2ecc71', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                  }}>Save</button>
                  <button onClick={() => setEditingItem(null)} style={{
                    padding: '6px 12px', backgroundColor: '#ddd',
                    border: 'none', borderRadius: '6px', cursor: 'pointer'
                  }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setEditingItem(item); setEditPrice(item.price.toString()); setEditVariable(item.variable) }}
                    style={{
                      padding: '6px 14px', backgroundColor: '#e65c00', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer'
                    }}>Edit</button>
                  <button onClick={() => deleteItem(item)} style={{
                    padding: '6px 12px', backgroundColor: '#ff4444', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer'
                  }}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WAITERS TAB */}
      {activeTab === 'waiters' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Waiter Management</h3>
            <button onClick={() => setShowAddWaiter(true)} style={{
              padding: '10px 20px', backgroundColor: '#e65c00', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>+ Add Waiter</button>
          </div>
          {waiters.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center' }}>No waiters added yet</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {waiters.map(waiter => (
                <div key={waiter._id} style={{
                  backgroundColor: 'white', padding: '16px', borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #e65c00'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{waiter.name}</div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '12px' }}>ID: {waiter.userId}</div>
                  <div style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
                    fontSize: '12px', fontWeight: 'bold', marginBottom: '12px',
                    backgroundColor: waiter.status === 'active' ? '#e8f5e9' : '#ffebee',
                    color: waiter.status === 'active' ? '#2ecc71' : '#ff4444'
                  }}>
                    {waiter.status === 'active' ? '✓ Active' : '✗ Inactive'}
                  </div>
                  <button onClick={() => deleteWaiter(waiter._id)} style={{
                    width: '100%', padding: '8px', backgroundColor: '#ff4444', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                  }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f5f5f5' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>📊 Sales Analytics</h2>

          {/* View selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button onClick={() => { setAnalyticsView('today'); fetchTodaySales(); fetchTopItems() }} style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: analyticsView === 'today' ? '#e65c00' : 'white',
              color: analyticsView === 'today' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>📅 Today</button>
            <button onClick={() => { setAnalyticsView('monthly'); fetchMonthlySales(selectedMonth, selectedYear); fetchMonthlyTopItems(selectedMonth, selectedYear) }} style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: analyticsView === 'monthly' ? '#e65c00' : 'white',
              color: analyticsView === 'monthly' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>📆 Monthly</button>
            <button onClick={() => { setAnalyticsView('yearly'); fetchYearlySales(selectedYear); fetchYearlyTopItems(selectedYear) }} style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: analyticsView === 'yearly' ? '#e65c00' : 'white',
              color: analyticsView === 'yearly' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>📈 Yearly</button>
          </div>

          {analyticsView === 'today' && todaySales && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Today's Sales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '12px', border: '2px solid #4caf50', textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Total Sales</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>₹{todaySales.totalSales.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '12px', border: '2px solid #2196f3', textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Orders</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>{todaySales.orderCount}</div>
                </div>
                <div style={{ backgroundColor: '#fff3e0', padding: '16px', borderRadius: '12px', border: '2px solid #ff9800', textAlign: 'center' }}>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Avg per Order</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f57c00' }}>₹{todaySales.orderCount > 0 ? Math.round(todaySales.totalSales / todaySales.orderCount).toLocaleString('en-IN') : '0'}</div>
                </div>
              </div>
            </div>
          )}

          {analyticsView === 'today' && topItems.length > 0 && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Top 5 Items</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {topItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px',
                    borderLeft: `4px solid ${['#ffd700', '#c0c0c0', '#cd7f32', '#e65c00', '#999'][idx]}`
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>#{idx + 1} {item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                      <span>{item.qty} sold</span>
                      <span>₹{item.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analyticsView === 'monthly' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Monthly Sales</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select value={selectedMonth} onChange={(e) => { setSelectedMonth(parseInt(e.target.value)); fetchMonthlySales(parseInt(e.target.value), selectedYear); fetchMonthlyTopItems(parseInt(e.target.value), selectedYear) }}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}>
                  {months.map((m, idx) => <option key={idx} value={idx + 1}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => { setSelectedYear(parseInt(e.target.value)); fetchMonthlySales(selectedMonth, parseInt(e.target.value)); fetchMonthlyTopItems(selectedMonth, parseInt(e.target.value)) }}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {monthSales && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '12px', border: '2px solid #4caf50', textAlign: 'center' }}>
                      <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Total Sales</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>₹{monthSales.totalSales.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '12px', border: '2px solid #2196f3', textAlign: 'center' }}>
                      <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Orders</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>{monthSales.orderCount}</div>
                    </div>
                  </div>
                  {topItems.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '12px', color: '#333' }}>Top Items This Month</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {topItems.slice(0, 5).map((item, idx) => (
                          <div key={idx} style={{
                            backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px',
                            borderLeft: `4px solid ${['#ffd700', '#c0c0c0', '#cd7f32', '#e65c00', '#999'][idx]}`
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>#{idx + 1} {item.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                              <span>{item.qty} sold</span>
                              <span>₹{item.revenue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {analyticsView === 'yearly' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Yearly Sales - {selectedYear}</h3>
              <select value={selectedYear} onChange={(e) => { setSelectedYear(parseInt(e.target.value)); fetchYearlySales(parseInt(e.target.value)); fetchYearlyTopItems(parseInt(e.target.value)) }}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '16px' }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {yearSales && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '12px', border: '2px solid #4caf50', textAlign: 'center' }}>
                      <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Total Sales</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>₹{yearSales.totalSales.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '12px', border: '2px solid #2196f3', textAlign: 'center' }}>
                      <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Orders</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>{yearSales.orderCount}</div>
                    </div>
                  </div>
                  <h4 style={{ marginBottom: '12px', color: '#333' }}>Monthly Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '24px' }}>
                    {yearSales.monthlyData.map((amount, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ddd'
                      }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{months[idx]}</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: amount > 0 ? '#e65c00' : '#999' }}>
                          ₹{(amount / 1000).toFixed(1)}k
                        </div>
                      </div>
                    ))}
                  </div>
                  {topItems.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '12px', color: '#333' }}>Top Items This Year</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {topItems.slice(0, 5).map((item, idx) => (
                          <div key={idx} style={{
                            backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px',
                            borderLeft: `4px solid ${['#ffd700', '#c0c0c0', '#cd7f32', '#e65c00', '#999'][idx]}`
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>#{idx + 1} {item.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                              <span>{item.qty} sold</span>
                              <span>₹{item.revenue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNewOrder && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '360px', maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Select Table</h3>
            <button onClick={() => setShowNewOrder(false)} style={{ backgroundColor: '#ddd', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
          <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '8px', fontSize: '13px' }}>Regular Tables</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {Array.from({ length: 11 }, (_, i) => i + 1).map(num => {
              const isActive = activeOrders.some(o => o.tableNumber == num)
              return (
                <button key={num} onClick={() => handleTableSelect(String(num))} style={{
                  padding: '14px 0', fontSize: '16px', fontWeight: 'bold',
                  backgroundColor: isActive ? '#fff0eb' : 'white',
                  border: isActive ? '2px solid #e65c00' : '2px solid #ddd',
                  borderRadius: '8px', cursor: 'pointer', color: isActive ? '#e65c00' : '#333'
                }}>{num}</button>
              )
            })}
          </div>
          <p style={{ fontWeight: 'bold', color: '#666', marginBottom: '8px', fontSize: '13px' }}>Family Tables</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Array.from({ length: 6 }, (_, i) => `F${i + 1}`).map(num => {
              const isActive = activeOrders.some(o => o.tableNumber == num)
              return (
                <button key={num} onClick={() => handleTableSelect(num)} style={{
                  padding: '14px 0', fontSize: '16px', fontWeight: 'bold',
                  backgroundColor: isActive ? '#fff0eb' : '#fafafa',
                  border: isActive ? '2px solid #e65c00' : '2px solid #ddd',
                  borderRadius: '8px', cursor: 'pointer', color: isActive ? '#e65c00' : '#333'
                }}>{num}</button>
              )
            })}
          </div>
        </div>
      </div>}

      {showAddItem && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '320px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Item</h3>
          <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '15px' }}>
            {menu.map(cat => <option key={cat.category} value={cat.category}>{cat.category}</option>)}
          </select>
          <input type='text' placeholder='Item name' value={newItemName} onChange={(e) => setNewItemName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '15px', boxSizing: 'border-box' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '15px' }}>
            <input type='checkbox' checked={newItemVariable} onChange={(e) => setNewItemVariable(e.target.checked)} />
            Variable price
          </label>
          {!newItemVariable && (
            <input type='number' placeholder='Price (₹)' value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '15px', boxSizing: 'border-box' }} />
          )}
          <button onClick={addNewItem} style={{ width: '100%', padding: '12px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px' }}>Add Item</button>
          <button onClick={() => { setShowAddItem(false); setNewItemName(''); setNewItemPrice('') }} style={{ width: '100%', padding: '12px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>}

      {showAddWaiter && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '320px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add New Waiter</h3>
          <input type='text' placeholder='Waiter name' value={newWaiterName} onChange={(e) => setNewWaiterName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '15px', boxSizing: 'border-box' }} />
          <input type='text' placeholder='User ID' value={newWaiterId} onChange={(e) => setNewWaiterId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '15px', boxSizing: 'border-box' }} />
          <input type='password' placeholder='Password' value={newWaiterPassword} onChange={(e) => setNewWaiterPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '15px', boxSizing: 'border-box' }} />
          <button onClick={addWaiter} style={{ width: '100%', padding: '12px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px' }}>Add Waiter</button>
          <button onClick={() => { setShowAddWaiter(false); setNewWaiterName(''); setNewWaiterId(''); setNewWaiterPassword('') }} style={{ width: '100%', padding: '12px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>}

      {variableItem && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '300px' }}>
          <h3 style={{ marginBottom: '4px' }}>{variableItem.name}</h3>
          <p style={{ color: '#999', marginBottom: '16px' }}>Enter price</p>
          <input type='number' placeholder='₹ Enter amount' value={variablePrice} onChange={(e) => setVariablePrice(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', marginBottom: '12px' }} />
          <button onClick={addVariableItem} style={{ width: '100%', padding: '12px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px' }}>Add to Order</button>
          <button onClick={() => { setVariableItem(null); setVariablePrice('') }} style={{ width: '100%', padding: '12px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>}

      {qtyItem && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '300px' }}>
          <h3 style={{ marginBottom: '4px' }}>{qtyItem.name}</h3>
          <p style={{ color: '#999', marginBottom: '16px' }}>₹{qtyItem.price} each</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <button onClick={() => setQtyCount(Math.max(1, qtyCount - 1))} style={{ width: '40px', height: '40px', fontSize: '20px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#f5f5f5' }}>-</button>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{qtyCount}</span>
            <button onClick={() => setQtyCount(qtyCount + 1)} style={{ width: '40px', height: '40px', fontSize: '20px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#f5f5f5' }}>+</button>
          </div>
          <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '16px' }}>Total: ₹{qtyItem.price * qtyCount}</p>
          <button onClick={confirmQty} style={{ width: '100%', padding: '12px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px' }}>Add to Order</button>
          <button onClick={() => { setQtyItem(null); setQtyCount(1) }} style={{ width: '100%', padding: '12px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>}

      {editingOrderItem !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '280px' }}>
            <h3 style={{ marginBottom: '4px' }}>Change Price</h3>
            <p style={{ color: '#999', marginBottom: '16px' }}>
              {selectedOrder.items[editingOrderItem]?.name}
            </p>
            <input type='number' placeholder='Enter new price'
              value={editOrderPrice} onChange={(e) => setEditOrderPrice(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', marginBottom: '12px' }} />
            <button onClick={() => {
              const updated = [...selectedOrder.items]
              updated[editingOrderItem].price = parseInt(editOrderPrice)
              const newTotal = updated.reduce((sum, i) => sum + (i.price * i.qty), 0)
              setSelectedOrder({ ...selectedOrder, items: updated, totalAmount: newTotal })
              setEditingOrderItem(null)
              setEditOrderPrice('')
            }} style={{
              width: '100%', padding: '12px', backgroundColor: '#e65c00',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginBottom: '8px'
            }}>Confirm</button>
            <button onClick={() => { setEditingOrderItem(null); setEditOrderPrice('') }} style={{
              width: '100%', padding: '12px', backgroundColor: '#ddd',
              border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Counter
