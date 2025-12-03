import { useState } from 'react';

/**
 * Custom Hook para validación de formularios de pedidos
 * Principio SOLID: Single Responsibility Principle (SRP)
 *
 * Objetivo: Separar la lógica de validación del componente UI
 * Permite reutilizar validaciones en múltiples formularios y facilita testing
 *
 * Patrón de Diseño: Strategy Pattern + Custom Hook Pattern
 * Las estrategias de validación están encapsuladas y son intercambiables
 */
export function useOrderFormValidation() {
  const [touched, setTouched] = useState({ name: false, email: false });

  /**
   * Valida formato de email usando regex estándar
   * @param email - Email a validar
   * @returns true si el formato es válido
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Obtiene el estado de validación del campo email
   * Estados posibles: neutral, error, invalid, valid
   *
   * @param email - Email a evaluar
   * @returns Estado de validación para renderizado condicional
   */
  const getEmailValidationState = (email) => {
    if (!touched.email) return 'neutral';
    if (email.trim().length === 0) return 'error';
    if (!isValidEmail(email)) return 'invalid';
    return 'valid';
  };

  /**
   * Valida que el formulario esté completo y listo para envío
   *
   * @param name - Nombre del cliente
   * @param email - Email del cliente
   * @param quantities - Object con cantidades de items {itemId: quantity}
   * @returns true si el formulario es válido
   */
  const isFormValid = (name, email, quantities) => {
    const hasItems = Object.values(quantities).some(qty => qty > 0);
    const hasName = name.trim().length > 0;
    const hasEmail = email.trim().length > 0;
    return hasItems && hasName && hasEmail;
  };

  /**
   * Valida que el nombre del cliente no esté vacío
   * @param name - Nombre a validar
   * @returns true si el nombre es válido
   */
  const getNameValidationState = (name) => {
    if (!touched.name) return 'neutral';
    return name.trim().length === 0 ? 'error' : 'valid';
  };

  return {
    touched,
    setTouched,
    isValidEmail,
    getEmailValidationState,
    getNameValidationState,
    isFormValid
  };
}
