import PropTypes from 'prop-types';

/**
 * Componente de gráfico de líneas simplificado con SVG
 * Muestra tendencias de órdenes totales por período
 */
function LineChart({ data, title, subtitle, value, change }) {
  const points = generatePathPoints(data);
  
  return (
    <div className="lg:col-span-3 flex flex-col gap-2 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark/50 hover:shadow-lg transition-shadow">
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
        {subtitle}
      </p>
      <div className="flex min-h-[220px] flex-1 flex-col gap-8 py-4">
        <svg
          fill="none"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 500 150"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Área bajo la línea */}
          <path
            d={`${points} V150 H0 V${data[0]?.y || 100}Z`}
            fill="url(#paint0_linear_chart)"
          />
          {/* Línea principal */}
          <path
            d={points}
            stroke="#19e65e"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear_chart"
              x1="250"
              x2="250"
              y1="0"
              y2="150"
            >
              <stop stopColor="#19e65e" stopOpacity="0.2" />
              <stop offset="1" stopColor="#19e65e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/**
 * Genera puntos SVG path desde datos de series
 */
function generatePathPoints(data) {
  if (!data || data.length === 0) {
    return 'M0 75 L500 75'; // Línea plana si no hay datos
  }

  const width = 500;
  const height = 150;
  const padding = 10;
  
  // Si solo hay 1 punto, crear una línea horizontal en el centro
  if (data.length === 1) {
    const value = data[0].value || 0;
    const y = height / 2; // Centrado verticalmente
    return `M0 ${y} L${width} ${y}`;
  }
  
  const maxValue = Math.max(...data.map(d => d.value || 0)) || 1;
  const minValue = Math.min(...data.map(d => d.value || 0)) || 0;
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const normalizedValue = ((point.value - minValue) / range);
    const y = height - padding - (normalizedValue * (height - 2 * padding));
    
    return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');
  
  return points;
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  value: PropTypes.number,
  change: PropTypes.number
};

export default LineChart;
