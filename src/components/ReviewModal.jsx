import { useState } from 'react';
import StarRating from './StarRating';

/**
 * Modal para enviar reseñas de pedidos
 *
 * Props:
 * - isOpen: Boolean para mostrar/ocultar modal
 * - onClose: Callback para cerrar modal
 * - orderData: Objeto con { orderId, orderNumber, customerName, customerEmail }
 * - onSubmit: Callback al enviar reseña exitosamente
 *
 * Paleta de colores:
 * - Primario: #FF6B35 (naranja vibrante)
 * - Fondo: #F5F5F5, #FFFFFF
 * - Texto: #222222, #666666
 * - Botones: #FF6B35 (activo), #CCCCCC (inactivo)
 */
export default function ReviewModal({
  isOpen,
  onClose,
  orderData,
  onSubmit
}) {
  const [ratings, setRatings] = useState({
    overall: 0,
    food: 0
  });
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  // Validación del formulario
  const validate = () => {
    const newErrors = {};

    if (!ratings.overall || ratings.overall < 1) {
      newErrors.overall = 'Overall rating is required';
    }

    if (!ratings.food || ratings.food < 1) {
      newErrors.food = 'Food rating is required';
    }

    if (comment && comment.length > 500) {
      newErrors.comment = 'Comment must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar reseña
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const reviewData = {
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        ratings,
        comment: comment.trim()
      };

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      // Mostrar mensaje de éxito
      setSubmitSuccess(true);

      // Esperar 2 segundos y cerrar modal
      setTimeout(() => {
        setSubmitSuccess(false);
        resetForm();
        if (onSubmit) onSubmit(data.data);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: error.message || 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setRatings({ overall: 0, food: 0 });
    setComment('');
    setErrors({});
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Caracteres restantes del comentario
  const remainingChars = 500 - comment.length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#FF6B35] text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Share Your Experience</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:text-[#F5F5F5] transition-colors text-3xl leading-none disabled:opacity-50"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {orderData?.orderNumber && (
            <p className="text-sm text-white/90 mt-1">
              Order #{orderData.orderNumber}
            </p>
          )}
        </div>

        {/* Success Message */}
        {submitSuccess ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl">
                  check_circle
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#222222] mb-2">
              Thank you for your review!
            </h3>
            <p className="text-[#666666]">
              Your feedback helps us improve our service.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Overall Rating */}
            <div className="mb-6">
              <StarRating
                label="Overall Rating"
                rating={ratings.overall}
                onChange={(value) => setRatings({ ...ratings, overall: value })}
                size="md"
              />
              {errors.overall && (
                <p className="text-sm text-red-500 mt-1">{errors.overall}</p>
              )}
            </div>

            {/* Food Quality */}
            <div className="mb-6">
              <StarRating
                label="Food Quality"
                rating={ratings.food}
                onChange={(value) => setRatings({ ...ratings, food: value })}
                size="md"
              />
              {errors.food && (
                <p className="text-sm text-red-500 mt-1">{errors.food}</p>
              )}
            </div>

            {/* Comment (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#222222] mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#222222] placeholder-[#CCCCCC]"
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-xs ${remainingChars < 50 ? 'text-[#FF6B35]' : 'text-[#666666]'}`}>
                  {remainingChars} characters remaining
                </p>
                {errors.comment && (
                  <p className="text-xs text-red-500">{errors.comment}</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[#F5F5F5] text-[#666666] font-semibold rounded-lg hover:bg-[#CCCCCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[#FF6B35] text-white font-semibold rounded-lg hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
