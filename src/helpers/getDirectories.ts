import * as glob from 'glob';

export const getDirectories = (src, callback) => {
  glob(src + '/**/*', callback);
};
