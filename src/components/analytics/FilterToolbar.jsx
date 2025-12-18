import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import SelectListbox from '../SelectListbox';

/**
 * Componente de barra de herramientas con filtros
 * Permite seleccionar rango de fechas, agrupación y exportar XLSX
 */
function FilterToolbar({ filters, onFilterChange, onQuery, onExportXLSX, loading }) {
  const { t } = useTranslation();
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-700 bg-slate-900">
      <div className="flex flex-wrap gap-4 items-center">
        {/* From Date */}
        <div className="relative">
          <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="from-date"
          >
            {t('analytics.from', 'From')}
          </label>
          <input
            className="w-full mt-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-md text-sm text-[#111813] dark:text-white focus:ring-primary focus:border-primary"
            id="from-date"
            type="date"
            value={filters.from}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('from', e.target.value)}
          />
        </div>

        {/* To Date */}
        <div className="relative">
          <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="to-date"
          >
            {t('analytics.to', 'Until')}
          </label>
          <input
            className="w-full mt-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-700 rounded-md text-sm text-[#111813] dark:text-white focus:ring-primary focus:border-primary"
            id="to-date"
            type="date"
            value={filters.to}
            min={filters.from}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('to', e.target.value)}
          />
        </div>

        {/* Group By */}
        <div className="relative">
          <label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="group-by"
          >
            {t('analytics.groupBy', 'Group by')}
          </label>
          <div className="w-44 mt-1">
            <SelectListbox
              value={filters.groupBy}
              onChange={(v) => handleInputChange('groupBy', v)}
              options={[
                { value: 'day', label: t('analytics.day', 'Day') },
                { value: 'week', label: t('analytics.week', 'Week') },
                { value: 'month', label: t('analytics.month', 'Month') },
                { value: 'year', label: t('analytics.year', 'Year') },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onExportXLSX}
          disabled={loading}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-green-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span className="material-symbols-outlined text-xl">table_view</span>
          <span className="truncate">{t('analytics.exportXlsx', 'Export XLSX')}</span>
        </button>
        <button
          onClick={onQuery}
          disabled={loading}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        
          <span className="material-symbols-outlined text-xl">query_stats</span>
          <span className="truncate">{loading ? t('analytics.loading', 'Loading analytics...') : t('analytics.viewMetrics', 'View metrics')}</span>
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
  onExportXLSX: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default FilterToolbar;
