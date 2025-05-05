import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Menu from './pages/Menu.jsx'
import Produto from './pages/Produto.jsx'
import Catalogo from './pages/Catalogo.jsx'
import './index.css'

// Componente de erro para capturar problemas
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error("Erro capturado pelo ErrorBoundary:", error);
      setError(error.message);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado</h1>
        <p className="text-gray-700 mb-6">{error || "Ocorreu um erro inesperado"}</p>
        <button 
          onClick={() => window.location.href = '/'} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Voltar para a página inicial
        </button>
      </div>
    );
  }

  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/produtos/:id" element={<Produto />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
) 