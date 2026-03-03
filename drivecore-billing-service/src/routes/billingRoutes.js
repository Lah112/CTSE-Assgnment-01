const express = require('express');
const { body, param } = require('express-validator');
const { createInvoice, getInvoicesByUser } = require('../controllers/billingController');

const router = express.Router();

// ---------------------------------------------------------------------------
// Validation rules for POST /api/billing
// ---------------------------------------------------------------------------
const createInvoiceValidation = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('userId is required'),

  body('bookingId')
    .trim()
    .notEmpty()
    .withMessage('bookingId is required'),

  body('amount')
    .notEmpty()
    .withMessage('amount is required')
    .isFloat({ min: 0 })
    .withMessage('amount must be a non-negative number'),

  body('status')
    .trim()
    .notEmpty()
    .withMessage('status is required')
    .isIn(['pending', 'paid', 'overdue', 'cancelled'])
    .withMessage("status must be one of: 'pending', 'paid', 'overdue', 'cancelled'"),
];

// ---------------------------------------------------------------------------
// Validation rules for GET /api/billing/:userId
// ---------------------------------------------------------------------------
const getUserInvoicesValidation = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('userId param is required'),
];

// POST /api/billing      — Create a new invoice (with user verification)
router.post('/', createInvoiceValidation, createInvoice);

// GET /api/billing/:userId — Retrieve all invoices for a specific user
router.get('/:userId', getUserInvoicesValidation, getInvoicesByUser);

module.exports = router;
