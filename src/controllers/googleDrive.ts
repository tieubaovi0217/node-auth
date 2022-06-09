/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import { Response, NextFunction } from 'express';
import { google } from 'googleapis';

import { AuthorizedRequest } from '../common/types';

// import ResourceModel from '../models/resource';
// import ConferenceModel from '../models/conference';
import UserModel from '../models/user';
import {
  DRIVE_SCOPES,
  GOOGLE_DOCUMENT_MIME_TYPES,
  MSDOC_MIME_TYPES,
  EXTENSIONS,
} from '../common/constants';

import { getOAuth2Client } from '../services/google';
import { ErrorHandler } from '../middlewares/errorHandler';
import { isSupportedMimeType } from '../common/helpers';

export default {
  async getOAuth2URL(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const oAuth2Client = await getOAuth2Client();
      const url = oAuth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: DRIVE_SCOPES,
        state: req.user._id.toString(),
        // prompt: 'consent',
      });

      res.json({ url });
    } catch (error) {
      next(error);
    }
  },

  async saveToken(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      console.log('[saveToken] - req.query = ', req.query);
      const oAuth2Client = await getOAuth2Client();
      const { code } = req.query;
      const { tokens } = await oAuth2Client.getToken(code);
      console.log('[saveToken] - tokens = ', tokens);

      const { state: userId } = req.query;
      await UserModel.updateOne({ _id: userId }, { tokens: tokens });

      res.redirect(`${process.env.WEB_URL}/root?path=google:drive`);
    } catch (error) {
      next(error);
    }
  },

  async listFiles(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.tokens) {
        return res.json([]);
      }
      console.log('[listFiles] - tokens = ', req.user.tokens);

      const oAuth2Client = await getOAuth2Client();
      oAuth2Client.setCredentials(req.user.tokens);
      const drive = google.drive({ version: 'v3', auth: oAuth2Client });

      const result = await getFiles(drive);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async download(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.tokens) {
        return res.status(403);
      }
      const { fileId } = req.params;
      console.log('[download] - fileId = ', fileId);

      // downloadFile(req.user, fileId)
      //   .then(() => {
      //     res.json(`File ${fileId} synced!`);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     res.status(400);
      //   });

      await downloadFile(req.user, fileId);
      res.json(`File ${fileId} synced!`);
    } catch (error) {
      next(error);
    }
  },
};

const downloadFile = async (user, fileId: string) => {
  const oAuth2Client = await getOAuth2Client();
  oAuth2Client.setCredentials(user.tokens);
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  return drive.files.get({ fileId, fields: '*' }).then((re) => {
    console.log('[download] - re = ', re);
    const { mimeType } = re.data;
    let { name: fileName } = re.data;

    if (!isSupportedMimeType(mimeType)) {
      throw new ErrorHandler(400, 'File type is not allowed');
    }

    let exportMimeType;
    switch (mimeType) {
      case GOOGLE_DOCUMENT_MIME_TYPES.GOOGLE_DOCS:
        exportMimeType = MSDOC_MIME_TYPES.DOCX;
        fileName += `.${EXTENSIONS.DOCX}`;
        break;
      case GOOGLE_DOCUMENT_MIME_TYPES.GOOGLE_SHEETS:
        exportMimeType = MSDOC_MIME_TYPES.XLSX;
        fileName += `.${EXTENSIONS.XLSX}`;
        break;
      case GOOGLE_DOCUMENT_MIME_TYPES.GOOGLE_SLIDES:
        exportMimeType = MSDOC_MIME_TYPES.PPTX;
        fileName += `.${EXTENSIONS.PPTX}`;
        break;
      default:
    }

    const callback = (res) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(
          process.env.WEB_SERVER_RESOURCE_PATH,
          user.username,
          fileName,
        );
        console.log(`[download] - writing to ${filePath}`);
        const dest = fs.createWriteStream(filePath);
        let progress = 0;
        console.log('[download] - res = ', res);
        res.data
          .on('end', () => {
            console.log('[download] - Done downloading file.');
            resolve(filePath);
          })
          .on('error', (err) => {
            console.error('[download] - Error downloading file.');
            reject(err);
          })
          .on('data', (d) => {
            progress += d.length;
            if (process.stdout.isTTY) {
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(`Downloaded ${progress} bytes.`);
            }
          })
          .pipe(dest);
      });
    };

    if (exportMimeType) {
      return drive.files
        .export(
          {
            fileId,
            mimeType: exportMimeType,
          },
          { responseType: 'stream' },
        )
        .then(callback);
    }

    return drive.files
      .get({ fileId, alt: 'media' }, { responseType: 'stream' })
      .then(callback);
  });
};

const getFiles = async (drive, pageToken = '') => {
  const params = {
    // pageSize default to 100
    pageSize: 300,
    q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
    pageToken,
    fields:
      'nextPageToken, files(id, name, size, mimeType, webContentLink, webViewLink)',
  };
  let result = await drive.files.list(params);

  let files = result.data.files;
  while (result.data.nextPageToken) {
    console.log('[getFiles] - nextPageToken: ', result.data.nextPageToken);
    params.pageToken = result.data.nextPageToken;
    result = await drive.files.list(params);

    files = files.concat(result.data.files);
  }

  return files;
};
