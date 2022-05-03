import * as path from 'path';

export const makePath = (username: string, ...args: string[]) => {
  return path.join(process.env.WEB_SERVER_RESOURCE_PATH, username, ...args);
};
