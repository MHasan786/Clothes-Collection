/**
 * Input validation utilities for Pakistan-specific e-commerce checkout & authentication
 */

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  deliveryInstructions?: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'card';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates and formats Pakistani mobile phone numbers
 * Valid formats include:
 * - 03001234567 (11 digits starting with 03)
 * - +923001234567 (13 chars starting with +92)
 * - 923001234567 (12 digits starting with 92)
 * - 0300-1234567 or 0300 1234567
 */
export function validatePakistanPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, formatted: '', error: 'Mobile number is required' };
  }

  // Remove whitespace, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Pattern matches 03XXXXXXXXX, 923XXXXXXXXX, +923XXXXXXXXX
  const regex = /^(?:(?:\+92|92)|0)?(3\d{9})$/;
  const match = cleaned.match(regex);

  if (!match) {
    return {
      isValid: false,
      formatted: cleaned,
      error: 'Please enter a valid Pakistani mobile number (e.g., 0300 1234567)',
    };
  }

  // Standardize to 03XXXXXXXXX for display and order tracking
  const standardized = '0' + match[1];
  return { isValid: true, formatted: standardized };
}

/**
 * Standard RFC-compliant email validation
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

/**
 * Validates checkout form data thoroughly
 */
export function validateCheckoutForm(data: Partial<CheckoutFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name';
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  const phoneValidation = validatePakistanPhone(data.phone || '');
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error || 'Invalid phone number';
  }

  if (!data.province || data.province.trim() === '') {
    errors.province = 'Please select your province';
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'Please enter your city';
  }

  if (!data.area || data.area.trim().length < 2) {
    errors.area = 'Please provide your area, sector, or locality';
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.address = 'Please provide your complete street/house address';
  }

  if (!data.paymentMethod || !['cod', 'bank_transfer', 'card'].includes(data.paymentMethod)) {
    errors.paymentMethod = 'Please choose a valid payment method';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
