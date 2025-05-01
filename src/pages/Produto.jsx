import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { getProductById, getRelatedProducts } from "../lib/api";
import { FaWhatsapp, FaFacebookF, FaTwitter, FaPinterestP, FaEnvelope, FaCopy, FaShareAlt } from "react-icons/fa";

// Dados estáticos para teste
const imagensGaleria = [
  "/galeria/1.png",
  "/galeria/2.png",
  "/galeria/3.png",
];

// Usar a imagem da pasta relacionados
const relacionados = Array(8).fill("/relacionados/1.png");

// Dados temporários do produto
const produtoTemp = {
  category: "Treatment",
  name: "Produto Exemplo",
  subtitle: "Subtítulo do Produto",
  description: "Descrição detalhada do produto com todas as suas características e benefícios.",
  rating: 5,
  price: 199.99,
  price_original: 249.99,
  price_promotional: 199.99,
  images: imagensGaleria,
  short_description: "Breve descrição do produto"
};

export default function Produto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [imagemAtiva, setImagemAtiva] = useState(null);
  const [mostrarPreco, setMostrarPreco] = useState(false);
  const carrosselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [product, ...relacionados];
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Função para lidar com a navegação de volta
  const handleBack = () => {
    // Se veio de uma categoria específica, volta para ela
    if (location.state?.from === 'categoria') {
      navigate(`/categorias/${location.state.categoryId}`);
    }
    // Se veio do menu
    else if (location.state?.from === 'menu') {
      navigate('/menu');
    }
    // Se veio da home
    else if (location.state?.from === 'home') {
      navigate('/home');
    }
    // Se veio da busca
    else if (location.state?.from === 'search') {
      navigate('/search', { state: { query: location.state.searchQuery } });
    }
    // Se não tem histórico específico, tenta voltar
    else {
      navigate(-1);
    }
  };

  // Função para navegar para outro produto
  const navigateToProduct = (productId) => {
    // Preserva a origem da navegação ao mudar de produto
    navigate(`/produtos/${productId}`, {
      state: {
        ...location.state,
        previousProductId: id // Armazena o ID do produto atual
      }
    });
    // Rola a página para o topo
    window.scrollTo(0, 0);
  };

  // Função para rolar o carrossel de produtos relacionados
  const scrollCarrossel = (dir) => {
    if (!carrosselRef.current) return;
    
    const items = carrosselRef.current.querySelectorAll('.item-carrossel');
    if (items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth;
    const gap = 112;
    const scrollAmount = dir === "left" ? -(itemWidth + gap) : (itemWidth + gap);
    
    carrosselRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // Função para mudar o slide principal
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 2);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 2) % 2);
  };

  // Configurar o carrossel infinito
  useEffect(() => {
    const handleScroll = () => {
      if (!carrosselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carrosselRef.current;
      
      // Se chegou ao final, volta para o início
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        // Pequeno delay para que a transição do scroll termine
        setTimeout(() => {
          carrosselRef.current.scrollTo({
            left: 0,
            behavior: 'auto'
          });
        }, 100);
      }
      
      // Se chegou ao início e está rolando para trás, vai para o final
      if (scrollLeft <= 10 && scrollLeft < scrollWidth) {
        // Pequeno delay para que a transição do scroll termine
        setTimeout(() => {
          carrosselRef.current.scrollTo({
            left: scrollWidth - clientWidth,
            behavior: 'auto'
          });
        }, 100);
      }
    };

    const carrosselElement = carrosselRef.current;
    if (carrosselElement) {
      carrosselElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (carrosselElement) {
        carrosselElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Handlers para arrastar
  const handleMouseDown = (e) => {
    if (!carrosselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carrosselRef.current.offsetLeft);
    setScrollLeft(carrosselRef.current.scrollLeft);
    carrosselRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e) => {
    if (!carrosselRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carrosselRef.current.offsetLeft);
    setScrollLeft(carrosselRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carrosselRef.current) {
      carrosselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carrosselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carrosselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    carrosselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !carrosselRef.current) return;
    const x = e.touches[0].pageX - carrosselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do scroll
    carrosselRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Buscando produto com ID:', id);
        setLoading(true);
        setError(null);
        
        // Buscar o produto pelo id
        const productData = await getProductById(id);
        console.log('Dados do produto recebidos:', productData);

        if (productData) {
          // Formatar os dados do produto
          const formattedProduct = {
            ...productData,
            category: productData.category?.name || 'Sem categoria',
            name: productData.name,
            subtitle: productData.subtitle,
            description: productData.description,
            short_description: productData.mini_description,
            price: productData.real_price,
            price_original: productData.real_price,
            price_promotional: productData.promo_price,
            images: productData.product_images.map(img => img.url),
            video_embed: productData.video_embed,
            button_link: productData.button_link || '#'
          };
          
          console.log('Produto formatado:', formattedProduct);
          setProduct(formattedProduct);
          setImagemAtiva(formattedProduct.images[0]);

          // Buscar produtos relacionados da mesma categoria
          const relatedData = await getRelatedProducts(productData.category_id, id);
          console.log('Produtos relacionados:', relatedData);

          if (relatedData) {
            // Formatar os produtos relacionados
            const formattedRelated = relatedData.map(prod => ({
              ...prod,
              images: prod.product_images?.map(img => img.url) || []
            }));
            console.log('Produtos relacionados formatados:', formattedRelated);
            setRelacionados(formattedRelated);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      console.error('ID não fornecido');
      setError('ID do produto não fornecido');
    }
  }, [id]);

  // Função para compartilhar o produto
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Função para compartilhar em uma rede social específica
  const shareToSocial = (network) => {
    const url = window.location.href;
    const title = product ? product.name : 'Produto';
    const description = product ? product.short_description : 'Confira esse produto';
    
    let shareUrl = '';

    switch (network) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${description} ${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'pinterest':
        const imageUrl = product && product.images && product.images.length > 0 ? product.images[0] : '';
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(title)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description} ${url}`)}`;
        break;
      default:
        // Copiar para área de transferência
        navigator.clipboard.writeText(url)
          .then(() => alert('Link copiado para a área de transferência!'))
          .catch(err => console.error('Erro ao copiar link: ', err));
        setShowShareOptions(false);
        return;
    }

    // Abrir nova janela para compartilhar
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#1A1A1A]"></div>
    </div>
  );

  if (error) return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 text-xl">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-black text-white rounded-lg">
        Tentar novamente
      </button>
    </div>
  );

  if (!product) return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-[#666] text-xl">Produto não encontrado</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white">
      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div 
        className="relative w-full pt-[clamp(2rem,4vh,4rem)] sm:pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(80px, 10vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-4 sm:px-[8%]">
          {/* LOGO APPRO + BOTÃO VOLTAR */}
          <motion.div 
            className="flex items-center" 
            style={{ gap: "clamp(1rem, 2vw, 2rem)" }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative" style={{ width: "clamp(70px, 6vw, 120px)" }}>
              <button 
                className="w-full transform transition duration-200 ease-in-out hover:scale-110"
                onClick={() => navigate('/catalogo')}
              >
                <img
                  src="/catalogo/logo appro preta.svg"
                  alt="Logo Appro"
                  className="w-full h-auto"
                />
              </button>
            </div>
            
            <motion.button
              onClick={handleBack}
              className="group flex items-center transform transition-all duration-200 ease-in-out hover:scale-110"
              style={{ gap: "clamp(0.2rem, 0.4vw, 0.5rem)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <img 
                src="/catalogo/seta.svg" 
                alt="Voltar" 
                style={{ width: "clamp(14px, 1vw, 20px)", height: "auto" }}
              />
              <span 
                style={{ fontSize: "clamp(0.75rem, 1vw, 1rem)" }}
                className="text-black hidden sm:inline"
              >
                Voltar
              </span>
            </motion.button>
          </motion.div>

          {/* WHATSAPP + SINO */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1rem, 1.5vw, 1.8rem)" }}
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

      {/* Conteúdo Principal (Slider) */}
      <motion.div className="relative w-full h-[calc(100vh-clamp(80px,10vh,140px))] overflow-hidden">
        <div className="flex h-full" style={{ transform: `translateX(-${slideIndex*100}%)`, transition: 'transform 0.5s ease' }}>
          {slides.map((item, idx) => (
            <div key={idx} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] h-full gap-0">
              {/* Galeria e detalhes */}
              <div className="flex flex-col h-full justify-start lg:justify-center px-4 sm:px-6 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 w-full justify-center mt-4 lg:mt-0">
                  {/* Galeria */}
                  <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
                    <div className="inline-flex rounded-[20px] shadow-lg overflow-hidden bg-gray-50 hover:shadow-xl transition-all duration-300">
                      <img
                        src={item.images[0]}
                        alt={`variante ${idx}`}
                        className="w-full max-h-[250px] sm:max-h-[clamp(300px,40vh,500px)] object-contain"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-3 md:gap-4 mt-3 md:mt-4 justify-center overflow-x-auto pb-2 w-full">
                      {item.images?.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`variante ${idx}`}
                          onClick={() => setImagemAtiva(img)}
                          className={`
                            w-[clamp(50px,6vw,80px)] h-[clamp(50px,6vw,80px)]
                            rounded-lg 
                            border ${imagemAtiva === img ? 'border-gray-500' : 'border-gray-200'}
                            hover:shadow-md hover:scale-110
                            cursor-pointer 
                            transition-all duration-300
                            object-cover
                            flex-shrink-0
                          `}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Texto + Preço */}
                  <div className="flex flex-col gap-2 sm:gap-3 w-full lg:w-1/2 justify-start lg:justify-center mt-4 lg:mt-0">
                    <p className="text-[clamp(0.85rem,1.2vw,1rem)] uppercase font-medium text-gray-500">
                      {item.category}
                    </p>
                    <h1 className="text-[clamp(1.5rem,3vw,3rem)] font-bold text-black">
                      {item.name}
                    </h1>
                    <h2 className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold text-gray-800">
                      {item.short_description}
                    </h2>
                    <p className="text-[clamp(0.9rem,1.2vw,1rem)] text-gray-700 leading-relaxed line-clamp-3 lg:line-clamp-5">
                      {item.description}
                    </p>

                    {/* Avaliações */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <img
                          key={i}
                          src="/catalogo/Star 1.svg"
                          alt="Star"
                          className="w-[clamp(14px,1.2vw,20px)] h-[clamp(14px,1.2vw,20px)] hover:scale-110 transition-all duration-300"
                        />
                      ))}
                      <span className="text-[clamp(0.85rem,1.2vw,1rem)] text-gray-600 ml-1 sm:ml-2">(56)</span>
                      <div className="relative ml-auto">
                        <FaShareAlt
                          className="w-[clamp(14px,1.2vw,20px)] h-[clamp(14px,1.2vw,20px)] text-gray-500 hover:text-gray-700 hover:scale-110 cursor-pointer transition-all duration-300"
                          onClick={handleShare}
                        />
                        
                        {/* Menu de opções de compartilhamento */}
                        {showShareOptions && (
                          <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-50">
                            <button 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                              onClick={() => shareToSocial('whatsapp')}
                            >
                              <FaWhatsapp className="mr-2 text-green-500 text-lg" /> WhatsApp
                            </button>
                            <button 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                              onClick={() => shareToSocial('facebook')}
                            >
                              <FaFacebookF className="mr-2 text-blue-600 text-lg" /> Facebook
                            </button>
                            <button 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                              onClick={() => shareToSocial('twitter')}
                            >
                              <FaTwitter className="mr-2 text-blue-400 text-lg" /> Twitter
                            </button>
                            <button 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                              onClick={() => shareToSocial('pinterest')}
                            >
                              <FaPinterestP className="mr-2 text-red-600 text-lg" /> Pinterest
                            </button>
                            <button 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                              onClick={() => shareToSocial('email')}
                            >
                              <FaEnvelope className="mr-2 text-gray-500 text-lg" /> Email
                            </button>
                            <button 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center" 
                              onClick={() => shareToSocial('copy')}
                            >
                              <FaCopy className="mr-2 text-gray-600 text-lg" /> Copiar link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preço */}
                    <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 sm:gap-4 mb-2">
                            <span className="text-[clamp(0.95rem,1.2vw,1.125rem)] text-gray-400">
                              {mostrarPreco ? (
                                <span className="line-through">
                                  de R$ {item.price_original?.toFixed(2)}
                                </span>
                              ) : (
                                "de ********"
                              )}
                            </span>
                            <button 
                              onClick={() => setMostrarPreco(!mostrarPreco)}
                              className="transform hover:scale-110 transition-all duration-300"
                            >
                              <img
                                src={mostrarPreco ? "/catalogo/Olho aberto.svg" : "/catalogo/olho fechado.svg"}
                                alt="Visualizar"
                                className="w-[clamp(24px,2vw,32px)] h-[clamp(24px,2vw,32px)] text-gray-600"
                              />
                            </button>
                          </div>
                          <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold text-black">
                            {mostrarPreco ? (
                              `R$ ${item.price_promotional?.toFixed(2)}`
                            ) : (
                              "R$ ******"
                            )}
                          </h2>
                        </div>
                        <a 
                          href={item.button_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="
                            bg-[#C4B398] hover:bg-[#b3a284] 
                            text-white px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.5rem,0.8vw,0.75rem)]
                            rounded-full shadow
                            transition-all duration-300
                            hover:scale-105
                            text-[clamp(0.85rem,1.2vw,1rem)] font-medium
                            self-end
                            whitespace-nowrap
                          "
                        >
                          Saiba mais...
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vídeo em Mobile */}
                <div className="lg:hidden w-full mt-6">
                  <div className="relative w-full aspect-[9/16] max-w-[300px] mx-auto rounded-2xl overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-[url('/catalogo/Group.svg')] bg-center bg-no-repeat opacity-30 pointer-events-none" style={{ backgroundSize: '100%' }} />
                    {item.video_embed ? (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.video_embed }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500 text-center p-4">Vídeo não disponível</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Produtos Relacionados */}
                <div className="mt-6 sm:mt-8 w-full">
                  <h3 className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold text-gray-800 mb-2 sm:mb-3 ml-[clamp(2rem,4vw,6rem)]">
                    Produtos Relacionados
                  </h3>
                  <div className="relative ml-[clamp(2rem,4vw,6rem)]">
                    <button
                      onClick={() => scrollCarrossel("left")}
                      className="
                        absolute left-0 top-1/2 transform -translate-y-1/2 z-10
                        bg-black text-white w-[clamp(16px,1.8vw,28px)] h-[clamp(16px,1.8vw,28px)] rounded-full 
                        flex items-center justify-center shadow-md
                        transition-all duration-300
                        hover:scale-110
                        p-1
                      "
                    >
                      ❮
                    </button>
                    <button
                      onClick={() => scrollCarrossel("right")}
                      className="
                        absolute right-0 top-1/2 transform -translate-y-1/2 z-10
                        bg-black text-white w-[clamp(16px,1.8vw,28px)] h-[clamp(16px,1.8vw,28px)] rounded-full 
                        flex items-center justify-center shadow-md
                        transition-all duration-300
                        hover:scale-110
                        p-1
                      "
                    >
                      ❯
                    </button>
                    <div
                      ref={carrosselRef}
                      className="flex overflow-x-auto gap-[clamp(1.5rem,3vw,5rem)] px-4 sm:px-6 py-3 scroll-smooth hide-scrollbar cursor-grab w-[calc(100%-clamp(32px,3.6vw,56px))] mx-auto"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleMouseUp}
                      onTouchMove={handleTouchMove}
                    >
                      {relacionados?.map((produto, idx) => (
                        <div 
                          key={idx} 
                          className="flex-shrink-0 flex flex-col items-center item-carrossel"
                          onClick={() => navigateToProduct(produto.id)}
                        >
                          <img
                            src={produto.images[0]}
                            alt={produto.name}
                            className="h-[clamp(48px,6vw,96px)] w-auto object-contain hover:scale-110 transition-all duration-300 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vídeo em Desktop */}
              <div className="hidden lg:flex items-center justify-center h-full relative">
                <div className="absolute inset-0 bg-[url('/catalogo/Group.svg')] bg-center bg-no-repeat opacity-30 pointer-events-none" style={{ backgroundSize: 'clamp(400px,45vw,600px)' }} />
                <div className="w-[clamp(220px,35vw,400px)] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl relative z-10 hover:shadow-2xl transition-all duration-300">
                  {item.video_embed ? (
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.video_embed }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500 text-center p-4">Vídeo não disponível</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Controles do slider */}
        <button 
          onClick={() => setSlideIndex(Math.max(slideIndex-1,0))} 
          className="absolute left-4 top-[40%] lg:top-1/2 transform -translate-y-1/2 z-40 bg-[#E6E6E6] rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center"
        >
          ❮
        </button>
        <button 
          onClick={() => setSlideIndex(Math.min(slideIndex+1, slides.length-1))} 
          className="absolute right-4 top-[40%] lg:top-1/2 transform -translate-y-1/2 z-40 bg-[#E6E6E6] rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center"
        >
          ❯
        </button>
      </motion.div>
    </div>
  );
}
