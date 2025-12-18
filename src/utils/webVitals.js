import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Medición de Web Vitals para US-001
 * LCP (Largest Contentful Paint) debe ser < 2.5s
 * Nota: onFID fue reemplazado por onINP en web-vitals v3+
 */

const logMetric = (metric) => {
  const { name, value, rating } = metric;
  
  // Convertir a segundos para LCP, FCP, TTFB
  const displayValue = ['LCP', 'FCP', 'TTFB'].includes(name) 
    ? `${(value / 1000).toFixed(2)}s` 
    : value.toFixed(2);

  console.log(`[Web Vitals] ${name}:`, {
    value: displayValue,
    rating,
    rawValue: value
  });

  // Alertar si LCP excede 2.5s (requisito US-001)
  if (name === 'LCP' && value > 2500) {
    console.warn(`⚠️ LCP (${displayValue}) excede el límite de 2.5s requerido en US-001`);
  }

  // Enviar a analytics (opcional)
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(value),
      event_label: rating,
      non_interaction: true,
    });
  }
};

/**
 * Inicializar medición de Web Vitals
 */
export const initWebVitals = () => {
  console.log('[Web Vitals] Iniciando medición de rendimiento...');
  
  onCLS(logMetric);  // Cumulative Layout Shift
  onINP(logMetric);  // Interaction to Next Paint (reemplaza FID)
  onFCP(logMetric);  // First Contentful Paint
  onLCP(logMetric);  // Largest Contentful Paint (⭐ US-001)
  onTTFB(logMetric); // Time to First Byte
};

/**
 * Medir LCP específicamente
 * Retorna Promise que resuelve cuando LCP se registra
 */
export const measureLCP = () => {
  return new Promise((resolve) => {
    onLCP((metric) => {
      resolve(metric);
    });
  });
};
