import attachUser from '../src/middlewares/attachUser';
import UserModel from '../src/models/user';

afterEach(() => {
  jest.restoreAllMocks();
});

let email: string;
let req: any;
let res: any;
let next: any;

const setUpTest = () => {
  email = 'test@gmail.com';
  req = {
    token: {
      data: {
        email,
      },
    },
  };
  res = {};
  next = jest.fn();
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('given jwt token', () => {
  beforeEach(setUpTest);

  it('should attach user into request', async () => {
    UserModel.findOne = jest.fn().mockResolvedValue({ email });

    await attachUser(req, res, next);

    expect(req.user).toEqual({ email });
  });

  it('should invoke next with no params', async () => {
    UserModel.findOne = jest.fn().mockResolvedValue({ email });

    await attachUser(req, res, next);

    expect(next).toBeCalledWith();
  });
});

describe('given malformed jwt token', () => {
  beforeEach(setUpTest);

  it('should throw err user not found', async () => {
    UserModel.findOne = jest.fn().mockResolvedValue(undefined);

    await attachUser(req, res, next);

    expect(next).toBeCalledWith(new Error('User not found'));
  });
});

describe('internal server error', () => {
  beforeEach(setUpTest);

  it('should throw error 500', async () => {
    UserModel.findOne = jest.fn().mockRejectedValue(new Error(''));

    await attachUser(req, res, next);

    expect(next).toBeCalledWith(new Error('Internal server error'));
  });
});
