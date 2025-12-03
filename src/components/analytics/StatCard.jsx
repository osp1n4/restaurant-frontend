import PropTypes from 'prop-types';

/**
 * Componente reutilizable para tarjetas de estadísticas
 * Muestra métricas individuales con título, valor y variación porcentual
 */
function StatCard({ title, value, change, isPositive = true, icon, format = 'number' }) {
  const formattedValue = formatValue(value, format);
  const changeColor = isPositive ? 'text-[#078829] dark:text-green-400' : 'text-[#e72a08] dark:text-red-400';
  
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[#63886f] dark:text-gray-400 text-base font-medium leading-normal">
          {title}
        </p>
        {icon && (
          <span className="material-symbols-outlined text-2xl text-primary">
            {icon}
          </span>
        )}
      </div>
      <p className="text-[#111813] dark:text-white tracking-light text-3xl font-bold leading-tight">
        {formattedValue}
      </p>
      {change !== null && change !== undefined && (
        <p className={`${changeColor} text-base font-medium leading-normal`}>
          {isPositive ? '+' : ''}{change}%
        </p>
      )}
      {change === null && (
        <p className="text-transparent text-base font-medium leading-normal">.</p>
      )}
    </div>
  );
}

/**
 * Formatea valores según el tipo especificado
 */
function formatValue(value, format) {
  if (value === null || value === undefined) return 'N/A';
  
  switch (format) {
    case 'currency':
      return `$${Number(value).toLocaleString('es-CO')}`;
    case 'number':
      return Number(value).toLocaleString('es-CO');
    case 'time':
      return `${value} min`;
    case 'text':
    default:
      return value;
  }
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  change: PropTypes.number,
  isPositive: PropTypes.bool,
  icon: PropTypes.string,
  format: PropTypes.oneOf(['number', 'currency', 'time', 'text'])
};

export default StatCard;
