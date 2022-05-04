import * as fs from 'fs';
import { ErrorHandler } from '../middlewares/errorHandler';

export const checkResourceExists = async (
  resourcePath: string,
): Promise<fs.Stats> => {
  try {
    const stats = await fs.promises.stat(resourcePath);
    return stats;
  } catch (err) {
    throw new ErrorHandler(400, 'No such file or directory');
  }
};
