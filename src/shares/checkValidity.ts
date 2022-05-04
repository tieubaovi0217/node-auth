import { regexCheckFolder } from '../common/constants';

import { ErrorHandler } from '../middlewares/errorHandler';

export const checkValidFolderName = (folderName: string) => {
  console.log(folderName);
  const isValidFolderName = regexCheckFolder.test(folderName);
  if (!isValidFolderName) {
    throw new ErrorHandler(400, 'Invalid folder name');
  }
};
