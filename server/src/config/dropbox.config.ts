import { DropboxAccess } from '../Utils/Interfaces/Interfaces.global';

export default Object.freeze({
  fetch: require('isomorphic-fetch'),
  accessToken: process.env.DROPBOX_TOKEN as string,
}) as DropboxAccess;
