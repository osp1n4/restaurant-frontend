import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SelectListbox from '../SelectListbox';
import PropTypes from 'prop-types';

/**
 * Componente de tabla de datos con paginación y ordenamiento
 * Muestra datos detallados de analíticas
 */
function DataTable({ data = [] }) {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Ordenar datos
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-slate-800 sticky top-0">
            <tr>
              <th className="px-6 py-3" scope="col">
                <button
                  onClick={() => handleSort('period')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {t('analytics.period', 'Period')} <span className="material-symbols-outlined text-base">swap_vert</span>
                </button>
              </th>
              <th className="px-6 py-3" scope="col">
                <button
                  onClick={() => handleSort('totalRevenue')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  {t('analytics.totalIncome', 'Total Income')} <span className="material-symbols-outlined text-base">swap_vert</span>
                </button>
              </th>
              <th className="px-6 py-3" scope="col">{t('analytics.productName', 'Product Name')}</th>
              <th className="px-6 py-3" scope="col">{t('analytics.quantity', 'Quantity')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                  {t('analytics.noTableData', 'No data is available for the selected period.')}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="bg-slate-900 border-b border-slate-700 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {row.period || 'N/A'}
                  </td>
                  <td className="px-6 py-4">${Number(row.totalRevenue || 0).toLocaleString('es-CO')}</td>
                  <td className="px-6 py-4">{row.productName || 'N/A'}</td>
                  <td className="px-6 py-4">{row.quantity || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
        <div className="text-sm font-normal text-gray-400 flex items-center gap-2">
          {t('analytics.rowsPerPage', 'Rows per page:')}
          <div className="w-24">
            <SelectListbox
              value={String(rowsPerPage)}
              onChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}
              options={[{ value: '10', label: '10' }, { value: '20', label: '20' }, { value: '50', label: '50' }]}
            />
          </div>
        </div>
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 ml-0 leading-tight text-gray-400 bg-slate-800 border border-slate-700 rounded-l-lg hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('users.previous', 'Previous')}
            </button>
          </li>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <li key={page}>
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 leading-tight ${
                    currentPage === page
                      ? 'z-10 text-primary bg-primary/30 border border-primary hover:bg-primary/40'
                      : 'text-gray-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 leading-tight text-gray-400 bg-slate-800 border border-slate-700 rounded-r-lg hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('users.next', 'Next')}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

DataTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      period: PropTypes.string,
      totalOrders: PropTypes.number,
      totalRevenue: PropTypes.number,
      productId: PropTypes.string,
      productName: PropTypes.string,
      quantity: PropTypes.number,
    })
  )
};

export default DataTable;
