import * as path from 'path';

export const makeResourcePath = (username: string, ...args: string[]) => {
  return path.join(process.env.WEB_SERVER_RESOURCE_PATH, username, ...args);
};
