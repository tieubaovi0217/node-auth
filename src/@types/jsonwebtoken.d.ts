/// <reference types="jsonwebtoken" />

import { DecodedJwtToken } from 'src/common/types';

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    data: DecodedJwtToken;
  }
}
