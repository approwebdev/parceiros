import React from 'react';
import { FaChevronDown, FaListUl, FaMapMarkerAlt } from 'react-icons/fa';

const DistanceFilter = ({ currentDistance, onDistanceChange, currentView, onViewChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Filtro de Distância */}
      <div className="relative w-full sm:w-64">
        <select
          value={currentDistance}
          onChange={(e) => onDistanceChange(e.target.value)}
          className="appearance-none w-full bg-gray-100 text-gray-500 py-2.5 md:py-3 px-4 md:px-6 rounded-[36px] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer border-0 text-center text-base min-[430px]:text-lg"
        >
          <option value="todos">Todos</option>
          <option value="10km">10km</option>
          <option value="25km">25km</option>
          <option value="50km">50km</option>
          <option value="100km">100km</option>
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <FaChevronDown className="text-gray-400" />
        </div>
      </div>

      {/* Botões de Visualização */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewChange('list')}
          className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-[36px] text-base min-[430px]:text-lg transition-colors ${
            currentView === 'list'
              ? 'bg-[#1F7EB5] text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <FaListUl />
          Lista
        </button>
        <button
          onClick={() => onViewChange('map')}
          className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-[36px] text-base min-[430px]:text-lg transition-colors ${
            currentView === 'map'
              ? 'bg-[#1F7EB5] text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <FaMapMarkerAlt />
          Mapa
        </button>
      </div>
    </div>
  );
};

export default DistanceFilter; 