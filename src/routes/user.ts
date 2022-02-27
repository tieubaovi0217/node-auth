import isAuth from '../middlewares/isAuth';
import attachUser from '../middlewares/attachUser';

import AuthService from '../services/auth';

export default (app) => {
  app.get('/', isAuth, attachUser, async (req, res) => {
    console.log(req.user);
    res.send('Authenticated');
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const authService = AuthService.getInstance();
      const { user, token } = await authService.login(email, password);
      return res.json({ user, token, message: 'Successfully login' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/signup', async (req, res) => {
    try {
      const { email, password } = req.body;
      const authService = AuthService.getInstance();
      const { user, token } = await authService.signUp(email, password);
      return res.json({ user, token, message: 'Successfully signup' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/changepassword', isAuth, attachUser, async (req, res) => {
    try {
      const { newPassword } = req.body;
      const authService = AuthService.getInstance();
      const { user, token } = await authService.changePassword(
        req.user.email,
        newPassword,
      );
      return res.json({ user, token, message: 'Password changed' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/logout', isAuth, async (req, res) => {
    //TODO: remove token from client
    res.send('Logout');
  });
};
