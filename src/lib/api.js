import { supabase } from '../supabaseClient';

/**
 * Busca todas as categorias
 * @returns {Promise<Array>} Lista de categorias
 */
export const getCategories = async () => {
  try {
    console.log('Iniciando busca de categorias no Supabase...');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (data && data.length > 0) {
      console.log('Categorias encontradas (dados completos):', data);
      console.log('IDs das categorias:', data.map(cat => cat.id));
    }

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

/**
 * Busca notificações disponíveis
 * @returns {Promise<Array>} Lista de notificações
 */
export const getNotifications = async () => {
  try {
    console.log('Tentando buscar notificações direto do Supabase...');
    
    // Tentativa 1: Nome da tabela em lowercase
    let result = await supabase.from('notificacoes').select('*');
    console.log('Tentativa 1 (notificacoes):', result);
    
    if (result.data && result.data.length > 0) {
      console.log('Sucesso na tentativa 1!');
      return result.data;
    }
    
    // Tentativa 2: Nome da tabela em formato diferente
    result = await supabase.from('Notificacoes').select('*');
    console.log('Tentativa 2 (Notificacoes):', result);
    
    if (result.data && result.data.length > 0) {
      console.log('Sucesso na tentativa 2!');
      return result.data;
    }
    
    // Tentativa 3: Nome da tabela em inglês
    result = await supabase.from('notifications').select('*');
    console.log('Tentativa 3 (notifications):', result);
    
    if (result.data && result.data.length > 0) {
      console.log('Sucesso na tentativa 3!');
      return result.data;
    }
    
    // Tentativa 4: Listar todas as tabelas disponíveis
    console.log('Tentando listar todas as tabelas disponíveis...');
    try {
      const { data: tableList } = await supabase.rpc('get_tables');
      console.log('Tabelas disponíveis:', tableList);
    } catch (err) {
      console.error('Erro ao listar tabelas:', err);
    }
    
    // Se nenhuma das tentativas funcionou, usar dados estáticos como fallback
    console.log('Nenhuma tentativa funcionou, usando dados estáticos...');
    
    const notificacoesEstaticas = [
      {
        id: 1,
        titulo: 'Notificação de Teste 1',
        conteudo: 'Esta é uma notificação de teste para verificar se o componente está funcionando.',
        tipo: 'info',
        status: 'ativo',
        created_at: new Date().toISOString(),
        visibilidade: 'todos'
      },
      {
        id: 2,
        titulo: 'Notificação de Teste 2',
        conteudo: 'Segunda notificação de teste para o sistema.',
        tipo: 'alerta',
        status: 'ativo',
        created_at: new Date(Date.now() - 86400000).toISOString(), // ontem
        visibilidade: 'catalogo_distribuidores'
      },
      {
        id: 3,
        titulo: 'Promoção Especial',
        conteudo: 'Aproveite nossa promoção especial em todos os produtos premium.',
        tipo: 'promo',
        status: 'ativo',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 dias atrás
        visibilidade: 'todos'
      }
    ];
    
    console.log('Retornando dados estáticos:', notificacoesEstaticas);
    return notificacoesEstaticas;
  } catch (error) {
    console.error('Erro crítico ao buscar notificações:', error);
    
    // Notificações estáticas como fallback em caso de erro
    return [
      {
        id: 1,
        titulo: 'Notificação de Erro',
        conteudo: 'Houve um problema ao carregar as notificações. Por favor, tente novamente mais tarde.',
        tipo: 'erro',
        status: 'ativo',
        created_at: new Date().toISOString(),
        visibilidade: 'todos'
      }
    ];
  }
};

/**
 * Busca um produto pelo id
 * @param {string} id - O id do produto
 * @returns {Promise<Object>} O produto encontrado ou null
 */
export const getProductById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID do produto não fornecido');
    }

    console.log('Iniciando getProductById para o ID:', id);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        product_images(id, url, is_main)
      `)
      .eq('id', id)
      .or('visibility.eq.todos,visibility.eq.catalogo_distribuidores')
      .single();

    if (error) {
      // Se o erro for de item não encontrado, retorna uma mensagem melhor
      if (error.code === 'PGRST116') {
        console.error(`Produto com ID ${id} não encontrado no banco de dados`);
        throw new Error(`Produto com ID ${id} não encontrado`);
      }
      console.error('Erro ao buscar produto:', error);
      throw new Error(error.message);
    }

    if (!data) {
      console.error(`Produto com ID ${id} retornou nulo`);
      throw new Error(`Não foi possível encontrar o produto com ID ${id}`);
    }

    console.log('Dados brutos do produto recebido:', data);
    console.log('Imagens do produto recebidas:', data.product_images);

    // Garantir que todas as propriedades existam, mesmo se forem nulas
    const formattedData = {
      ...data,
      category: data.category || { name: 'Sem categoria' },
      description: data.description || '',
      mini_description: data.mini_description || '',
      real_price: data.real_price || 0,
      promo_price: data.promo_price || 0,
      button_link: data.button_link || '#',
      button_color: data.button_color || '#C4B398',
      button_text: data.button_text || 'Saiba mais...',
      video_embed: data.video_embed || '',
      // Manter a compatibilidade caso não tenha imagens
      product_images: data.product_images?.length > 0
        ? data.product_images
        : [
        { url: '/catalogo/produtos/1.png' },
        { url: '/catalogo/produtos/2.png' },
        { url: '/catalogo/produtos/3.png' }
      ]
    };

    console.log('Dados formatados na API:', formattedData);
    return formattedData;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

/**
 * Busca produtos por categoria
 * @param {string} categoryId - O ID da categoria (UUID)
 * @returns {Promise<Array>} Lista de produtos da categoria
 */
export const getProductsByCategory = async (categoryId) => {
  try {
    if (!categoryId) {
      console.error('ID da categoria não fornecido');
      return [];
    }

    console.log('ID da categoria recebido:', categoryId, 'Tipo:', typeof categoryId);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images!inner (
          id,
          url
        )
      `)
      .eq('category_id', categoryId)
      .eq('product_images.is_main', true)
      .or('visibility.eq.todos,visibility.eq.catalogo_distribuidores');

    console.log('Query executada para category_id:', categoryId);
    console.log('Produtos encontrados:', data);

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

/**
 * Busca produtos relacionados da mesma categoria
 * @param {string} category - A categoria dos produtos
 * @param {string} currentId - O id do produto atual (para excluí-lo dos resultados)
 * @returns {Promise<Array>} Lista de produtos relacionados
 */
export const getRelatedProducts = async (category, currentId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        product_images(id, url, is_main)
      `)
      .eq('category_id', category)
      .neq('id', currentId)
      .or('visibility.eq.todos,visibility.eq.catalogo_distribuidores')
      .limit(4);

    if (error) {
      console.error('Erro ao buscar produtos relacionados:', error);
      throw new Error(error.message);
    }

    // Formatar os dados para manter compatibilidade com o componente
    const formattedData = data.map(product => ({
      ...product,
      // Usar as imagens reais do produto, caso existam
      product_images: product.product_images?.length > 0
        ? product.product_images
        : [
        { url: '/catalogo/produtos/1.png' },
        { url: '/catalogo/produtos/2.png' },
        { url: '/catalogo/produtos/3.png' }
      ]
    }));

    return formattedData;
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    throw error;
  }
};

/**
 * Busca banners disponíveis para uma posição específica
 * @param {string} posicao - A posição onde o banner será exibido (opcional)
 * @returns {Promise<Array>} Lista de banners
 */
export const getBanners = async (posicao = null) => {
  try {
    console.log('Iniciando busca de banners para posição:', posicao);
    
    // Banner padrão para fallback
    const defaultBanner = {
      id: 1,
      titulo: 'Kits Home Care',
      descricao: 'Trate seus cabelos com eficiência!',
      cta_texto: 'Saiba mais',
      cta_link: '#',
      imagem_url: '/catalogo/foto anapaula.png',
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
      descricao: banner.descricao || 'Trate seus cabelos com eficiência!',
      cta_texto: banner.cta_texto || 'Saiba mais',
      cta_link: banner.cta_link || '#',
      imagem_url: banner.imagem_url || '/catalogo/foto anapaula.png',
      posicao: banner.posicao || posicao || 'todos'
    }));
    
    console.log('Banners processados e validados:', validBanners);
    return validBanners;
  } catch (error) {
    console.error('Erro não tratado ao buscar banners:', error);
    console.log('Retornando banner padrão devido a erro não tratado');
    
    // Retornar dados mockados em caso de erro
    return [{
      id: 1,
      titulo: 'Kits Home Care',
      descricao: 'Trate seus cabelos com eficiência!',
      cta_texto: 'Saiba mais',
      cta_link: '#',
      imagem_url: '/catalogo/foto anapaula.png',
      posicao: posicao || 'todos'
    }];
  }
};

/**
 * Busca banners por tipo específico
 * @param {string} tipo - O tipo de banner a ser buscado
 * @returns {Promise<Array>} Lista de banners do tipo especificado
 */
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
    console.error('Erro não tratado ao buscar banners por tipo:', error);
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