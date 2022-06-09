import { ALLOWED_MIME_TYPES } from './constants';

export const isSupportedMimeType = (mimeType: string): boolean => {
  return (
    mimeType.startsWith('image') ||
    mimeType.startsWith('audio') ||
    mimeType.startsWith('video/mp4') ||
    Object.values(ALLOWED_MIME_TYPES).includes(mimeType)
  );
};
