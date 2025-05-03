import React from 'react';
import { FaWhatsapp, FaInstagram, FaStoreAlt, FaMapMarkerAlt } from 'react-icons/fa';

const ParceiroCard = ({ distributor }) => {
  // Log do parceiro para debug
  console.log('Renderizando parceiro:', distributor);
  
  // Gerar iniciais para avatar caso não tenha logo
  const getInitials = (name) => {
    if (!name) return 'XX';
    return name.split(' ').slice(0, 2).map(n => n[0] || '').join('');
  };
  
  // Verificar se deve exibir a distância (existente, não-nula e menor que 100)
  const deveExibirDistancia = () => {
    // Adicionar debug para entender os valores
    console.log(`Verificando distância: ${JSON.stringify({
      id: distributor.id,
      nome: distributor.name,
      distance: distributor.distance,
      distancia: distributor.distancia,
      tipo: typeof distributor.distance
    })}`);
    
    // Se a distância não estiver definida, não é válida
    if (distributor.distance === undefined || distributor.distance === null) {
      return false;
    }
    
    // Se for um número diretamente, verificar se é menor que 100
    if (typeof distributor.distancia === 'number') {
      return distributor.distancia <= 100;
    }
    
    // Se o formato for "1km" ou "500m", então deve ser válido e apenas exibir se for menor que 100km
    if (typeof distributor.distance === 'string') {
      // Se contém 'km', verificar se é menor que 100
      if (distributor.distance.includes('km')) {
        const valor = parseInt(distributor.distance, 10);
        return !isNaN(valor) && valor <= 100;
      }
      
      // Se contém 'm', sempre mostrar
      if (distributor.distance.includes('m')) {
        return true;
      }
    }
    
    // Em caso de dúvida, não mostrar
    return false;
  };
  
  const imagePlaceholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(distributor.name))}&background=e0e0e0&color=555&size=96`;

  const openMapLink = (address) => {
    if (!address) return;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };
  
  // Formatar o endereço completo
  const getEnderecoCompleto = () => {
    const partes = [];
    if (distributor.address) partes.push(distributor.address);
    if (distributor.cidade) partes.push(distributor.cidade);
    if (distributor.estado) partes.push(distributor.estado);
    
    return partes.join(', ');
  };
  
  // Formatar a localização cidade/estado
  const getLocalizacao = () => {
    if (distributor.cidade && distributor.estado) {
      return `${distributor.cidade}, ${distributor.estado}`;
    } else if (distributor.cidade) {
      return distributor.cidade;
    } else if (distributor.estado) {
      return distributor.estado;
    }
    return '';
  };

  // Usar o endereço completo para o mapa
  const handleOpenMap = () => {
    // Se temos enderecoCompleto (que vem do serviço), usar ele
    if (distributor.enderecoCompleto) {
      openMapLink(distributor.enderecoCompleto);
    } else {
      // Caso contrário, formar nosso próprio endereço completo
      openMapLink(getEnderecoCompleto());
    }
  };

  return (
    <div className="relative bg-gray-50 rounded-[16px] md:rounded-[96px] shadow-md p-4 md:p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:shadow-lg transition-shadow duration-200">
      {/* Container da Imagem com tamanho fixo */}
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm relative border-2 border-white mx-auto md:mx-0 mt-6 md:mt-0">
        <img
          src={distributor.logo_url || imagePlaceholder}
          alt={distributor.name}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { e.target.onerror = null; e.target.src = imagePlaceholder }}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-grow min-w-0 text-center md:text-left">
        {/* Nome */}
        <h3 className="text-xl md:text-2xl font-semibold text-gray-600 mb-2">
          {distributor.name}
        </h3>
              
        {/* Contatos e Endereço */}
        <div className="space-y-3">
          {/* Contatos (WhatsApp e Instagram) */}
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-center md:justify-start">
            {distributor.phone && (
              <a href={`https://wa.me/${distributor.phone.replace(/\D/g, '')}`} 
                className="flex items-center gap-2 text-gray-500 hover:text-[#1F7EB5]">
                <div className="bg-gray-200 rounded-full p-1.5">
                  <FaWhatsapp className="text-gray-500" size={14} />
                </div>
                {distributor.phone}
              </a>
            )}
            
            {distributor.instagram && (
              <a 
                href={`https://instagram.com/${distributor.instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 hover:text-[#1F7EB5]"
              >
                <div className="bg-gray-200 rounded-full p-1.5">
                  <FaInstagram className="text-gray-500" size={14} />
                </div>
                {distributor.instagram}
              </a>
            )}
          </div>

          {/* Endereço */}
          {distributor.address && (
            <div className="flex justify-center md:justify-start">
              <div 
                onClick={handleOpenMap}
                className="flex items-start gap-2 text-[#1F7EB5] hover:underline cursor-pointer max-w-full"
              >
                <div className="bg-gray-200 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                  <FaStoreAlt className="text-gray-500" size={14} />
                </div>
                <span className="leading-tight text-base md:text-lg break-words">{getEnderecoCompleto()}</span>
              </div>
            </div>
          )}
          
          {/* Localização (Cidade/Estado) sem endereço */}
          {!distributor.address && getLocalizacao() && (
            <div className="flex justify-center md:justify-start">
              <div className="flex items-start gap-2 text-gray-500">
                <div className="bg-gray-200 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                  <FaMapMarkerAlt className="text-gray-500" size={14} />
                </div>
                <span className="text-sm md:text-base">{getLocalizacao()}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Distância (se disponível e menor ou igual a 100) */}
        {deveExibirDistancia() && (
          <div className="mt-3 flex items-center justify-center md:justify-start text-gray-600">
            <span className="text-base md:text-lg font-medium">
              A {distributor.distance} de você
            </span>
            <div className="ml-2 text-[#1F7EB5]">
              <FaMapMarkerAlt size={18} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParceiroCard; 