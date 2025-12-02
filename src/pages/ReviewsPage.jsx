import { useState, useEffect } from 'react';
import ReviewCard from '../components/ReviewCard';

/**
 * ReviewsPage Component
 *
 * Página pública que muestra el listado de reseñas aprobadas con paginación.
 *
 * Features:
 * - Fetch de reseñas aprobadas desde GET /reviews
 * - Paginación con botones Anterior/Siguiente
 * - Estados de carga, error y lista vacía
 * - Responsive grid layout
 *
 * Color Palette:
 * - #FF6B35: Botones activos y elementos destacados
 * - #F5F5F5: Fondo de página
 * - #222222: Texto principal
 * - #CCCCCC: Botones deshabilitados
 */
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const limit = 10;
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar las reseñas');
      }

      const data = await response.json();

      setReviews(data.reviews || []);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#222222] text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
            <h2 className="text-2xl font-bold text-[#222222] mb-2">Error</h2>
            <p className="text-[#666666] mb-6">{error}</p>
            <button
              onClick={fetchReviews}
              className="bg-[#FF6B35] hover:bg-[#e55d2e] text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#222222] mb-2">
            Customer Reviews
          </h1>
          <p className="text-[#666666] text-lg">
            Read about our customers' experiences
          </p>
        </div>

        {/* Empty State */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="material-symbols-outlined text-[#CCCCCC] text-6xl mb-4">rate_review</span>
            <h2 className="text-2xl font-bold text-[#222222] mb-2">
              No reviews yet
            </h2>
            <p className="text-[#666666]">
              Be the first to share your experience
            </p>
          </div>
        ) : (
          <>
            {/* Reviews Grid */}
            <div className="space-y-4 mb-8">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${page === 1
                    ? 'bg-[#CCCCCC] cursor-not-allowed text-[#666666]'
                    : 'bg-[#FF6B35] hover:bg-[#e55d2e] text-white shadow-md hover:shadow-lg'
                  }
                `}
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Previous
              </button>

              <span className="text-[#222222] font-medium text-lg">
                Page {page}
              </span>

              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${!hasMore
                    ? 'bg-[#CCCCCC] cursor-not-allowed text-[#666666]'
                    : 'bg-[#FF6B35] hover:bg-[#e55d2e] text-white shadow-md hover:shadow-lg'
                  }
                `}
              >
                Next
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
