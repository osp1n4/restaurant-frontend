import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de tabla de datos con paginación y ordenamiento
 * Muestra datos detallados de analíticas
 */
function DataTable({ data = [] }) {
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
    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50 sticky top-0">
            <tr>
              <th className="px-6 py-3" scope="col">
                <button
                  onClick={() => handleSort('period')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Period <span className="material-symbols-outlined text-base">swap_vert</span>
                </button>
              </th>
              <th className="px-6 py-3" scope="col">
                <button
                  onClick={() => handleSort('totalOrders')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  TOTAL ÓRDEN <span className="material-symbols-outlined text-base">swap_vert</span>
                </button>
              </th>
              <th className="px-6 py-3" scope="col">
                <button
                  onClick={() => handleSort('totalRevenue')}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  TOTAL INGRESO <span className="material-symbols-outlined text-base">swap_vert</span>
                </button>
              </th>
              <th className="px-6 py-3" scope="col">ID del producto</th>
              <th className="px-6 py-3" scope="col">Nombre del producto</th>
              <th className="px-6 py-3" scope="col">Cantidad</th>
              <th className="px-6 py-3" scope="col">Tiempo promedio de preparación</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="bg-white dark:bg-background-dark/50 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {row.period || 'N/A'}
                  </td>
                  <td className="px-6 py-4">{row.totalOrders || 0}</td>
                  <td className="px-6 py-4">${Number(row.totalRevenue || 0).toLocaleString('es-CO')}</td>
                  <td className="px-6 py-4">{row.productId || 'N/A'}</td>
                  <td className="px-6 py-4">{row.productName || 'N/A'}</td>
                  <td className="px-6 py-4">{row.quantity || 0}</td>
                  <td className="px-6 py-4">{row.avgPrepTime ? `${row.avgPrepTime} min` : 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
        <div className="text-sm font-normal text-gray-500 dark:text-gray-400 flex items-center gap-2">
          Rows per page:
          <select
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary p-1"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-background-dark/50 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
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
                      ? 'z-10 text-primary bg-primary/20 border border-primary hover:bg-primary/30'
                      : 'text-gray-500 bg-white dark:bg-background-dark/50 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white'
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
              className="px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-background-dark/50 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
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
      avgPrepTime: PropTypes.number
    })
  )
};

export default DataTable;
