import PropTypes from 'prop-types';

/**
 * Componente de barra de herramientas con filtros
 * Permite seleccionar rango de fechas, agrupación y exportar CSV
 */
function FilterToolbar({ filters, onFilterChange, onQuery, onExport, loading }) {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50">
      <div className="flex flex-wrap gap-4 items-center">
        {/* From Date */}
        <div className="relative">
          <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="from-date"
          >
            From
          </label>
          <input
            className="w-full mt-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-md text-sm text-[#111813] dark:text-white focus:ring-primary focus:border-primary"
            id="from-date"
            type="date"
            value={filters.from}
            onChange={(e) => handleInputChange('from', e.target.value)}
          />
        </div>

        {/* To Date */}
        <div className="relative">
          <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="to-date"
          >
            Until
          </label>
          <input
            className="w-full mt-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-md text-sm text-[#111813] dark:text-white focus:ring-primary focus:border-primary"
            id="to-date"
            type="date"
            value={filters.to}
            onChange={(e) => handleInputChange('to', e.target.value)}
          />
        </div>

        {/* Group By */}
        <div className="relative">
          <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="group-by"
          >
            Group by
          </label>
          <select
            className="w-full mt-1 pl-3 pr-10 py-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-md text-sm text-[#111813] dark:text-white focus:ring-primary focus:border-primary"
            id="group-by"
            value={filters.groupBy}
            onChange={(e) => handleInputChange('groupBy', e.target.value)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onExport}
          disabled={loading}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-transparent text-[#111813] dark:text-white border border-gray-300 dark:border-gray-700 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="material-symbols-outlined text-xl">ios_share</span>
          <span className="truncate">Export CSV</span>
        </button>
        <button
          onClick={onQuery}
          disabled={loading}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="material-symbols-outlined text-xl">query_stats</span>
          <span className="truncate">{loading ? 'Cargando...' : 'View metrics'}</span>
        </button>
      </div>
    </div>
  );
}

FilterToolbar.propTypes = {
  filters: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    groupBy: PropTypes.string.isRequired,
    top: PropTypes.number
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onQuery: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default FilterToolbar;
