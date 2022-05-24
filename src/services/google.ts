/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';

export async function getOAuth2Client() {
  const content = await fs.promises.readFile(
    path.join(__dirname, 'credentials.json'),
  );
  const credentials = JSON.parse(content.toString());
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  return oAuth2Client;
}
