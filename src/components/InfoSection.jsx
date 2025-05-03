import React, { useState, useEffect } from 'react';
import { FaPlayCircle } from 'react-icons/fa';
import { getBannersByType } from '../services/parceirosService';

// Remover a importação da imagem, pois será substituída pelo vídeo
// import infoImageSrc from '../assets/info-image.jpg';

const InfoSection = () => {
  const [informativo, setInformativo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInformativo = async () => {
      try {
        setLoading(true);
        setError(null);
        const informativos = await getBannersByType('informativo');
        console.log('Informativos carregados:', informativos);
        
        // Filtrar informativos para parceiros ou todos
        const informativosParaParceiros = informativos.filter(
          info => info.posicao === 'parceiros' || info.posicao === 'todos'
        );
        
        if (informativosParaParceiros && informativosParaParceiros.length > 0) {
          setInformativo(informativosParaParceiros[0]);
        } else {
          // Banner padrão caso não encontre nenhum
          setInformativo({
            titulo: 'Atenção',
            descricao: 'Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.',
            cta_texto: 'Saiba mais',
            cta_link: '#',
            imagem_url: '',
            posicao: 'todos'
          });
        }
      } catch (err) {
        console.error('Erro ao buscar informativo:', err);
        setError(err.message);
        
        // Banner padrão em caso de erro
        setInformativo({
          titulo: 'Atenção',
          descricao: 'Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.',
          cta_texto: 'Saiba mais',
          cta_link: '#',
          imagem_url: '',
          posicao: 'todos'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInformativo();
  }, []);

  return (
    <section className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Informativo para você
      </h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Exibir vídeo ou imagem se disponível */}
        {informativo?.imagem_url ? (
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <img 
              src={informativo.imagem_url} 
              alt="Informativo" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-gray-300 w-full h-64 md:h-80 flex items-center justify-center">
            <FaPlayCircle size={60} className="text-gray-600 opacity-50" />
          </div>
        )}

        {/* Seção de Atenção abaixo do vídeo/imagem */}
        <div className="bg-gray-100 p-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
            {informativo?.titulo || 'Atenção'}
          </h3>
          <p className="text-sm text-gray-600 text-center leading-relaxed max-w-2xl mx-auto">
            {informativo?.descricao || 'Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.'}
          </p>
          <div className="text-center mt-5">
            <a 
              href={informativo?.cta_link || '#'} 
              className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors inline-block"
            >
              {informativo?.cta_texto || 'Saiba mais'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection; 