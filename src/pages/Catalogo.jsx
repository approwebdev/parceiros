import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getNotifications } from "../lib/api";
import { FaBell } from "react-icons/fa";

export default function Catalogo() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

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

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-figtree overflow-hidden">
      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-text-container {
            top: 5% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            text-align: center !important;
            width: 100% !important;
            padding: 0 1rem !important;
            position: relative !important;
          }
          
          .mobile-text-container span:first-child {
            font-size: 4rem !important;
            margin-left: 0 !important;
            line-height: 0.9 !important;
          }
          
          .mobile-text-container .digital-text {
            font-size: 6.2rem !important;
            line-height: 0.9 !important;
            letter-spacing: -0.04em !important;
            margin-top: 0.5rem !important;
          }
          
          .mobile-text-container .distribuidor-text {
            position: static !important;
            transform: none !important;
            display: block !important;
            margin-top: 0.75rem !important;
            font-size: 1.7rem !important;
          }
          
          .mobile-text-container button {
            margin: 2.5rem auto 0 !important;
            font-size: 1.5rem !important;
            padding: 1rem 3rem !important;
          }
          
          .mobile-image-container {
            bottom: 0 !important;
            right: 50% !important;
            transform: translateX(50%) !important;
            height: 60vh !important;
            width: 100% !important;
          }

          .mobile-image-container img {
            object-position: bottom !important;
          }
          
          .mobile-instagram {
            display: none !important;
          }
        }

        @media (max-width: 380px) {
          .mobile-text-container {
            top: 3% !important;
          }

          .mobile-text-container span:first-child {
            font-size: 3.2rem !important;
          }
          
          .mobile-text-container .digital-text {
            font-size: 4.8rem !important;
          }
          
          .mobile-text-container .distribuidor-text {
            font-size: 1.4rem !important;
          }
          
          .mobile-text-container button {
            font-size: 1.3rem !important;
            padding: 0.875rem 2.5rem !important;
            margin-top: 2rem !important;
          }
        }
      `}</style>

      {/* CONTAINER PRINCIPAL DO HEADER */}
      <motion.div 
        className="relative w-full pt-[clamp(3rem,5vh,4rem)]" 
        style={{ height: "clamp(100px, 12vh, 140px)" }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center w-full h-full px-[8%]">
          {/* LOGO APPRO */}
          <motion.div 
            className="relative" 
            style={{ width: "clamp(90px, 8vw, 120px)" }}
            {...fadeIn}
          >
            <button 
              className="w-full transform transition duration-200 ease-in-out hover:scale-110"
              onClick={handleLogoClick}
            >
              <img
                src="/catalogo/icons/logo appro cinza.svg"
                alt="Logo Appro"
                className="w-full h-auto"
              />
            </button>
          </motion.div>

          {/* WHATSAPP + SINO */}
          <motion.div 
            className="flex items-center relative" 
            style={{ gap: "clamp(1.2rem, 2vw, 1.8rem)" }}
            {...fadeIn}
          >
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group transform transition-all duration-200 ease-in-out hover:scale-110"
            >
              <img
                src="/catalogo/icons/whatsapp cinza.svg"
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
                className="transition-all duration-200 text-gray-400"
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
                    {notifications.map((notification, index) => (
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
                    ))}
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

      {/* CONTAINER PRINCIPAL DO CONTEÚDO */}
      <div className="relative w-full h-[calc(100vh-clamp(100px,12vh,140px))]">
        {/* BLOCO DE TEXTO AJUSTADO */}
        <motion.div 
          className="absolute top-[45%] left-[8%] transform -translate-y-1/2 z-10 mobile-text-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            <motion.span
              className="block text-white font-bold"
              style={{
                fontSize: "clamp(3rem, 7vw, 6rem)",
                letterSpacing: "-0.03em",
                lineHeight: "1",
                marginLeft: "clamp(0.5rem, 1vw, 1rem)"
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Catálogo
            </motion.span>

            <div className="relative">
              <motion.span
                className="block text-gray-400 font-bold digital-text"
                style={{
                  fontSize: "clamp(4.5rem, 13vw, 15rem)",
                  letterSpacing: "-0.06em",
                  lineHeight: "0.9",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Digital
              </motion.span>
              
              <motion.span
                className="absolute right-0 bottom-0 text-white transform translate-y-full distribuidor-text"
                style={{
                  fontSize: "clamp(0.875rem, 2vw, 1.5rem)",
                  letterSpacing: "-0.01em",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Distribuidor Oficial
              </motion.span>
            </div>
          </div>

          <motion.button
            onClick={() => navigate("/menu")}
            className="mt-[clamp(3rem,5vh,4rem)] bg-white text-black font-semibold rounded-full shadow-lg transform transition duration-200 ease-in-out hover:scale-110"
            style={{
              fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
              paddingInline: "clamp(2.5rem, 7vw, 5rem)",
              paddingBlock: "clamp(1rem, 1.8vw, 1.5rem)",
              marginLeft: "clamp(0.5rem, 1vw, 1rem)"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Entrar
          </motion.button>
        </motion.div>

        {/* CONTAINER DA IMAGEM */}
        <motion.div 
          className="absolute bottom-0 right-[8%] h-[105%] pointer-events-none mobile-image-container" 
          style={{ width: "clamp(800px, 70vw, 1400px)" }}
          {...slideIn}
        >
          <div className="relative h-full w-full">
            <img
              src="/catalogo/foto anapaula.png"
              alt="Ana Paula"
              className="absolute bottom-0 right-0 h-[105%] w-auto object-contain select-none pointer-events-none"
            />
          </div>
        </motion.div>

        {/* INSTAGRAM */}
        <motion.div 
          className="absolute bottom-[5%] right-[8%] z-40 mobile-instagram"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <a
            href="https://www.instagram.com/anapaulacarvalhoof/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-white transform transition duration-200 ease-in-out hover:scale-110 hover:underline"
            style={{ 
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              gap: "clamp(0.3rem, 0.6vw, 0.6rem)"
            }}
          >
            <img
              src="/catalogo/icons/logo instagram.svg"
              alt="Instagram"
              style={{ width: "clamp(24px, 1.8vw, 28px)", height: "auto" }}
            />
            <span>Rede Social</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
