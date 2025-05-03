import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getProductsByCategory, getCategories, getNotifications } from "../lib/api";
import { FaChevronLeft, FaChevronRight, FaBell } from "react-icons/fa";

export default function Categoria() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          console.log('Certifique-se que todos os IDs estão corretos:', produtosFormatados.map(p => p.id));
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

  // Buscar notificações do Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);
        const notificationsData = await getNotifications();
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
        setNotificationsError('Não foi possível carregar as notificações');
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogoClick = () => {
    navigate("/catalogo");
  };

  const total = produtos.length;

  const next = () => {
    setCurrentIndex((prev) => {
      // No mobile, limite é o último produto
      if (isMobile) {
        if (prev >= produtos.length - 1) return prev;
        return prev + 1;
      }
      // No desktop, limite é o último produto que ainda permite 4 produtos visíveis
      else {
        if (prev >= produtos.length - 4) return prev;
        return prev + 1;
      }
    });
  };

  const prev = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
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

  // Garantir que o índice atual esteja dentro dos limites válidos
  useEffect(() => {
    if (produtos.length > 0) {
      const maxIndex = isMobile ? produtos.length - 1 : produtos.length - 4;
      if (maxIndex < 0) return; // Se houver menos de 4 produtos no desktop
      
      if (currentIndex > maxIndex) {
        setCurrentIndex(maxIndex);
      }
    }
  }, [produtos, isMobile, currentIndex]);

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
                onClick={handleLogoClick}
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
              <FaBell
                className="transition-all duration-200 text-black"
                style={{ 
                  width: "clamp(24px, 2vw, 32px)", 
                  height: "auto"
                }}
              />
              {notifications.length > 0 && (
                <span 
                  className="absolute top-0 right-0 block rounded-full flex items-center justify-center text-[10px] text-white font-bold" 
                  style={{ 
                    width: "clamp(14px, 1vw, 16px)", 
                    height: "clamp(14px, 1vw, 16px)",
                    backgroundColor: "red" 
                  }} 
                >
                  {notifications.length}
                </span>
              )}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 text-white text-xs py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Notificações
              </div>
            </button>

            {/* Popup de Notificações */}
            {showNotifications && (
              <motion.div 
                className="absolute top-[calc(100%+1rem)] right-0 bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-lg p-4 min-w-[280px] border border-zinc-800 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-white">Notificações</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        // Forçar busca de notificações novamente
                        setNotificationsLoading(true);
                        setNotificationsError(null);
                        getNotifications()
                          .then(data => {
                            setNotifications(data);
                            console.log("Notificações recarregadas:", data);
                            // Mostrar feedback sobre a recarga
                            if (data.length > 0) {
                              alert(`${data.length} notificações carregadas com sucesso!`);
                            } else {
                              alert("Nenhuma notificação encontrada. Usando dados de exemplo.");
                            }
                          })
                          .catch(err => {
                            console.error("Erro ao recarregar notificações:", err);
                            setNotificationsError("Erro ao recarregar");
                            alert("Erro ao carregar notificações: " + err.message);
                          })
                          .finally(() => {
                            setNotificationsLoading(false);
                          });
                      }}
                      className="text-zinc-400 hover:text-white transition-colors duration-200"
                      title="Recarregar notificações"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-zinc-400 hover:text-white transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {notificationsLoading ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : notificationsError ? (
                  <div className="text-red-400 text-xs py-2">
                    {notificationsError}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.map((notification, index) => {
                      console.log(`Renderizando notificação ${index}:`, notification);
                      return (
                        <div key={notification.id || index} className="border-b border-zinc-700 last:border-b-0 py-2">
                          <h4 className="text-sm font-medium text-white mb-1">
                            {notification.titulo || 'Sem título'}
                          </h4>
                          <p className="text-zinc-400 text-xs mb-1">
                            {notification.conteudo || 'Sem conteúdo'}
                          </p>
                          {notification.tipo === 'link' && (
                            <a 
                              href={notification.url || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-block mt-1"
                            >
                              Saiba mais
                            </a>
                          )}
                          <div className="text-zinc-500 text-[10px] mt-1">
                            {notification.created_at ? new Date(notification.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                          </div>
                          <div className="text-zinc-600 text-[8px] italic">
                            <span className="mr-2">Visibilidade: {notification.visibilidade || 'N/A'}</span>
                            {notification.tipo && (
                              <span className="mr-2">Tipo: {notification.tipo}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-zinc-400 text-xs py-2">
                    Nenhuma notificação no momento
                  </div>
                )}
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
              className="text-center mt-8 mb-2 flex items-center justify-center gap-4"
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
              <div className="w-full max-w-[90%] mx-auto px-4 mt-10">
                <div className="relative">
                  {/* Botões de navegação */}
                  <motion.button
                    onClick={prev}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-40 text-white p-4 rounded-full bg-black/50 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronLeft size={28} />
                  </motion.button>
                  <motion.button
                    onClick={next}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-40 text-white p-4 rounded-full bg-black/50 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronRight size={28} />
                  </motion.button>

                  {/* Carrossel */}
                  <div className="overflow-hidden w-full mx-auto">
                    <div 
                      className="flex"
                      style={{ 
                        transform: isMobile
                          ? `translateX(-${currentIndex * 100}%)`
                          : `translateX(-${currentIndex * 25}%)`,
                        transition: 'transform 0.5s ease'
                      }}
                    >
                      {produtos.map((produto, index) => (
                        <div
                          key={produto.id}
                          className={`${isMobile ? 'w-[100%]' : 'w-[25%]'} flex-shrink-0 flex flex-col items-center justify-center p-5 cursor-pointer`}
                          onClick={() => {
                            console.log('Navegando para o produto:', produto);
                            console.log('ID do produto:', produto.id);
                            navigate(`/produtos/${produto.id}`, {
                              state: {
                                from: 'categoria',
                                categoryId: id
                              }
                            });
                          }}
                        >
                          <div className="flex flex-col items-center w-full">
                            <div className="w-full h-[300px] flex items-center justify-center mb-6">
                              <img
                                src={produto.imagem}
                                alt={produto.nome}
                                className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                            <h3 className="text-2xl font-bold text-center mb-2 w-full">
                              {produto.nome}
                            </h3>
                            <p className="text-lg text-gray-600 text-center mb-2 w-full">
                              {produto.nomeSecundario || ''}
                            </p>
                            <p className="text-base text-gray-500 text-center w-full">
                              {produto.subtitulo || ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="flex justify-center gap-2 mt-6">
                    {isMobile 
                      ? produtos.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentIndex ? 'bg-black w-4' : 'bg-gray-300'
                          }`}
                          onClick={() => setCurrentIndex(idx)}
                        />
                      ))
                      : produtos.slice(0, produtos.length - 3).map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentIndex ? 'bg-black w-4' : 'bg-gray-300'
                          }`}
                          onClick={() => setCurrentIndex(idx)}
                        />
                      ))
                    }
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
