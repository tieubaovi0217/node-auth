/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Response, NextFunction } from 'express';
import { google } from 'googleapis';

import { AuthorizedRequest } from '../common/types';

// import ResourceModel from '../models/resource';
// import ConferenceModel from '../models/conference';
import UserModel from '../models/user';

import { getOAuth2Client } from '../services/google';

export default {
  async getOAuth2URL(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const oAuth2Client = await getOAuth2Client();

      const scopes = ['https://www.googleapis.com/auth/drive.readonly'];

      const url = oAuth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: scopes,
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
      console.log(req.query);
      const { code } = req.query;
      const oAuth2Client = await getOAuth2Client();
      const { tokens } = await oAuth2Client.getToken(code);
      console.log(tokens);

      const { state: userId } = req.query;
      await UserModel.updateOne({ _id: userId }, { tokens: tokens });
      // if (!user) {
      //   throw new ErrorHandler(401, 'User not found');
      // }
      // console.log(user);
      // user.tokens = tokens;
      // await user.save();
      res.redirect('//localhost:3000/root');
    } catch (error) {
      next(error);
    }
  },

  async listFiles(req: AuthorizedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user.tokens) {
        return res.json([]);
      }
      const oAuth2Client = await getOAuth2Client();

      // const { tokens } = await oAuth2Client.getToken(code);
      console.log('tokens:', req.user.tokens);
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

      downloadFile(req.user.tokens, fileId)
        .then(() => {
          res.json('File synced with your web server');
        })
        .catch((err) => {
          console.log(err);
          res.status(400);
        });
    } catch (error) {
      next(error);
    }
  },
};

const downloadFile = async (tokens, fileId: string) => {
  const oAuth2Client = await getOAuth2Client();
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  oAuth2Client.setCredentials(tokens);

  return drive.files
    .get({ fileId, alt: 'media' }, { responseType: 'stream' })
    .then((res) => {
      return new Promise((resolve, reject) => {
        const filePath = uuidv4(); // TODO: change this
        console.log(`writing to ${filePath}`);
        const dest = fs.createWriteStream(filePath);
        let progress = 0;

        res.data
          .on('end', () => {
            console.log('Done downloading file.');
            resolve(filePath);
          })
          .on('error', (err) => {
            console.error('Error downloading file.');
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
    });
};

const getFiles = async (drive, pageToken = '') => {
  let files = [];
  const result = await drive.files.list({
    // pageSize default to 100
    q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
    pageToken,
    fields:
      'nextPageToken, files(id, name, originalFilename, size, fileExtension, mimeType, webContentLink, webViewLink)',
  });
  files = [...files, ...result.data.files];

  console.log('nextPageToken: ', result.data.nextPageToken);

  if (result.data.nextPageToken) {
    const nextFiles = await getFiles(drive, result.data.nextPageToken);
    files = [...files, ...nextFiles];
  }

  return files;
};
