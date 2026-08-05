import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Counter from './pages/Counter'
import Waiter from './pages/Waiter'
import Kitchen from './pages/Kitchen'
import Developer from './pages/Developer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/counter' element={<Counter />} />
        <Route path='/waiter' element={<Waiter />} />
        <Route path='/kitchen' element={<Kitchen />} />
        <Route path='/developer' element={<Developer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App