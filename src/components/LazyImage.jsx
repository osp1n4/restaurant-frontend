import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para lazy loading de imágenes
 * Cumple con US-001: Optimización de payload <500KB
 */
const LazyImage = ({ src, alt, className, placeholder = '/placeholder.jpg' }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    // Observer para detectar cuando la imagen entra en viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Cargar imagen solo cuando es visible
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
            };

            img.onerror = () => {
              setImageSrc(placeholder);
              setIsLoading(false);
            };

            // Dejar de observar después de cargar
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Comenzar a cargar 50px antes de ser visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, placeholder]);

  return (
    <div ref={imgRef} className="relative">
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
        loading="lazy"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-500 text-4xl">image</span>
        </div>
      )}
    </div>
  );
};

LazyImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string
};

export default LazyImage;
