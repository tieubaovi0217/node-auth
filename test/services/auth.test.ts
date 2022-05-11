import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import AuthService from '../../src/services/auth';
import UserModel from '../../src/models/user';
import { User } from '../../src/common/types';

afterEach(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.spyOn(bcrypt, 'compare').mockImplementation((p1, p2) => p1 === p2);
});

const originalGenerateJWT = AuthService.getInstance().generateJWT;

describe('AuthService/getInstance', () => {
  it('should return the same instance', () => {
    const instance1 = AuthService.getInstance();
    const instance2 = AuthService.getInstance();

    const isSame = instance1 === instance2;
    expect(isSame).toBe(true);
  });
});

describe('AuthService/login', () => {
  it('should login successfully', async () => {
    const username = 'admin';
    const password = 'admin';
    const email = 'admin@gmail.com';
    UserModel.findOne = jest.fn().mockResolvedValue({
      username,
      email,
      password,
      avatarUrl: 'url',
    });

    const authInstance = AuthService.getInstance();
    authInstance.generateJWT = jest.fn().mockReturnValue('token');

    const { user, token } = await authInstance.login(username, password);

    expect(user).toEqual({ username, email, avatarUrl: 'url' });
    expect(token).toBe('token');
  });

  it('should login fail if passwords are not match', async () => {
    const username = 'admin';
    const password = 'test';
    const email = 'admin@gmail.com';

    const authInstance = AuthService.getInstance();

    expect(async () => {
      await authInstance.login(username, password);
    }).rejects.toThrowError('Invalid credentials');
  });

  it('should login fail if username does not exists', async () => {
    const username = 'admin';
    const password = 'test';
    const email = 'admin@gmail.com';

    UserModel.findOne = jest.fn().mockReturnValue(undefined);

    const authInstance = AuthService.getInstance();

    expect(async () => {
      await authInstance.login(username, password);
    }).rejects.toThrowError('Invalid credentials');
  });
});

describe('AuthService/signUp', () => {
  jest.setTimeout(15000);
  it('should signup successfully', async () => {
    const userData: any = {
      username: 'admin',
      password: 'admin',
      email: 'admin@gmail.com',
    };
    UserModel.findOne = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(UserModel.prototype, 'save').mockImplementation(() => {
      return Promise.resolve('user');
    });
    const authInstance = AuthService.getInstance();
    authInstance.generateJWT = jest.fn().mockReturnValue('token');
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(() => Promise.resolve('hashedPassword'));

    const { user, token } = await authInstance.signUp(userData);

    expect(user).toEqual({ username: 'admin', email: 'admin@gmail.com' });
    expect(token).toBe('token');
    expect(authInstance.generateJWT).toBeCalledWith('user');
  });

  it('should signup fail if username exists', async () => {
    const username = 'admin';
    const password = 'test';
    const email = 'admin@gmail.com';

    const authInstance = AuthService.getInstance();
    UserModel.findOne = jest.fn().mockResolvedValue({ username: 'admin' });
    expect(async () => {
      await authInstance.signUp({ username, password, email } as any);
    }).rejects.toThrowError('Email or username is used');
  });
});

describe('AuthService/generateJWT', () => {
  it('should generate jwt token', () => {
    const userData: any = {
      username: 'test',
      password: 'test',
      email: 'email',
    };
    const authInstance = AuthService.getInstance();

    authInstance.generateJWT = originalGenerateJWT;
    const jwtToken = authInstance.generateJWT(userData);
    jest.spyOn(jwt, 'sign').mockImplementation(() => 'test');

    expect(typeof jwtToken).toBe('string');
  });
});
