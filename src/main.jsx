import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Categoria from './pages/Categoria.jsx'
import Produto from './pages/Produto.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/categorias/:id" element={<Categoria />} />
        <Route path="/produtos/:id" element={<Produto />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
) 