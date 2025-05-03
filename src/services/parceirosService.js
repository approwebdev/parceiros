import { supabase } from '../supabaseClient';
import config from '../config';

// Implementação local das funções de banners sem depender do import de api.js
// Busca banners disponíveis para uma posição específica
export const getBanners = async (posicao = null) => {
  try {
    console.log('Iniciando busca de banners para posição:', posicao);
    
    // Banner padrão para fallback
    const defaultBanner = {
      id: 1,
      titulo: 'Kits Home Care',
      descricao: 'Encontre os salões que utilizam Ap Professional!',
      cta_texto: 'Saiba mais',
      cta_link: '#',
      imagem_url: '/catalogo/foto 2.png',
      tipo: 'banner',
      posicao: posicao || 'todos'
    };
    
    // Tentativa de buscar do Supabase
    let query = supabase.from('banners').select('*');
    
    if (posicao) {
      // Construir a expressão de filtro corretamente
      query = query.or(`posicao.eq.${posicao},posicao.eq.todos`);
    }
    
    console.log('Executando query de banners...');
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro do Supabase ao buscar banners:', error);
      console.log('Retornando banner padrão devido ao erro do Supabase');
      return [defaultBanner];
    }
    
    console.log('Resposta do Supabase para banners:', data);
    
    // Verificar se os dados são válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('Nenhum banner encontrado no Supabase, retornando banner padrão');
      return [defaultBanner];
    }
    
    // Garantir que todos os banners tenham os campos necessários
    const validBanners = data.map(banner => ({
      id: banner.id || 1,
      titulo: banner.titulo || 'Kits Home Care',
      descricao: banner.descricao || 'Encontre os salões que utilizam Ap Professional!',
      cta_texto: banner.cta_texto || 'Saiba mais',
      cta_link: banner.cta_link || '#',
      imagem_url: banner.imagem_url || '/catalogo/foto 2.png',
      tipo: banner.tipo || 'banner',
      posicao: banner.posicao || posicao || 'todos'
    }));
    
    console.log('Banners processados e validados:', validBanners);
    return validBanners;
  } catch (error) {
    console.error('Erro não tratado em getBanners:', error);
    console.log('Retornando banner padrão devido a erro não tratado');
    
    // Retornar dados mockados em caso de erro
    return [{
      id: 1,
      titulo: 'Kits Home Care',
      descricao: 'Encontre os salões que utilizam Ap Professional!',
      cta_texto: 'Saiba mais',
      cta_link: '#',
      imagem_url: '/catalogo/foto 2.png',
      tipo: 'banner',
      posicao: posicao || 'todos'
    }];
  }
};

// Função para buscar banners por tipo específico
export const getBannersByType = async (tipo) => {
  try {
    console.log('Iniciando busca de banners do tipo:', tipo);
    
    // Banner padrão para fallback
    const defaultBanner = {
      id: 1,
      titulo: 'Atenção',
      descricao: 'Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.',
      cta_texto: 'Saiba mais',
      cta_link: '#',
      imagem_url: '',
      tipo: tipo || 'informativo'
    };
    
    // Busca banners do tipo especificado
    let query = supabase.from('banners').select('*');
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    console.log('Executando query de banners por tipo...');
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro do Supabase ao buscar banners por tipo:', error);
      console.log('Retornando banner padrão devido ao erro do Supabase');
      return [defaultBanner];
    }
    
    console.log('Resposta do Supabase para banners por tipo:', data);
    
    // Verificar se os dados são válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('Nenhum banner do tipo encontrado no Supabase, retornando banner padrão');
      return [defaultBanner];
    }
    
    // Garantir que todos os banners tenham os campos necessários
    const validBanners = data.map(banner => ({
      id: banner.id || 1,
      titulo: banner.titulo || 'Atenção',
      descricao: banner.descricao || 'Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.',
      cta_texto: banner.cta_texto || 'Saiba mais',
      cta_link: banner.cta_link || '#',
      imagem_url: banner.imagem_url || '',
      tipo: banner.tipo || tipo
    }));
    
    console.log('Banners por tipo processados e validados:', validBanners);
    return validBanners;
  } catch (error) {
    console.error('Erro não tratado em getBannersByType:', error);
    console.log('Retornando banner padrão devido a erro não tratado');
    
    // Retornar dados mockados em caso de erro
    return [{
      id: 1,
      titulo: 'Atenção',
      descricao: 'Este site apenas informa quais salões utilizam os produtos A&P Professional. A responsabilidade pela qualidade dos serviços prestados é exclusivamente do salão listado acima.',
      cta_texto: 'Saiba mais',
      cta_link: '#',
      imagem_url: '',
      tipo: tipo || 'informativo'
    }];
  }
};

// Função auxiliar de geocodificação
const geocodificarEndereco = async (endereco, geocoder) => {
  try {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: endereco }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error(`Geocoding falhou: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error(`Erro ao geocodificar endereço ${endereco}:`, error);
    return null;
  }
};

// Função para formatar distância
const formatarDistancia = (distancia) => {
  if (distancia === null || distancia === undefined) return 'Desconhecida';
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`;
  return `${Math.round(distancia)}km`;
};

// Função para calcular a distância entre duas coordenadas em km (fórmula de Haversine)
const calcularDistancia = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c; // Distância em km
  
  return distancia;
};

// Função para buscar todos os parceiros
export const getParceiros = async () => {
  try {
    console.log('Iniciando busca de parceiros no Supabase...');
    
    // Primeiro vamos listar as tabelas disponíveis para verificar se 'parceiros' existe
    console.log('Tentando obter informações sobre as tabelas disponíveis...');
    
    // Consulta original
    console.log('Executando consulta na tabela parceiros...');
    let { data, error } = await supabase
      .from('parceiros')
      .select(`
        id,
        name,
        email,
        phone,
        address,
        instagram,
        logo_url,
        cidade,
        estado
      `)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar parceiros:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      console.error('Detalhes:', error.details);
      
      // Tentativa alternativa - consultar distribuidores para verificar se a tabela existe
      console.log('Tentando consultar tabela distribuidores como alternativa...');
      const { data: distribuidoresData, error: distribuidoresError } = await supabase
        .from('distribuidores')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          instagram,
          logo_url,
          cidade,
          estado
        `)
        .order('name');
        
      if (!distribuidoresError) {
        console.log('Tabela distribuidores existe e foi acessada com sucesso');
        console.log('Número de distribuidores encontrados:', distribuidoresData.length);
        // Usar os dados de distribuidores como parceiros
        data = distribuidoresData;
        error = null;
      } else {
        console.error('Erro ao acessar distribuidores:', distribuidoresError);
        throw error; // Se nenhuma das tabelas estiver disponível, propagar o erro original
      }
    }

    console.log('Resposta da consulta (parceiros ou distribuidores):', data);
    
    if (!data || data.length === 0) {
      console.warn('Nenhum parceiro/distribuidor encontrado no banco de dados');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de parceiros:', error);
    throw error;
  }
};

// Função para buscar parceiros por distância
export const getParceirosPorDistancia = async (latitude, longitude, raio = 100) => {
  try {
    console.log('Iniciando busca por distância:', { latitude, longitude, raio });
    
    // Usar a chave do arquivo de configuração
    const apiKey = config.googleMapsApiKey;
    if (!apiKey) {
      console.error('Chave do Google Maps não encontrada');
      throw new Error('Chave do Google Maps não configurada');
    }

    // Verificar se a API do Google Maps está carregada
    if (!window.google || !window.google.maps) {
      console.error('API do Google Maps não carregada');
      throw new Error('API do Google Maps não carregada');
    }

    // Buscar todos os parceiros (usando o método que já tem fallback para distribuidores)
    console.log('Buscando parceiros...');
    const parceiros = await getParceiros();
    console.log(`Encontrados ${parceiros.length} parceiros/distribuidores no total`);
    
    const geocoder = new window.google.maps.Geocoder();

    // Geocodificar e calcular distância para cada parceiro
    console.log('Calculando distâncias...');
    const parceirosProcessados = await Promise.all(
      parceiros.map(async parceiro => {
        // Montar o endereço completo para geocoding
        const enderecoCompleto = [
          parceiro.address,
          parceiro.cidade,
          parceiro.estado,
          'Brasil'
        ].filter(Boolean).join(', ');

        // Geocoding usando JS API
        let lat = null, lng = null, distancia = null, distanceFormatted = 'Desconhecida';
        
        try {
          const result = await geocodificarEndereco(enderecoCompleto, geocoder);
          if (result) {
            lat = result.lat;
            lng = result.lng;
            distancia = calcularDistancia(latitude, longitude, lat, lng);
            distanceFormatted = formatarDistancia(distancia);
            console.log(`Parceiro/Distribuidor ${parceiro.name}: ${distanceFormatted}`);
          } else {
            console.warn(`Não foi possível geocodificar o endereço de ${parceiro.name}: ${enderecoCompleto}`);
          }
        } catch (error) {
          console.warn(`Erro ao processar parceiro/distribuidor ${parceiro.name}:`, error);
        }

        return {
          ...parceiro,
          lat,
          lng,
          distancia,
          distance: distanceFormatted,
          enderecoCompleto
        };
      })
    );

    // Filtrar parceiros dentro do raio especificado
    console.log('Filtrando parceiros/distribuidores por distância...');
    const parceirosFiltrados = parceirosProcessados
      .filter(p => {
        if (p.distancia === null) {
          console.warn(`Parceiro/Distribuidor ${p.name} sem distância calculada`);
          return false;
        }
        const dentroDoRaio = p.distancia <= raio;
        if (!dentroDoRaio) {
          console.log(`Parceiro/Distribuidor ${p.name} fora do raio (${p.distance})`);
        }
        return dentroDoRaio;
      })
      .sort((a, b) => a.distancia - b.distancia);

    console.log(`Encontrados ${parceirosFiltrados.length} parceiros/distribuidores dentro do raio de ${raio}km`);
    return parceirosFiltrados;
  } catch (error) {
    console.error('Erro ao buscar parceiros por distância:', error);
    throw error;
  }
}; 