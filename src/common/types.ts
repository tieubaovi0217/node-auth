import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Document, ObjectId } from 'mongoose';

export interface UserPayload {
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  token: string;
  user: UserPayload;
}

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface DecodedJwtToken {
  id: ObjectId;
  username: string;
  email: string;
}

export interface AuthorizedRequest extends Request {
  user: User;
  token: JwtPayload;
}
