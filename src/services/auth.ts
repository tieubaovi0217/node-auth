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

  public async login(username, password) {
    const userRecord = await UserModel.findOne({ username });
    if (!userRecord) {
      throw new Error('User not found');
    }

    const isSamePassword = await bcrypt.compare(password, userRecord.password);

    if (!isSamePassword) {
      throw new Error('Incorrect password');
    }

    return {
      user: {
        username,
      },
      token: this.generateJWT(userRecord),
    };
  }

  public async signUp(data) {
    const { username, email, password } = data;
    const userRecord = await UserModel.findOne({ $or: [{ email, username }] });
    if (userRecord) {
      throw new Error('User with that email or username already exists.');
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

  public async changePassword(username, newPassword) {
    const userRecord = await UserModel.findOne({ username });
    if (!userRecord) {
      throw new Error('User with this email not exist');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_ROUNDS),
    );
    userRecord.password = hashedPassword;
    await userRecord.save();
    return {
      user: {
        username,
      },
      token: this.generateJWT(userRecord),
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
