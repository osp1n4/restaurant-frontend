import { useState } from 'react';

/**
 * Componente reutilizable de calificación por estrellas
 *
 * Props:
 * - rating: Calificación actual (1-5)
 * - onChange: Función callback cuando cambia la calificación
 * - label: Etiqueta del campo (ej: "Overall Rating")
 * - readonly: Si es true, no permite interacción (solo visualización)
 * - size: Tamaño de las estrellas ('sm' | 'md' | 'lg')
 *
 * Estilos siguiendo la paleta:
 * - Estrellas activas: #FF6B35 (color primario)
 * - Estrellas inactivas: #CCCCCC (gris claro)
 * - Hover: #FF6B35 con transparencia
 */
export default function StarRating({
  rating = 0,
  onChange,
  label,
  readonly = false,
  size = 'md'
}) {
  const [hoverRating, setHoverRating] = useState(0);

  // Tamaños de estrellas (en text-size de Tailwind)
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  // Determina si una estrella debe estar llena
  const isFilled = (starIndex) => {
    return (hoverRating || rating) >= starIndex;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-[#222222]">
          {label}
          {!readonly && <span className="text-[#FF6B35] ml-1">*</span>}
        </label>
      )}

      {/* Estrellas */}
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${starSize}
              transition-all duration-200
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              focus:outline-none
              ${isFilled(starValue) ? 'text-[#FF6B35]' : 'text-[#CCCCCC]'}
            `}
            aria-label={`Rate ${starValue} stars`}
          >
            {/* Estrella llena o vacía */}
            <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>
              {isFilled(starValue) ? 'star' : 'star_outline'}
            </span>
          </button>
        ))}

        {/* Indicador numérico */}
        {(rating > 0 || hoverRating > 0) && (
          <span className="ml-2 text-sm font-medium text-[#666666]">
            {hoverRating || rating}/5
          </span>
        )}
      </div>
    </div>
  );
}
