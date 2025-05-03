import React, { useState, useEffect, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchSection from './components/SearchSection';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import { getParceiros, getParceirosPorDistancia, getBanners } from './services/parceirosService';
import ParceiroCard from './components/ParceiroCard';
import LocationFinder from './components/LocationFinder';
import MapView from './components/MapView';
import fotoAna from './assets/fotoana.jpg';
import DistanceFilter from './components/DistanceFilter';
import config from './config';
import './App.css';

function App() {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [view, setView] = useState('list'); // 'list' ou 'map'
  const [distanceFilter, setDistanceFilter] = useState(config.defaultDistance);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  
  // Carregar script do Google Maps para usar Geocoder
  const { isLoaded: mapsApiLoaded, loadError: mapsLoadError } = useJsApiLoader({
    googleMapsApiKey: config.googleMapsApiKey,
    libraries: ['places', 'geometry'],
  });
  
  // Log de debug
  useEffect(() => {
    console.log("Google Maps API:", { 
      apiKey: config.googleMapsApiKey ? "Definida" : "Não definida",
      carregada: mapsApiLoaded,
      erro: mapsLoadError ? mapsLoadError.message : "Nenhum"
    });
  }, [mapsApiLoaded, mapsLoadError]);

  // Converter o filtro de distância para km
  const parseDistanceFilter = (filter) => {
    if (filter === 'todos') return Infinity;
    return parseInt(filter.replace('km', ''));
  };

  // Função para buscar todos os parceiros
  const fetchAllParceiros = async () => {
    try {
      setLoading(true);
      const data = await getParceiros();
      console.log("Dados do Supabase:", data);
      setParceiros(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(`Erro ao buscar dados: ${error.message}`);
      setLoading(false);
    }
  };

  // Função para buscar parceiros com distância simulada quando temos localização
  const fetchParceirosPorDistancia = async () => {
    console.log('Iniciando busca por distância...');
    console.log('Localização:', userLocation);
    console.log('Filtro:', distanceFilter);

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      console.log('Localização do usuário não disponível, buscando todos os parceiros');
      await fetchAllParceiros();
      return;
    }

    try {
      setLoading(true);
      const maxDistance = parseDistanceFilter(distanceFilter);
      console.log("Buscando parceiros com distância máxima de:", maxDistance, "km");
      
      const data = await getParceirosPorDistancia(
        userLocation.lat,
        userLocation.lng,
        maxDistance
      );
      
      console.log("Parceiros encontrados:", data.length);
      setParceiros(data || []);
      setError(null);
    } catch (error) {
      console.error("Erro ao buscar parceiros por distância:", error);
      setError(`Erro ao buscar parceiros: ${error.message}`);
      await fetchAllParceiros();
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os parceiros no carregamento inicial
  useEffect(() => {
    fetchAllParceiros();
  }, []);

  // Efeito para buscar os banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannerLoading(true);
        // Buscar todos os banners e filtrar pelo tipo 'banner'
        const bannersData = await getBanners();
        console.log('Banners carregados (raw):', bannersData);
        console.log('Tipo dos banners:', typeof bannersData, Array.isArray(bannersData));
        
        // Filtrar apenas banners do tipo 'banner'
        const bannersFiltrados = bannersData.filter(banner => banner.tipo === 'banner');
        
        // Filtrar apenas banners que são para parceiros ou todos
        const bannersParaParceiros = bannersFiltrados.filter(
          banner => banner.posicao === 'parceiros' || banner.posicao === 'todos'
        );
        
        // Se houver banners disponíveis, usa todos
        if (bannersParaParceiros && bannersParaParceiros.length > 0) {
          console.log('Usando banners filtrados:', bannersParaParceiros);
          setBanners(bannersParaParceiros);
        } else {
          console.log('Nenhum banner válido encontrado, usando dados padrão');
          // Dados padrão para o banner caso não haja banners no banco
          setBanners([{
            titulo: 'Kits Home Care',
            descricao: 'Trate seus cabelos com eficiência!',
            cta_texto: 'Saiba mais',
            cta_link: '#',
            imagem_url: fotoAna,
            tipo: 'banner',
            posicao: 'todos'
          }]);
        }
      } catch (error) {
        console.error('Erro ao buscar banners:', error);
        console.log('Erro ao buscar banners, usando dados padrão');
        // Dados padrão para o banner em caso de erro
        setBanners([{
          titulo: 'Kits Home Care',
          descricao: 'Trate seus cabelos com eficiência!',
          cta_texto: 'Saiba mais',
          cta_link: '#',
          imagem_url: fotoAna,
          tipo: 'banner',
          posicao: 'todos'
        }]);
      } finally {
        setBannerLoading(false);
      }
    };
    
    fetchBanners();
  }, []);

  // Efeito para atualizar os parceiros quando a localização ou distância mudar
  useEffect(() => {
    if (!mapsApiLoaded) {
      console.log('Aguardando carregamento da API do Maps...');
      return;
    }
    
    if (loading) {
      console.log('Aguardando carregamento anterior terminar...');
      return;
    }

    console.log('Atualizando parceiros...');
    console.log('Localização:', userLocation);
    console.log('Filtro:', distanceFilter);
    
    const timeoutId = setTimeout(() => {
      fetchParceirosPorDistancia();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [userLocation, distanceFilter, mapsApiLoaded]);

  // Se houve erro ao carregar Maps API, mostra erro
  if (mapsLoadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Erro ao carregar Google Maps: {mapsLoadError.message}</div>
      </div>
    );
  }

  // Função para lidar com a localização encontrada
  const handleLocationFound = (location) => {
    console.log("Localização encontrada:", location);
    setUserLocation(location);
  };

  // Função para lidar com erros de localização
  const handleLocationError = (error) => {
    console.error("Erro ao obter localização:", error);
    // Não definir o erro no estado para não bloquear a interface
  };

  // Função para alternar entre visualizações
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Função para alterar o filtro de distância
  const handleDistanceChange = (newDistance) => {
    setDistanceFilter(newDistance);
  };

  // Função para lidar com o clique em um parceiro no mapa
  const handleParceiroClick = (parceiro) => {
    setSelectedParceiro(parceiro);
    setView('list'); // Mudar para a visualização de lista para mostrar os detalhes
    
    // Rolar até o parceiro selecionado
    const element = document.getElementById(`parceiro-${parceiro.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Adicionar classe de destaque temporariamente
      element.classList.add('bg-[#1F7EB5]/10');
      setTimeout(() => {
        element.classList.remove('bg-[#1F7EB5]/10');
      }, 2000);
    }
  };

  // Mostrar loader apenas na carga inicial (antes de termos userLocation)
  if (loading && parceiros.length === 0 && !userLocation) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando parceiros...</div>
      </div>
    );
  }

  if (error && parceiros.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <div className="relative">
          <Hero />
          {/* SearchSection sobreposta ao Hero */}
          <div className="absolute left-0 right-0 -bottom-12 md:bottom-0 transform md:translate-y-1/2 px-0 md:px-4">
            <div className="container mx-auto w-[100%] md:w-auto md:max-w-5xl">
              <SearchSection 
                onSearch={handleLocationFound} 
                mapsApiLoaded={mapsApiLoaded}
                mapsLoadError={mapsLoadError}
              />
            </div>
          </div>
        </div>
        
        {/* Container principal para conteúdo */}
        <div className="container mx-auto max-w-4xl px-4 md:px-6 mt-12 md:mt-20 space-y-4 md:space-y-8">
          {/* LocationFinder oculto mas funcional */}
          <div className="hidden">
            <LocationFinder 
              onLocationFound={handleLocationFound}
              onLocationError={handleLocationError}
            />
          </div>

          {/* Filtro de Distância e Alternância de Visualização */}
          <div className="pt-8 md:pt-24 flex justify-center">
            <DistanceFilter
              currentDistance={distanceFilter}
              onDistanceChange={handleDistanceChange}
              currentView={view}
              onViewChange={handleViewChange}
            />
          </div>

          {/* Título da seção */}
          <div className="mb-2 md:mb-4">
            <h2 className="text-xl min-[430px]:text-2xl md:text-3xl font-bold text-gray-800 text-center">
              {userLocation 
                ? `Parceiros próximos a você (${distanceFilter})` 
                : 'Todos os Parceiros'}
            </h2>
          </div>
          
          {/* Vista de mapa */}
          {view === 'map' && (
            <div className="mb-8">
              <MapView 
                distribuidores={parceiros} 
                userLocation={userLocation}
                onDistribuidorClick={handleParceiroClick}
                mapsApiLoaded={mapsApiLoaded}
                mapsLoadError={mapsLoadError}
                distanceFilter={distanceFilter}
              />
            </div>
          )}
          
          {/* Vista de lista */}
          {view === 'list' && (
            <div>
              {parceiros.length === 0 ? (
                <div className="text-xl text-gray-600 text-center py-12 bg-gray-50 rounded-lg">
                  {userLocation 
                    ? `Nenhum parceiro encontrado em um raio de ${distanceFilter}.`
                    : 'Nenhum parceiro encontrado.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {parceiros.map((parceiro) => (
                    <div 
                      id={`parceiro-${parceiro.id}`}
                      key={parceiro.id}
                      className={`transition-all duration-500 ${selectedParceiro?.id === parceiro.id ? 'ring-2 ring-blue-400 rounded-[36px]' : ''}`}
                    >
                      <ParceiroCard 
                        distributor={parceiro}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Banners de Kits - Mostrar apenas os banners para parceiros ou todos */}
        {banners.length > 0 && (
          <div className="container mx-auto max-w-4xl px-4 md:px-4 my-6 md:my-8 space-y-6">
            {banners.map((banner, index) => (
              <div key={banner.id || index} className="relative bg-black w-full h-[400px] md:h-[300px] rounded-[16px] overflow-hidden flex flex-col md:flex-row">
                {/* Lado esquerdo com texto */}
                <div className="flex-1 flex flex-col justify-center items-start p-6 md:p-12 z-10">
                  <h2 className="text-white text-xl md:text-2xl font-figtree mb-2">
                    {banner.titulo || 'Kits Home Care'}
                  </h2>
                  <h1 className="text-white text-3xl md:text-4xl font-figtree font-bold mb-6 max-w-md">
                    {banner.descricao || 'Trate seus cabelos com eficiência!'}
                  </h1>
                  <a 
                    href={banner.cta_link || '#'} 
                    className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-lg font-figtree hover:bg-gray-100 transition-colors text-sm md:text-base"
                  >
                    {banner.cta_texto || 'Saiba mais'}
                  </a>
                </div>

                {/* Lado direito com imagem */}
                <div className="flex-1 relative h-48 md:h-auto">
                  <img
                    src={banner.imagem_url || fotoAna}
                    alt="Imagem do banner"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <InfoSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
