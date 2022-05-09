import * as bcrypt from 'bcrypt';
import AuthService from '../../src/services/auth';
import UserModel from '../../src/models/user';

afterEach(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.spyOn(bcrypt, 'compare').mockImplementation((p1, p2) => p1 === p2);
});

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
    UserModel.findOne = jest
      .fn()
      .mockResolvedValue({ username, email, password: 'admin' });

    const authInstance = AuthService.getInstance();
    authInstance.generateJWT = jest.fn().mockReturnValue('token');

    const { user, token } = await authInstance.login(username, password);

    expect(user).toEqual({ username, email });
    expect(token).toBe('token');
  });

  it('should login fail', async () => {
    const username = 'admin';
    const password = 'test';
    const email = 'admin@gmail.com';
    UserModel.findOne = jest
      .fn()
      .mockResolvedValue({ username, email, password: 'admin' });

    const authInstance = AuthService.getInstance();
    authInstance.generateJWT = jest.fn().mockReturnValue('token');

    const { user, token } = await authInstance.login(username, password);

    expect(user).toEqual({ username, email });
    expect(token).toBe('token');
  });
});
