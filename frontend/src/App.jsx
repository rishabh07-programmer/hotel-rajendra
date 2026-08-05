import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Counter from './pages/Counter'
import Waiter from './pages/Waiter'
import Kitchen from './pages/Kitchen'
import Developer from './pages/Developer'
import { getAuth } from './utils/auth'

function ProtectedRoute({ role, children }) {
  const { token, role: storedRole } = getAuth(role)
  if (!token || storedRole !== role) return <Navigate to='/' replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/counter' element={<ProtectedRoute role='owner'><Counter /></ProtectedRoute>} />
        <Route path='/waiter' element={<ProtectedRoute role='waiter'><Waiter /></ProtectedRoute>} />
        <Route path='/kitchen' element={<ProtectedRoute role='kitchen'><Kitchen /></ProtectedRoute>} />
        <Route path='/developer' element={<ProtectedRoute role='developer'><Developer /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App