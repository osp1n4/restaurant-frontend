import PropTypes from 'prop-types';
import LazyImage from './LazyImage';

/**
 * Tarjeta de producto para el menú
 * Cumple con US-001 Criterio 3: Título, Precio y Botón "Añadir"
 */
const MenuItemCard = ({ item, quantity, onAdd, onRemove }) => {
  return (
    <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Imagen con lazy loading */}
      <LazyImage
        src={item.imageUrl || '/smash-burger-que-es.jpg'}
        alt={item.name}
        className="w-full h-48 object-cover"
      />

      {/* Contenido */}
      <div className="p-4">
        {/* CRITERIO 3: Título */}
        <h4 className="text-white font-bold text-lg mb-1 truncate" title={item.name}>
          {item.name}
        </h4>
        
        {/* Descripción (opcional) */}
        {item.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {/* CRITERIO 3: Precio */}
          <span className="text-primary font-bold text-xl">
            ${item.price.toLocaleString('es-CO')}
          </span>
          
          {/* Controles de cantidad */}
          {quantity === 0 ? (
            /* CRITERIO 3: Botón "Añadir" inicial */
            <button
              onClick={() => onAdd(item._id)}
              disabled={!item.available}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                item.available 
                  ? 'bg-primary hover:bg-primary/90 hover:scale-110' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              aria-label={`Añadir ${item.name}`}
            >
              <span className="material-symbols-outlined text-2xl">add</span>
            </button>
          ) : (
            /* Controles de incrementar/decrementar */
            <div className="flex items-center gap-2 bg-slate-700 rounded-full px-2 py-1 shadow-lg">
              <button
                onClick={() => onRemove(item._id)}
                className="w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label={`Disminuir cantidad de ${item.name}`}
              >
                <span className="material-symbols-outlined text-xl">remove</span>
              </button>
              
              <span className="text-white font-bold text-lg min-w-[2rem] text-center">
                {quantity}
              </span>
              
              <button
                onClick={() => onAdd(item._id)}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white transition-all hover:scale-110"
                aria-label={`Aumentar cantidad de ${item.name}`}
              >
                <span className="material-symbols-outlined text-xl">add</span>
              </button>
            </div>
          )}
        </div>

        {/* Indicador de no disponible */}
        {!item.available && (
          <div className="mt-2 text-center text-xs text-gray-500">
            No disponible
          </div>
        )}
      </div>
    </div>
  );
};

MenuItemCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
    available: PropTypes.bool,
  }).isRequired,
  quantity: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default MenuItemCard;
