import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';
import AuthService from '../services/auth';
import { validationResult } from 'express-validator';

config();
export default {
  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      const authService = AuthService.getInstance();
      const { user, token } = await authService.login(username, password);
      return res.json({ user, token, message: 'Successfully Login' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async signup(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const authService = AuthService.getInstance();
      const { user, token } = await authService.signUp(req.body);

      return res.json({ user, token, message: 'Successfully Signup' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { newPassword } = req.body;
      const authService = AuthService.getInstance();
      const { user, token } = await authService.changePassword(
        req.user.username,
        newPassword,
      );
      return res.json({ user, token, message: 'Password Changed' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },
};
