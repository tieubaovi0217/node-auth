import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import UserModel from '../models/user';

config();

export default class AuthService {
  private static _instance: AuthService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): AuthService {
    if (!this._instance) {
      this._instance = new AuthService();
    }

    return this._instance;
  }

  public async login(email, password) {
    const userWithThisEmail = await UserModel.findOne({ email });
    if (!userWithThisEmail) {
      throw new Error('User not found');
    }

    const isSamePassword = await bcrypt.compare(
      password,
      userWithThisEmail.password,
    );

    if (!isSamePassword) {
      throw new Error('Incorrect password');
    }

    return {
      user: {
        email,
      },
      token: this.generateJWT(userWithThisEmail),
    };
  }

  public async signUp(email, password) {
    const userWithThisEmail = await UserModel.findOne({ email });
    if (userWithThisEmail) {
      throw new Error('User with that email already exists.');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS),
    );
    const newUser = new UserModel({
      email,
      password: hashedPassword,
    });
    const newUserDoc = await newUser.save();

    return {
      user: {
        email: newUserDoc.email,
      },
      token: this.generateJWT(newUserDoc),
    };
  }

  public async changePassword(email, newPassword) {
    const userWithThisEmail = await UserModel.findOne({ email });
    if (!userWithThisEmail) {
      throw new Error('User with this email not exist');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_ROUNDS),
    );
    userWithThisEmail.password = hashedPassword;
    await userWithThisEmail.save();
    return {
      user: {
        email,
      },
      token: this.generateJWT(userWithThisEmail),
    };
  }

  generateJWT(userData) {
    return jwt.sign(
      {
        data: {
          id: userData._id,
          email: userData.email,
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: '6h' },
    );
  }
}
// async function main() {
//   try {
//     await mongoose.connect('mongodb://localhost/auth');

//     const test = new AuthService();
//     // const result = await test.signUp('test', 'test@gmail.com', 'test');
//     // const result = await test.login('test', 'test');

//     const result = test.generateJWT({
//       _id: 'test',
//       username: 'test',
//       email: 'test',
//     });
//     console.log(result);
//   } catch (err) {
//     console.log(err);
//   } finally {
//     mongoose.connection.close();
//   }
// }

// main();
