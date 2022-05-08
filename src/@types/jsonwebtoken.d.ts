import { DecodedJwtToken } from '../common/types';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    data: DecodedJwtToken;
  }
}
