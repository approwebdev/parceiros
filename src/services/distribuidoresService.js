import { supabase } from '../supabaseClient';

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

// Função para formatar a distância
const formatarDistancia = (distancia) => {
  if (distancia === null || distancia === undefined) return 'Distância desconhecida';
  
  if (distancia < 1) {
    return `${Math.round(distancia * 1000)}m`;
  } else {
    return `${Math.round(distancia)}km`;
  }
};

export const getDistribuidores = async () => {
  try {
    console.log('Iniciando busca de distribuidores no Supabase...');
    
    const { data, error } = await supabase
      .from('distribuidores')
      .select(`
        id,
        name,
        email,
        phone,
        address,
        instagram,
        logo_url,
        plan_id,
        cidade,
        estado,
        plans (
          id,
          name
        )
      `)
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar distribuidores:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('Nenhum distribuidor encontrado no banco de dados');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de distribuidores:', error);
    throw error;
  }
};

// Função para geocodificar um endereço
const geocodificarEndereco = async (endereco, geocoder) => {
  if (!geocoder || !endereco) {
    console.warn('Geocoder ou endereço não disponível');
    return null;
  }

  try {
    const result = await new Promise((resolve, reject) => {
      geocoder.geocode({ 
        address: endereco,
        region: 'BR' // Forçar resultados no Brasil
      }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0]);
        } else {
          console.warn(`Status do geocoding: ${status} para endereço: ${endereco}`);
          reject(new Error(`Geocoding falhou: ${status}`));
        }
      });
    });

    if (!result || !result.geometry || !result.geometry.location) {
      console.warn('Resultado do geocoding inválido:', result);
      return null;
    }

    return {
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
      cidade: result.address_components.find(c => c.types.includes('administrative_area_level_2'))?.long_name,
      estado: result.address_components.find(c => c.types.includes('administrative_area_level_1'))?.short_name
    };
  } catch (error) {
    console.warn('Erro ao geocodificar:', error);
    return null;
  }
};

export const getDistribuidoresPorDistancia = async (latitude, longitude, raio = 100) => {
  try {
    console.log('Iniciando busca por distância:', { latitude, longitude, raio });
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Chave do Google Maps não encontrada');
      throw new Error('Chave do Google Maps não configurada. Verifique o arquivo .env');
    }

    // Verificar se a API do Google Maps está carregada
    if (!window.google || !window.google.maps) {
      console.error('API do Google Maps não carregada');
      throw new Error('API do Google Maps não carregada. Verifique se a chave está correta e se a API está habilitada.');
    }

    // Buscar todos os distribuidores
    console.log('Buscando distribuidores...');
    const distribuidores = await getDistribuidores();
    console.log(`Encontrados ${distribuidores.length} distribuidores no total`);
    
    const geocoder = new window.google.maps.Geocoder();

    // Geocodificar e calcular distância para cada distribuidor
    console.log('Calculando distâncias...');
    const distribuidoresProcessados = await Promise.all(
      distribuidores.map(async distribuidor => {
        // Montar o endereço completo para geocoding
        const enderecoCompleto = [
          distribuidor.address,
          distribuidor.cidade,
          distribuidor.estado,
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
            console.log(`Distribuidor ${distribuidor.name}: ${distanceFormatted}`);
          } else {
            console.warn(`Não foi possível geocodificar o endereço de ${distribuidor.name}: ${enderecoCompleto}`);
          }
        } catch (error) {
          console.warn(`Erro ao processar distribuidor ${distribuidor.name}:`, error);
        }

        return {
          ...distribuidor,
          lat,
          lng,
          distancia,
          distance: distanceFormatted,
          enderecoCompleto
        };
      })
    );

    // Filtrar distribuidores dentro do raio especificado
    console.log('Filtrando distribuidores por distância...');
    const distribuidoresFiltrados = distribuidoresProcessados
      .filter(d => {
        if (d.distancia === null) {
          console.warn(`Distribuidor ${d.name} sem distância calculada`);
          return false;
        }
        const dentroDoRaio = d.distancia <= raio;
        if (!dentroDoRaio) {
          console.log(`Distribuidor ${d.name} fora do raio (${d.distance})`);
        }
        return dentroDoRaio;
      })
      .sort((a, b) => a.distancia - b.distancia);

    console.log(`Encontrados ${distribuidoresFiltrados.length} distribuidores dentro do raio de ${raio}km`);
    return distribuidoresFiltrados;
  } catch (error) {
    console.error('Erro ao buscar distribuidores por distância:', error);
    throw error;
  }
}; 