'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const { register, login, getUserById } = require('../controllers/authController');

const router = Router();

// ── Validation rule sets ───────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character.'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ── Routes ─────────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
router.post('/register', registerRules, register);

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate user and return JWT
 * @access Public
 */
router.post('/login', loginRules, login);

/**
 * @route  GET /api/auth/users/:userId
 * @desc   Verify a user exists by UUID — consumed internally by other microservices
 * @access Internal (service-to-service only; no public client should call this)
 */
router.get(
  '/users/:userId',
  [param('userId').isUUID().withMessage('userId must be a valid UUID.')],
  getUserById
);

module.exports = router;
