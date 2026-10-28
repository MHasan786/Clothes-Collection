import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePakistanPhone, validateEmail, validateCheckoutForm } from './validation.js';

test('validatePakistanPhone accepts valid Pakistani phone numbers in various formats', () => {
  const t1 = validatePakistanPhone('03001234567');
  assert.equal(t1.isValid, true);
  assert.equal(t1.formatted, '03001234567');

  const t2 = validatePakistanPhone('+92 321 9876543');
  assert.equal(t2.isValid, true);
  assert.equal(t2.formatted, '03219876543');

  const t3 = validatePakistanPhone('0333-5551234');
  assert.equal(t3.isValid, true);
  assert.equal(t3.formatted, '03335551234');

  const t4 = validatePakistanPhone('923451122334');
  assert.equal(t4.isValid, true);
  assert.equal(t4.formatted, '03451122334');
});

test('validatePakistanPhone rejects invalid phone numbers', () => {
  const invalid1 = validatePakistanPhone('12345');
  assert.equal(invalid1.isValid, false);

  const invalid2 = validatePakistanPhone('02134567890'); // Landline not mobile
  assert.equal(invalid2.isValid, false);

  const invalid3 = validatePakistanPhone('');
  assert.equal(invalid3.isValid, false);
});

test('validateEmail validates email addresses correctly', () => {
  assert.equal(validateEmail('customer@example.com'), true);
  assert.equal(validateEmail('user.name+tag@sub.domain.pk'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('@domain.com'), false);
  assert.equal(validateEmail(''), false);
});

test('validateCheckoutForm flags missing required fields and allows valid data', () => {
  const invalidResult = validateCheckoutForm({});
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.fullName);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.phone);
  assert.ok(invalidResult.errors.province);
  assert.ok(invalidResult.errors.city);
  assert.ok(invalidResult.errors.area);
  assert.ok(invalidResult.errors.address);

  const validResult = validateCheckoutForm({
    fullName: 'Hamza Khan',
    email: 'hamza@example.com',
    phone: '03001234567',
    province: 'Punjab',
    city: 'Lahore',
    area: 'DHA Phase 6',
    address: 'House 42, Street 8, Sector C',
    paymentMethod: 'cod',
  });
  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});
