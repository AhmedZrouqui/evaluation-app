import { body } from 'express-validator';

export const validateCreateUser = () => [
  body('firstname')
    .trim()
    .notEmpty()
    .withMessage('Firstname is required')
    .isString()
    .withMessage('Invalid value'),

  body('lastname')
    .trim()
    .notEmpty()
    .withMessage('Lastname is required')
    .isString()
    .withMessage('Invalid value'),

  body('countryCode')
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid country code'),

  body('phone')
    .trim()
    .isNumeric()
    .withMessage('Phone number must be numeric')
    .isLength({ min: 8, max: 15 })
    .withMessage('Phone number must be between 8-15 characters'),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export function validateAuthentication() {
  return [
    body('countryCode')
      .isString()
      .notEmpty()
      .withMessage('Country code is required!'),
    body('phone').isString().notEmpty().withMessage('Phone is required!'),
    body('password').isString().notEmpty().withMessage('Password is required!'),
  ];
}
