export const DEFAULT_PORT = 5000;
export const RETRY_TIME = 5;
export const regexCheckFolder = /^[a-zA-Z].*/;

export const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

export const GOOGLE_DOCUMENT_MIME_TYPES = {
  GOOGLE_DOCS: 'application/vnd.google-apps.document',
  GOOGLE_SLIDES: 'application/vnd.google-apps.presentation',
  GOOGLE_SHEETS: 'application/vnd.google-apps.spreadsheet',
};

export const MSDOC_MIME_TYPES = {
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

export const EXTENSIONS = {
  DOCX: 'docx',
  PPTX: 'pptx',
  XLSX: 'xlsx',
};

export const ALLOWED_MIME_TYPES = {
  PDF: 'application/pdf',
  DOCX: MSDOC_MIME_TYPES.DOCX,
  XLSX: MSDOC_MIME_TYPES.XLSX,
  PPTX: MSDOC_MIME_TYPES.PPTX,
};

export const DEFAULT_AVATAR_URL =
  'https://d1a370nemizbjq.cloudfront.net/2923050f-d67d-45bc-b47e-2235fc6a3fa2.glb';
