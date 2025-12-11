import PropTypes from 'prop-types';

/**
 * Componente de gráfico de barras vertical
 * Muestra top N productos más vendidos
 */
function BarChart({ data, title, value, change }) {
  const maxValue = Math.max(...data.map(d => d.quantity || 0)) || 1;
  
  return (
    <div className="lg:col-span-2 flex flex-col gap-2 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50 hover:shadow-lg transition-shadow">
      <p className="text-[#111813] dark:text-white text-lg font-medium leading-normal">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-[#111813] dark:text-white tracking-light text-[32px] font-bold leading-tight truncate">
          {value?.toLocaleString('es-CO') || '0'}
        </p>
        {change !== null && (
          <p className={`${change >= 0 ? 'text-[#078829] dark:text-green-400' : 'text-[#e72a08] dark:text-red-400'} text-base font-medium leading-normal`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
      </div>
      <p className="text-[#63886f] dark:text-gray-400 text-base font-normal leading-normal">
        Últimos 30 días
      </p>
      <div className="grid min-h-[220px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
        {data.map((item, index) => {
          const heightPercentage = (item.quantity / maxValue) * 100;
          
          return (
            <div key={index} className="contents">
              <div
                className="bg-primary/20 dark:bg-primary/30 w-full rounded-t-md hover:bg-primary/30 transition-colors cursor-pointer"
                style={{ height: `${heightPercentage}%` }}
                title={`${item.name}: ${item.quantity} unidades`}
              />
              <p className="text-[#63886f] dark:text-gray-400 text-[13px] font-bold leading-normal tracking-[0.015em] truncate max-w-full">
                {item.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  change: PropTypes.number
};

export default BarChart;
