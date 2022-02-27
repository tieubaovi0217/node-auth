import UserModel from '../models/user';

export default async (req, res, next) => {
  try {
    const { email } = req.token.data;
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
