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
 * Busca notificações disponíveis (versão garantida com dados estáticos)
 * @returns {Promise<Array>} Lista de notificações
 */
export const getNotifications = async () => {
  try {
    console.log('Retornando notificações estáticas diretamente...');
    
    // Dados estáticos garantidos
    const notificacoesGarantidas = [
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
    
    return notificacoesGarantidas;
  } catch (error) {
    console.error('Erro nos dados estáticos (nunca deveria acontecer):', error);
    
    // Dados absolutamente garantidos sem falha
    return [
      {
        id: 999,
        titulo: 'Notificação de Emergência',
        conteudo: 'Se você está vendo esta notificação, contate o administrador do sistema.',
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