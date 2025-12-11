/**
 * Componente de Filtros para el Dashboard de Cocina
 */
import { useTranslation } from 'react-i18next';

function KitchenFilters({ filter, onFilterChange }) {
  const { t } = useTranslation();
  const filters = [
    { value: '', label: t('kitchen.filterAll') },
    { value: 'RECEIVED', label: t('kitchen.filterReceived') },
    { value: 'PREPARING', label: t('kitchen.filterPreparing') },
    { value: 'READY', label: t('kitchen.filterReady') },
  ];

  return (
    <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
      {filters.map((filterOption) => (
        <button
          key={filterOption.value}
          onClick={() => onFilterChange(filterOption.value)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
            filter === filterOption.value
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
}

export default KitchenFilters;

