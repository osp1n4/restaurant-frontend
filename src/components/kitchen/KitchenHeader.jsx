/**
 * Componente Header del Dashboard de Cocina
 */
function KitchenHeader({ onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      {/* Kitchen Icon */}
      <div className="p-2">
        <svg 
          className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>

      {/* Refresh Icon */}
      <button 
        onClick={onRefresh}
        disabled={loading}
        className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
      >
        <svg 
          className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-700 ${loading ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>
    </div>
  );
}

export default KitchenHeader;

