const express = require('express');
const { body } = require('express-validator');
const { getAllInventory, addInventoryItem } = require('../controllers/inventoryController');

const router = express.Router();

// Validation rules for POST /api/inventory
const addItemValidation = [
  body('userId')
    .trim()
    .notEmpty()
    .withMessage('userId is required'),

  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('itemName is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('itemName must be between 2 and 200 characters'),

  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isInt({ min: 0 })
    .withMessage('quantity must be a non-negative integer'),

  body('price')
    .notEmpty()
    .withMessage('price is required')
    .isFloat({ min: 0 })
    .withMessage('price must be a non-negative number'),
];

// GET /api/inventory  — Retrieve all inventory items
router.get('/', getAllInventory);

// POST /api/inventory — Add a new inventory item (with user verification)
router.post('/', addItemValidation, addInventoryItem);

module.exports = router;
