import { DropboxAccess } from '../Utils/Interfaces';

export default {
  fetch: require('isomorphic-fetch'),
  accessToken: process.env.DROPBOX_TOKEN as string,
} as DropboxAccess;
