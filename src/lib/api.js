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
 * Busca um produto pelo id
 * @param {string} id - O id do produto
 * @returns {Promise<Object>} O produto encontrado ou null
 */
export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        product_images(id, url, is_main)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      throw new Error(error.message);
    }

    // Usar as imagens reais do produto, caso existam
    const formattedData = {
      ...data,
      // Manter a compatibilidade caso não tenha imagens
      product_images: data.product_images?.length > 0
        ? data.product_images
        : [
            { url: '/catalogo/produtos/1.png' },
            { url: '/catalogo/produtos/2.png' },
            { url: '/catalogo/produtos/3.png' }
          ]
    };

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
      .eq('product_images.is_main', true);

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