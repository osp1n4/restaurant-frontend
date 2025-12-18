import { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import Sidebar from '../components/analytics/Sidebar';
import { useTranslation } from 'react-i18next';
import { updateReviewStatus } from '../services/api';

/**
 * AdminReviewsPage Component
 *
 * Panel de administración para gestionar reseñas (aprobar/ocultar).
 *
 * Features:
 * - Fetch de todas las reseñas (pending/approved/hidden)
 * - Acciones de moderación: Aprobar y Ocultar
 * - Modal de confirmación para acciones
 * - Badges de estado con colores semánticos
 * - Paginación básica
 *
 * Color Palette:
 * - #FF6B35: Botón aprobar y elementos principales
 * - #F5F5F5: Fondo de página
 * - #222222: Texto principal
 * - Green (#10B981): Estado aprobado
 * - Yellow (#F59E0B): Estado pendiente
 * - Gray (#6B7280): Estado oculto
 */
const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'hide'
  const [processing, setProcessing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/admin/reviews`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las reseñas');
      }

      const data = await response.json();

      // El backend responde con { success, data: [...reviews], pagination }
      const reviewsList = data.data || data.reviews || [];
      setReviews(reviewsList);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      setError(err.message || 'Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmModal = (review, action) => {
    setSelectedReview(review);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedReview(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedReview || !actionType) return;

    setProcessing(true);

    const newStatus = actionType === 'approve' ? 'approved' : 'hidden';

    // Obtener el ID de la review (MongoDB devuelve 'id' tras toJSON)
    const reviewId = selectedReview.id || selectedReview._id;

    if (!reviewId) {
      console.error('Error: No review ID found:', selectedReview);
      alert('Error: No se pudo encontrar el ID de la reseña');
      setProcessing(false);
      return;
    }

    try {
      await updateReviewStatus(reviewId, newStatus);

      // Update local state
      setReviews((prev) =>
        prev.map((review) =>
          (review.id === reviewId || review._id === reviewId)
            ? { ...review, status: newStatus }
            : review
        )
      );

      handleCloseConfirmModal();
    } catch (err) {
      console.error('Error updating review status:', err);
      alert('Error al actualizar la reseña. Por favor, intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      hidden: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}
      >
        {t(`reviews.status.${status}`, status)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white text-lg">{t('reviews.loading', 'Loading reviews...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
            <h2 className="text-2xl font-bold text-white mb-2">{t('reviews.error', 'Error')}</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchReviews}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {t('reviews.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-auto">
      <div className="layout-container flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 p-8 ml-64 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                {t('reviews.managementTitle', 'Review Management Panel')}
              </h1>
              <p className="text-gray-400 text-lg">
                {t('reviews.managementSubtitle', 'Manage and moderate customer reviews')}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6">
                <p className="text-gray-400 text-sm mb-1">{t('reviews.total', 'Total Reviews')}</p>
                <p className="text-3xl font-bold text-white">{reviews.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6">
                <p className="text-gray-400 text-sm mb-1">{t('reviews.status.pending', 'Pending')}</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {reviews.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6">
                <p className="text-gray-400 text-sm mb-1">{t('reviews.status.approved', 'Approved')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {reviews.filter((r) => r.status === 'approved').length}
                </p>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-12 text-center">
                <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">rate_review</span>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {t('reviews.noReviews', 'No reviews')}
                </h2>
                <p className="text-gray-400">
                  {t('reviews.noReviewsText', 'Reviews will appear here when customers submit them')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id || review._id}
                    className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl hover:shadow-2xl transition-shadow p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">
                            {review.customerName}
                          </h3>
                          {getStatusBadge(review.status)}
                        </div>
                        <p className="text-sm text-gray-400 mb-1">
                          Order: {review.orderId}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenConfirmModal(review, 'approve')}
                          disabled={review.status === 'approved'}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                            ${review.status === 'approved'
                              ? 'bg-slate-700 cursor-not-allowed text-gray-500'
                              : 'bg-primary hover:bg-primary/90 text-white'
                            }
                          `}
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {t('reviews.approve', 'Approve')}
                        </button>
                        <button
                          onClick={() => handleOpenConfirmModal(review, 'hide')}
                          disabled={review.status === 'hidden'}
                          className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                            ${review.status === 'hidden'
                              ? 'bg-slate-700 cursor-not-allowed text-gray-500'
                              : 'bg-slate-600 hover:bg-slate-700 text-white'
                            }
                          `}
                        >
                          <span className="material-symbols-outlined text-sm">visibility_off</span>
                          {t('reviews.hide', 'Hide')}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">{t('reviews.overallRating', 'Overall Rating')}</p>
                        <StarRating rating={review.ratings?.overall || review.rating || 5} readonly size="sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">{t('reviews.foodQuality', 'Food Quality')}</p>
                        <StarRating rating={review.ratings?.food || review.rating || 5} readonly size="sm" />
                      </div>
                    </div>

                    {review.comment && (
                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-sm text-gray-400 mb-1 font-medium">{t('reviews.comment', 'Comment:')}</p>
                        <p className="text-gray-300">{review.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-white mb-4">{t('reviews.confirmAction', 'Confirm Action')}</h3>
                <p className="text-gray-400 mb-6">{t('reviews.confirmText', 'Are you sure you want to {{action}} this review from {{name}}?', {
                    action: t(`reviews.${actionType}`, actionType === 'approve' ? 'approve' : 'hide'),
                    name: selectedReview?.customerName
                  })}</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseConfirmModal}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {t('reviews.cancel', 'Cancel')}
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {processing ? t('reviews.processing', 'Processing...') : t('reviews.confirm', 'Confirm')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
