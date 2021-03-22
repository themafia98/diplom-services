import DropboxStorage from '../Services/Dropbox.service';
import { FileApi, Params } from '../Utils/Interfaces/Interfaces.global';

export const createParams = (methodQuery: string, status: string, from: string, done = true): Params => ({
  methodQuery,
  status,
  from,
  done,
});

export const getFileStorage = ({ dropbox }: Record<string, FileApi>) => {
  switch (process.env.FS) {
    case DropboxStorage.name: {
      return dropbox;
    }
    default:
      // should be implement default fs on server
      return null;
  }
};
