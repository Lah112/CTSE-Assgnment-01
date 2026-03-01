'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const env = require('../config/env');

/**
 * POST /api/auth/register
 * Register a new user account.
 */
const register = async (req, res, next) => {
  try {
    // Validate incoming request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array({ onlyFirstError: true }),
      });
    }

    const { name, email, password } = req.body;

    // Check if email is already in use
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash the password — never store plain text
    const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

    const user = await userModel.create({ name, email, hashedPassword });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a signed JWT.
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array({ onlyFirstError: true }),
      });
    }

    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);

    // Use a constant-time comparison path even when user is not found
    // to prevent user-enumeration via timing attacks.
    const dummyHash =
      '$2a$12$invalidhashusedtopreventsideChannelLeaks000000000000000000';
    const passwordMatch = await bcrypt.compare(
      password,
      user ? user.password : dummyHash
    );

    if (!user || !passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
      algorithm: 'HS256',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
