import { useState, useEffect } from 'react'
import axios from 'axios'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'

const PRINT_WIDTH = 32

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
  const [menuSearchQuery, setMenuSearchQuery] = useState('')

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

  // Bills state
  const [billedOrders, setBilledOrders] = useState([])
  const [voidedOrders, setVoidedOrders] = useState([])
  const [showVoidModal, setShowVoidModal] = useState(false)
  const [voidingOrder, setVoidingOrder] = useState(null)
  const [voidReason, setVoidReason] = useState('')
  const [voidingLoading, setVoidingLoading] = useState(false)
  const [voidError, setVoidError] = useState('')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')
  const [waitersLoading, setWaitersLoading] = useState(false)
  const [waitersError, setWaitersError] = useState('')

  const token = localStorage.getItem('token')

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [confirmingOrder, setConfirmingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [savingBill, setSavingBill] = useState(false)
  const [billError, setBillError] = useState('')
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [receiptText, setReceiptText] = useState('')

  const logout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  const fetchMenu = async () => {
    try {
      const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/menu')
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
      const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/orders/active', {
        headers: { authorization: token }
      })
      setActiveOrders(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const fetchWaiters = async () => {
    setWaitersLoading(true)
    setWaitersError('')
    try {
      console.log('[Waiters] GET /api/auth/waiters')
      const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/auth/waiters', {
        headers: { authorization: token }
      })
      console.log('[Waiters] Response:', res.data)
      setWaiters(res.data)
    } catch (err) {
      console.error('[Waiters] Error:', err?.response?.status, err?.response?.data || err?.message)
      if (err?.response?.status === 401) setWaitersError('Session expired — please logout and login again.')
      else if (err?.response?.status === 403) setWaitersError('Not authorized — owner login required.')
      else setWaitersError(err?.response?.data?.message || 'Failed to load waiters. Check your connection.')
    } finally {
      setWaitersLoading(false)
    }
  }

  const fetchTodaySales = async () => {
    console.log('[Analytics] GET /api/analytics/today')
    const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/analytics/today', {
      headers: { authorization: token }
    })
    console.log('[Analytics] Today:', res.data)
    setTodaySales(res.data)
  }

  const fetchMonthlySales = async (month, year) => {
    console.log(`[Analytics] GET /api/analytics/monthly/${year}/${month}`)
    const res = await axios.get(`https://shark-app-2tu4l.ondigitalocean.app/api/analytics/monthly/${year}/${month}`, {
      headers: { authorization: token }
    })
    console.log('[Analytics] Monthly:', res.data)
    setMonthSales(res.data)
  }

  const fetchYearlySales = async (year) => {
    console.log(`[Analytics] GET /api/analytics/yearly/${year}`)
    const res = await axios.get(`https://shark-app-2tu4l.ondigitalocean.app/api/analytics/yearly/${year}`, {
      headers: { authorization: token }
    })
    console.log('[Analytics] Yearly:', res.data)
    setYearSales(res.data)
  }

  const fetchBilledToday = async () => {
    try {
      const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/orders/billed/today', {
        headers: { authorization: token }
      })
      setBilledOrders(res.data)
    } catch (err) { console.log(err) }
  }

  const fetchVoidedOrders = async () => {
    try {
      const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/orders/voided', {
        headers: { authorization: token }
      })
      setVoidedOrders(res.data)
    } catch (err) { console.log(err) }
  }

  const voidOrder = async () => {
    if (!voidingOrder) return
    setVoidingLoading(true)
    setVoidError('')
    try {
      await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/orders/void/${voidingOrder._id}`,
        { voidReason },
        { headers: { authorization: token } }
      )
      setShowVoidModal(false)
      setVoidingOrder(null)
      setVoidReason('')
      fetchBilledToday()
      fetchVoidedOrders()
      fetchTodaySales().catch(e => console.error('[BG] fetchTodaySales:', e?.message))
    } catch (err) {
      setVoidError(err?.response?.data?.message || 'Failed to void bill. Try again.')
    } finally {
      setVoidingLoading(false)
    }
  }

  const fetchTopItems = async () => {
    console.log('[Analytics] GET /api/analytics/top-items')
    const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/analytics/top-items', {
      headers: { authorization: token }
    })
    console.log('[Analytics] TopItems:', res.data)
    setTopItems(res.data)
  }

  const fetchMonthlyTopItems = async (month, year) => {
    const res = await axios.get(`https://shark-app-2tu4l.ondigitalocean.app/api/analytics/top-items?month=${month}&year=${year}`, {
      headers: { authorization: token }
    })
    setTopItems(res.data)
  }

  const fetchYearlyTopItems = async (year) => {
    const res = await axios.get(`https://shark-app-2tu4l.ondigitalocean.app/api/analytics/top-items?year=${year}`, {
      headers: { authorization: token }
    })
    setTopItems(res.data)
  }

  const loadAnalytics = async (view, month, year) => {
    setAnalyticsLoading(true)
    setAnalyticsError('')
    try {
      const m = month ?? selectedMonth
      const y = year ?? selectedYear
      if (view === 'today') {
        await Promise.all([fetchTodaySales(), fetchTopItems()])
      } else if (view === 'monthly') {
        await Promise.all([fetchMonthlySales(m, y), fetchMonthlyTopItems(m, y)])
      } else if (view === 'yearly') {
        await Promise.all([fetchYearlySales(y), fetchYearlyTopItems(y)])
      }
    } catch (err) {
      console.error('[Analytics] Load error:', err?.response?.status, err?.response?.data || err?.message)
      if (err?.response?.status === 401) setAnalyticsError('Session expired — please logout and login again.')
      else if (err?.response?.status === 403) setAnalyticsError('Not authorized — owner login required.')
      else setAnalyticsError(err?.response?.data?.message || 'Failed to load analytics. Check your connection.')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
    fetchActiveOrders()
    fetchWaiters()
    loadAnalytics('today')
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
    if (selectedOrder.items.length === 0) return
    setConfirmingOrder(true)
    setOrderError('')

    const attempt = async () => {
      if (selectedOrder._id) {
        await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/orders/addItems/${selectedOrder._id}`,
          { items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        const res = await axios.get('https://shark-app-2tu4l.ondigitalocean.app/api/orders/active', { headers: { authorization: token } })
        const refreshed = res.data.find(o => o._id === selectedOrder._id)
        if (refreshed) setSelectedOrder(refreshed)
      } else {
        const res = await axios.post('https://shark-app-2tu4l.ondigitalocean.app/api/orders/new',
          { tableNumber: selectedOrder.tableNumber, items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        setSelectedOrder(res.data.order)
      }
    }

    for (let i = 0; i <= 2; i++) {
      try {
        await attempt()
        setShowMenu(false)
        fetchActiveOrders()
        setConfirmingOrder(false)
        alert('Order confirmed!')
        return
      } catch (err) {
        if (i < 2) {
          await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        } else {
          setConfirmingOrder(false)
          const msg = err?.response?.data?.message || err?.message || 'Network error'
          setOrderError(`Failed after 3 attempts: ${msg}`)
        }
      }
    }
  }

  const saveAndBill = async () => {
    setSavingBill(true)
    setBillError('')
    try {
      if (selectedOrder._id) {
        await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/orders/addItems/${selectedOrder._id}`,
          { items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/orders/bill/${selectedOrder._id}`, {}, { headers: { authorization: token } })
      } else {
        const res = await axios.post('https://shark-app-2tu4l.ondigitalocean.app/api/orders/new',
          { tableNumber: selectedOrder.tableNumber, items: selectedOrder.items },
          { headers: { authorization: token } }
        )
        await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/orders/bill/${res.data.order._id}`, {}, { headers: { authorization: token } })
      }
      printBill()
      setSelectedOrder(null)
      setDiscount(0)
      fetchActiveOrders()
      fetchTodaySales().catch(e => console.error('[BG] fetchTodaySales:', e?.message))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Network error'
      setBillError(`Bill not saved — ${msg}. Please try again.`)
    } finally {
      setSavingBill(false)
    }
  }

  const cancelOrder = async () => {
    if (!selectedOrder._id) { setSelectedOrder(null); return }
    try {
      await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/orders/cancel/${selectedOrder._id}`, {}, { headers: { authorization: token } })
      setSelectedOrder(null)
      setDiscount(0)
      fetchActiveOrders()
    } catch (err) { console.log(err) }
  }

  const printBill = () => {
    const finalTotal = selectedOrder.totalAmount - discount

    // ESC/POS control sequences. ESC is byte 27; 'a'/'E' are the literal
    // command-letter bytes (97/69), not passed through fromCharCode, so the
    // alignment/emphasis bytes come out correctly.
    const ESC = String.fromCharCode(27)
    const ALIGN_CENTER = ESC + 'a' + String.fromCharCode(1)
    const ALIGN_LEFT = ESC + 'a' + String.fromCharCode(0)
    const BOLD_ON = ESC + 'E' + String.fromCharCode(1)
    const BOLD_OFF = ESC + 'E' + String.fromCharCode(0)

    // Center a line of text within PRINT_WIDTH (for text printed under ALIGN_LEFT)
    const center = (text) => {
      const pad = Math.max(0, Math.floor((PRINT_WIDTH - text.length) / 2))
      return ' '.repeat(pad) + text
    }

    // Full-width divider
    const divider = () => '-'.repeat(PRINT_WIDTH)

    // Left-align `left`, right-align `right`, fill the middle with spaces
    const row = (left, right) => {
      const rightStr = String(right)
      const maxLeft = Math.max(0, PRINT_WIDTH - rightStr.length - 1)
      const leftStr = left.length > maxLeft ? left.slice(0, maxLeft) : left
      const gap = PRINT_WIDTH - leftStr.length - rightStr.length
      return leftStr + ' '.repeat(Math.max(1, gap))  + rightStr
    }

    // Item line: "name xQty" left, price right — wraps to a second line if too long
    const itemLine = (item) => {
      const namePart = `${item.name} x${item.qty}`
      const priceStr = `Rs.${item.price * item.qty}`
      if (namePart.length + priceStr.length + 1 <= PRINT_WIDTH) {
        return row(namePart, priceStr) + '\n'
      }
      return `${item.name}\n${row(`  x${item.qty}`, priceStr)}\n`
    }

    // Order info / items / totals / thank-you — identical text in both versions
    let body = ''
    body += `Table: ${selectedOrder.tableNumber}\n`
    body += `Date: ${new Date().toLocaleDateString('en-IN')}  Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}\n`
    body += divider() + '\n'
    selectedOrder.items.forEach(item => { body += itemLine(item) })
    body += divider() + '\n'
    body += row('Subtotal', `Rs.${selectedOrder.totalAmount}`) + '\n'
    if (discount > 0) body += row('Discount', `-Rs.${discount}`) + '\n'
    body += row('TOTAL', `Rs.${finalTotal}`) + '\n'
    body += divider() + '\n'
    body += center('Thank you for visiting!') + '\n'
    body += center('Please visit again') + '\n'
    body += '\n\n\n\n' // feed paper past the cutter

    // Plain text version for the on-screen modal — no control characters,
    // header centered manually since the browser can't interpret ESC a 1.
    const plainReceipt =
      center('HOTEL RAJENDRA & SWEET HOME') + '\n' +
      center('Pargaon Salu Malu') + '\n' +
      divider() + '\n' +
      body

    // ESC/POS version for the RawBT payload — printer-side align/bold, so the
    // header is sent as raw text rather than manually padded.
    const escReceipt =
      ALIGN_CENTER +
      BOLD_ON + 'HOTEL RAJENDRA & SWEET HOME' + BOLD_OFF + '\n' +
      'Pargaon Salu Malu' + '\n' +
      divider() + '\n' +
      ALIGN_LEFT +
      body

    setReceiptText(plainReceipt)
    setShowReceiptModal(true)

    // Hand the receipt to RawBT via its rawbt: URL scheme, triggered from a
    // hidden anchor click rather than window.location.href (see prior fix:
    // assigning the scheme to location.href risks a top-level navigation that
    // can wipe the SPA if RawBT isn't registered to handle it).
    const base64Receipt = btoa(unescape(encodeURIComponent(escReceipt)))
    const link = document.createElement('a')
    link.href = `rawbt:base64,${base64Receipt}`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleTableSelect = (num) => {
    const existing = activeOrders.find(o => o.tableNumber == num)
    if (existing) { setSelectedOrder(existing); setShowMenu(false); setDiscount(0); setOrderError(''); setBillError('') }
    else { setSelectedOrder({ tableNumber: num, items: [], totalAmount: 0 }); setShowMenu(true) }
    setShowNewOrder(false)
    setSelectedCategory(menu.length > 0 ? menu[0].category : '')
  }

  const saveItemPrice = async (item) => {
    try {
      await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/menu/update/${item._id}`,
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
      await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/menu/delete/${item._id}`, {}, { headers: { authorization: token } })
      fetchMenu()
    } catch (err) { alert('Failed to delete item') }
  }

  const addNewItem = async () => {
    if (!newItemName || (!newItemVariable && !newItemPrice)) return
    try {
      await axios.post('https://shark-app-2tu4l.ondigitalocean.app/api/menu/add',
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
      await axios.post('https://shark-app-2tu4l.ondigitalocean.app/api/auth/waiter/create',
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
      await axios.post(`https://shark-app-2tu4l.ondigitalocean.app/api/auth/waiter/delete/${id}`, {}, { headers: { authorization: token } })
      fetchWaiters()
    } catch (err) { alert('Failed to delete waiter') }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
        <button onClick={() => { setActiveTab('analytics'); setAnalyticsView('today'); loadAnalytics('today') }} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: activeTab === 'analytics' ? 'white' : 'transparent',
          color: activeTab === 'analytics' ? '#e65c00' : 'white'
        }}>📊 Analytics</button>
        <button onClick={() => { setActiveTab('bills'); fetchBilledToday(); fetchVoidedOrders() }} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: activeTab === 'bills' ? 'white' : 'transparent',
          color: activeTab === 'bills' ? '#e65c00' : 'white'
        }}>🧾 Bills</button>
        <button onClick={() => setShowLogoutConfirm(true)} style={{
          padding: '5px 12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', borderRadius: '6px',
          backgroundColor: '#cc0000', color: 'white', marginLeft: '8px'
        }}>Logout</button>
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
              <div key={order._id} onClick={() => { setSelectedOrder(order); setShowMenu(false); setDiscount(0); setOrderError(''); setBillError('') }}
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
                <button onClick={() => { setShowMenu(true); setMenuSearchQuery('') }} style={{
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
                <button onClick={sendToKitchen} disabled={confirmingOrder || savingBill} style={{
                  width: '100%', padding: '16px', border: 'none', borderRadius: '8px',
                  fontSize: '18px', marginTop: '16px', marginBottom: '4px',
                  backgroundColor: confirmingOrder ? '#aaa' : '#e65c00',
                  color: 'white', cursor: confirmingOrder ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}>
                  {confirmingOrder && <span style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                  {confirmingOrder ? 'Confirming...' : 'Confirm Order'}
                </button>
                {orderError && <p style={{ color: '#cc0000', fontSize: '13px', margin: '0 0 8px', textAlign: 'center' }}>{orderError}</p>}
                <button onClick={saveAndBill} disabled={savingBill || confirmingOrder} style={{
                  width: '100%', padding: '16px', border: 'none', borderRadius: '8px',
                  fontSize: '18px', marginBottom: '4px',
                  backgroundColor: savingBill ? '#aaa' : '#2ecc71',
                  color: 'white', cursor: savingBill ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}>
                  {savingBill && <span style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                  {savingBill ? 'Saving Bill...' : 'Print Bill & Close Table'}
                </button>
                {billError && <p style={{ color: '#cc0000', fontSize: '13px', margin: '0 0 8px', textAlign: 'center' }}>{billError}</p>}
                <button onClick={cancelOrder} style={{
                  width: '100%', padding: '14px', backgroundColor: '#ff4444',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '16px', cursor: 'pointer', marginTop: '8px'
                }}>Cancel Order</button>
              </div>
            )}
            {selectedOrder && showMenu && (
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', display: 'block', marginBottom: '12px' }}>Table {selectedOrder.tableNumber}</span>
                <input
                  type='text'
                  placeholder='Search items...'
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box',
                    marginBottom: '12px', outline: 'none'
                  }}
                />
                {!menuSearchQuery && (
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
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {menuSearchQuery
                    ? menu.flatMap(cat => cat.items).filter(item =>
                        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      ).map(item => (
                        <button key={item.name} onClick={() => addItem(item)}
                          style={{
                            padding: '12px', backgroundColor: 'white', border: '1px solid #ddd',
                            borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
                          }}>
                          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.name}</div>
                          <div style={{ color: '#e65c00', fontSize: '13px' }}>{item.variable ? 'Add Price' : `₹${item.price}`}</div>
                        </button>
                      ))
                    : menu.find(cat => cat.category === selectedCategory)?.items.map(item => (
                        <button key={item.name} onClick={() => addItem(item)}
                          style={{
                            padding: '12px', backgroundColor: 'white', border: '1px solid #ddd',
                            borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
                          }}>
                          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.name}</div>
                          <div style={{ color: '#e65c00', fontSize: '13px' }}>{item.variable ? 'Add Price' : `₹${item.price}`}</div>
                        </button>
                      ))
                  }
                </div>
                {selectedOrder.items.length > 0 && (
                  <div onClick={() => { setShowMenu(false); setMenuSearchQuery('') }} style={{
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
          {waitersLoading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ width: '32px', height: '32px', border: '4px solid #ddd', borderTopColor: '#e65c00', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#666', marginTop: '12px' }}>Loading waiters...</p>
            </div>
          )}
          {waitersError && !waitersLoading && (
            <div style={{ backgroundColor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#c62828', margin: '0 0 4px', fontWeight: 'bold' }}>Failed to load waiters</p>
              <p style={{ color: '#c62828', margin: '0 0 12px', fontSize: '13px' }}>{waitersError}</p>
              <button onClick={fetchWaiters} style={{ padding: '8px 16px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
            </div>
          )}
          {!waitersLoading && !waitersError && waiters.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center' }}>No waiters added yet</p>
          ) : !waitersLoading && !waitersError && (
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
            <button onClick={() => { setAnalyticsView('today'); loadAnalytics('today') }} style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: analyticsView === 'today' ? '#e65c00' : 'white',
              color: analyticsView === 'today' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>📅 Today</button>
            <button onClick={() => { setAnalyticsView('monthly'); loadAnalytics('monthly', selectedMonth, selectedYear) }} style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: analyticsView === 'monthly' ? '#e65c00' : 'white',
              color: analyticsView === 'monthly' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>📆 Monthly</button>
            <button onClick={() => { setAnalyticsView('yearly'); loadAnalytics('yearly', undefined, selectedYear) }} style={{
              padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
              backgroundColor: analyticsView === 'yearly' ? '#e65c00' : 'white',
              color: analyticsView === 'yearly' ? 'white' : '#333',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>📈 Yearly</button>
          </div>

          {analyticsLoading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <span style={{ width: '32px', height: '32px', border: '4px solid #ddd', borderTopColor: '#e65c00', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#666', marginTop: '12px' }}>Loading analytics...</p>
            </div>
          )}

          {analyticsError && !analyticsLoading && (
            <div style={{ backgroundColor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#c62828', margin: '0 0 4px', fontWeight: 'bold' }}>Failed to load analytics</p>
              <p style={{ color: '#c62828', margin: '0 0 12px', fontSize: '13px' }}>{analyticsError}</p>
              <button onClick={() => loadAnalytics(analyticsView)} style={{ padding: '8px 16px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
            </div>
          )}

          {!analyticsLoading && !analyticsError && analyticsView === 'today' && todaySales && (
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

          {!analyticsLoading && !analyticsError && analyticsView === 'today' && topItems.length > 0 && (
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

          {!analyticsLoading && !analyticsError && analyticsView === 'monthly' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Monthly Sales</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select value={selectedMonth} onChange={(e) => { const m = parseInt(e.target.value); setSelectedMonth(m); loadAnalytics('monthly', m, selectedYear) }}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}>
                  {months.map((m, idx) => <option key={idx} value={idx + 1}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={(e) => { const y = parseInt(e.target.value); setSelectedYear(y); loadAnalytics('monthly', selectedMonth, y) }}
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

          {!analyticsLoading && !analyticsError && analyticsView === 'yearly' && (
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Yearly Sales - {selectedYear}</h3>
              <select value={selectedYear} onChange={(e) => { const y = parseInt(e.target.value); setSelectedYear(y); loadAnalytics('yearly', undefined, y) }}
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

      {/* BILLS TAB */}
      {activeTab === 'bills' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f5f5f5' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>🧾 Bill Management</h2>

          {/* Today's billed orders */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Today's Bills</h3>
              <button onClick={fetchBilledToday} style={{ padding: '6px 14px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>🔄 Refresh</button>
            </div>
            {billedOrders.length === 0
              ? <p style={{ color: '#999', textAlign: 'center', padding: '16px 0' }}>No bills closed today</p>
              : billedOrders.map(order => (
                <div key={order._id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #2ecc71'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Table {order.tableNumber}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {order.items.length} items · {new Date(order.billedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>₹{order.totalAmount}</span>
                    <button onClick={() => { setVoidingOrder(order); setVoidReason(''); setVoidError(''); setShowVoidModal(true) }}
                      style={{ padding: '6px 14px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                      Void
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Voided bills (last 30 days) */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#333' }}>Voided Bills — Last 30 Days</h3>
            {voidedOrders.length === 0
              ? <p style={{ color: '#999', textAlign: 'center', padding: '16px 0' }}>No voided bills</p>
              : voidedOrders.map(order => (
                <div key={order._id} style={{
                  padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid #cc0000'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Table {order.tableNumber}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Billed {new Date(order.billedAt).toLocaleDateString('en-IN')} · Voided {new Date(order.voidedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {order.voidReason && <div style={{ fontSize: '12px', color: '#cc0000', marginTop: '4px' }}>Reason: {order.voidReason}</div>}
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#cc0000', textDecoration: 'line-through' }}>₹{order.totalAmount}</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Modals */}
      {showReceiptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '320px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Bill Sent to Printer</h3>
              <button onClick={() => setShowReceiptModal(false)} style={{ backgroundColor: '#ddd', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>
            <pre style={{
              fontFamily: "'Courier New', monospace", fontSize: '12px', whiteSpace: 'pre-wrap',
              backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', margin: 0
            }}>{receiptText}</pre>
            <button onClick={() => setShowReceiptModal(false)} style={{
              width: '100%', marginTop: '14px', padding: '12px', backgroundColor: '#e65c00',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>Close</button>
          </div>
        </div>
      )}
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

      {showVoidModal && voidingOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '12px', width: '340px' }}>
            <h3 style={{ marginBottom: '4px' }}>Void Bill</h3>
            <p style={{ color: '#666', marginBottom: '4px', fontSize: '14px' }}>
              Table {voidingOrder.tableNumber} · ₹{voidingOrder.totalAmount}
            </p>
            <p style={{ color: '#cc0000', fontSize: '13px', marginBottom: '16px' }}>
              This will remove the bill from all sales analytics. This cannot be undone.
            </p>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '6px' }}>
              Reason (optional)
            </label>
            <input type='text' placeholder='e.g. Wrong table, customer complaint...'
              value={voidReason} onChange={(e) => setVoidReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            {voidError && <p style={{ color: '#cc0000', fontSize: '13px', marginBottom: '8px' }}>{voidError}</p>}
            <button onClick={voidOrder} disabled={voidingLoading} style={{
              width: '100%', padding: '12px', backgroundColor: voidingLoading ? '#aaa' : '#cc0000',
              color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px',
              fontWeight: 'bold', cursor: voidingLoading ? 'not-allowed' : 'pointer', marginBottom: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {voidingLoading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
              {voidingLoading ? 'Voiding...' : 'Yes, Void This Bill'}
            </button>
            <button onClick={() => { setShowVoidModal(false); setVoidingOrder(null); setVoidReason(''); setVoidError('') }}
              style={{ width: '100%', padding: '12px', backgroundColor: '#ddd', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

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

export default Counter
