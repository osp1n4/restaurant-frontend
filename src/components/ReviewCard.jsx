import StarRating from './StarRating';

/**
 * Componente de tarjeta para mostrar una reseña individual
 * Usado en la página pública de reseñas
 *
 * Props:
 * - review: Objeto con { id, customerName, ratings: {overall, food}, comment, createdAt }
 *
 * Diseño:
 * - Bordes redondeados (8px)
 * - Sombras sutiles
 * - Tipografía Sans-serif
 * - Colores de la paleta
 */
export default function ReviewCard({ review }) {
  // Manejar reviews con diferentes estructuras de datos
  const overallRating = review.ratings?.overall || review.rating || 5;
  const foodRating = review.ratings?.food || review.rating || 5;

  // Formatear fecha relativa (ej: "2 days ago")
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-[#F5F5F5]">
      {/* Header: Nombre y Fecha */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#222222]">
            {review.customerName}
          </h3>
          <p className="text-sm text-[#666666]">
            {formatRelativeDate(review.createdAt)}
          </p>
        </div>

        {/* Overall Rating Badge */}
        <div className="flex items-center gap-1 bg-[#FF6B35]/10 px-3 py-1 rounded-full">
          <span
            className="material-symbols-outlined text-xl"
            style={{ color: '#FF6B35' }}
          >
            star
          </span>
          <span className="font-bold text-[#FF6B35]">
            {overallRating}.0
          </span>
        </div>
      </div>

      {/* Ratings Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-[#666666] mb-1">Overall</p>
          <StarRating
            rating={overallRating}
            readonly={true}
            size="sm"
          />
        </div>
        <div>
          <p className="text-xs font-medium text-[#666666] mb-1">Food Quality</p>
          <StarRating
            rating={foodRating}
            readonly={true}
            size="sm"
          />
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mt-4 pt-4 border-t border-[#F5F5F5]">
          <p className="text-[#222222] leading-relaxed">
            "{review.comment}"
          </p>
        </div>
      )}
    </div>
  );
}
