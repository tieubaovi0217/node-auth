import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import UserModel from '../models/user';
import { ErrorHandler } from '../middlewares/errorHandler';

import { DecodedJwtToken, LoginPayload, User } from '../common/types';

config();

export default class AuthService {
  private static _instance: AuthService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (!this._instance) {
      this._instance = new AuthService();
    }

    return this._instance;
  }

  public async login(
    username: string,
    password: string,
  ): Promise<LoginPayload> {
    const userRecord = await UserModel.findOne({ username });

    const isSamePassword = await bcrypt.compare(
      password,
      userRecord ? userRecord.password : '',
    );

    if (!isSamePassword) {
      throw new ErrorHandler(401, 'Invalid credentials');
    }

    return {
      user: {
        username,
        email: userRecord.email,
        avatarUrl: userRecord.avatarUrl,
      },
      token: this.generateJWT(userRecord),
    };
  }

  public async signUp(userData: User): Promise<LoginPayload> {
    const { username, email, password } = userData;
    const userRecord = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (userRecord) {
      throw new ErrorHandler(400, 'Email or username is used');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS),
    );
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    const newUserDoc = await newUser.save();

    return {
      user: {
        username,
        email,
      },
      token: this.generateJWT(newUserDoc),
    };
  }

  generateJWT(userData: User, expiresIn = '1d') {
    const userDataTokenPayload: DecodedJwtToken = {
      id: userData._id,
      username: userData.username,
      email: userData.email,
    };
    return jwt.sign(
      {
        data: userDataTokenPayload,
      },
      process.env.SECRET_KEY,
      { expiresIn },
    );
  }
}
