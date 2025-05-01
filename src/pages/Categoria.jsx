import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getProductsByCategory, getCategories } from "../lib/api";

export default function Categoria() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Primeiro busca os dados da categoria
        const categorias = await getCategories();
        console.log('ID da URL:', id);
        console.log('IDs das categorias:', categorias.map(cat => cat.id));
        const categoriaAtual = categorias.find(cat => cat.id === id);
        setCategoria(categoriaAtual);
        
        // Depois busca os produtos
        const produtos = await getProductsByCategory(id);
        
        if (produtos) {
          console.log('Produtos antes do mapeamento:', produtos);
          const produtosFormatados = produtos.map(p => ({
            id: p.id,
            nome: p.name || p.nome,
            nomeSecundario: p.secondary_name || p.nomeSecundario,
            subtitulo: p.subtitle || p.subtitulo,
            imagem: p.product_images && p.product_images.length > 0 
              ? (p.product_images[0].url.startsWith('http') 
                  ? p.product_images[0].url 
                  : `/catalogo/${p.product_images[0].url}`)
              : '/placeholder.jpg',
            slug: p.slug
          }));
          console.log('Produtos formatados:', produtosFormatados);
          setProdutos(produtosFormatados);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const total = produtos.length;

  const next = () => {
    setCurrentIndex((prev) => {
      if (prev >= produtos.length - 1) return 0;
      return prev + 1;
    });
  };

  const prev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return produtos.length - 1;
      return prev - 1;
    });
  };

  // Adicionar navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-play opcional (descomente se desejar)
  /*
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);
  */

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  const getSlides = () => {
    let slides = [];
    for (let i = 0; i < total; i++) {
      slides.push({ ...produtos[i], position: i });
    }
    return slides;
  };

  const nomeFormatado =
    categoria?.name.charAt(0).toUpperCase() + categoria?.name.slice(1).toLowerCase();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const slideIn = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8 }
  };

  return (
    <div className="w-screen h-screen bg-white text-black font-figtree overflow-hidden relative">
      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div 
        className="relative w-full pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(100px, 12vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-[8%]">
          {/* LOGO APPRO + BOTÃO VOLTAR */}
          <motion.div 
            className="flex items-center" 
            style={{ gap: "clamp(1.5rem, 2.5vw, 2rem)" }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative" style={{ width: "clamp(90px, 8vw, 120px)" }}>
              <button 
                className="w-full transform transition duration-200 ease-in-out hover:scale-110"
                onClick={() => navigate("/catalogo")}
              >
                <img
                  src="/catalogo/logo appro preta.svg"
                  alt="Logo Appro"
                  className="w-full h-auto"
                />
              </button>
            </div>
            
            <motion.button
              onClick={() => navigate("/menu")}
              className="group flex items-center transform transition-all duration-200 ease-in-out hover:scale-110"
              style={{ gap: "clamp(0.3rem, 0.5vw, 0.5rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <img 
                src="/catalogo/seta.svg" 
                alt="Voltar" 
                style={{ width: "clamp(16px, 1.2vw, 20px)", height: "auto" }}
              />
              <span 
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}
                className="text-black"
              >
                Voltar
              </span>
            </motion.button>
          </motion.div>

          {/* WHATSAPP + SINO */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1.2rem, 2vw, 1.8rem)" }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
            >
              <img
                src="/catalogo/wpp.svg"
                alt="WhatsApp"
                className="transition-all duration-200"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Fale conosco
              </div>
            </a>

            <button 
              className="group transform transition-all duration-200 ease-in-out hover:scale-110 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <img
                src="/catalogo/sino.svg"
                alt="Notificações"
                className="transition-all duration-200"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              <span 
                className="absolute top-0 right-0 block rounded-full" 
                style={{ 
                  width: "clamp(6px, 0.5vw, 8px)", 
                  height: "clamp(6px, 0.5vw, 8px)",
                  backgroundColor: "black" 
                }} 
              />
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Notificações
              </div>
            </button>

            {/* Popup de Notificações */}
            {showNotifications && (
              <motion.div 
                className="absolute top-[calc(100%+1rem)] right-0 bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-lg p-4 min-w-[280px] border border-zinc-800"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-white">Notificações</span>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-white transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-zinc-400 text-xs">
                  Nenhuma notificação no momento
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Resto do conteúdo */}
      <div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-xl">{error}</div>
          </div>
        ) : (
          <>
            {/* Título com seta */}
            <motion.div 
              className="text-center mt-8 mb-4 flex items-center justify-center gap-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1
                className="font-bold capitalize"
                style={{
                  fontSize: "clamp(2rem, 6vw, 4rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {categoria?.name || 'Carregando...'}
              </h1>
              <motion.img 
                src="/catalogo/seta titulo.svg" 
                alt="Seta" 
                className="w-6 h-6 mt-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              />
            </motion.div>

            {/* Lista de produtos */}
            {produtos.length > 0 ? (
              <div className="w-full max-w-6xl mx-auto px-4">
                <div className="relative">
                  {/* Botões de navegação */}
                  <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  >
                    ❮
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300"
                    style={{ transform: 'translate(50%, -50%)' }}
                  >
                    ❯
                  </button>

                  {/* Carrossel */}
                  <div className="overflow-hidden">
                    <div 
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                      {produtos.map((produto) => (
                        <div
                          key={produto.id}
                          className="w-full flex-shrink-0 flex flex-col items-center justify-center p-4 cursor-pointer"
                          onClick={() => navigate(`/produtos/${produto.id}`, {
                            state: {
                              from: 'categoria',
                              categoryId: id
                            }
                          })}
                        >
                          <div className="flex flex-col items-center">
                            <img
                              src={produto.imagem}
                              alt={produto.nome}
                              className="w-auto h-[300px] object-contain mb-6 transition-transform duration-300 hover:scale-105"
                            />
                            <h3 className="text-2xl font-bold text-center mb-2">
                              {produto.nome}
                            </h3>
                            {produto.nomeSecundario && (
                              <p className="text-lg text-gray-600 text-center">
                                {produto.nomeSecundario}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="flex justify-center gap-2 mt-6">
                    {produtos.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === currentIndex ? 'bg-black w-4' : 'bg-gray-300'
                        }`}
                        onClick={() => setCurrentIndex(idx)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl text-gray-500">Nenhum produto encontrado nesta categoria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
