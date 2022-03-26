import * as glob from 'glob';
import * as fs from 'fs';

export const getDirectories = (src, callback) => {
  glob(src + '/**/*', callback);
};

export const getFolderSizeByGlob = (folder) => {
  const filePaths = glob.sync('**', {
    // "**" means you search on the whole folder
    cwd: folder, // folder path
    // ignore: array, // array of glob pattern strings
    absolute: true, // you have to set glob to return absolute path not only file names
  });
  let totalSize = 0;
  filePaths.forEach((file) => {
    const stat = fs.statSync(file);
    totalSize += stat.size;
  });
  return totalSize;
};
