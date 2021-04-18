import { files } from 'dropbox';
import request from 'request';
import { Response } from 'express';
import mime from 'mime';
import { Document, Model, Types } from 'mongoose';
import { getModelByName } from '../../Utils/utils.global';
import { ActionParams } from '../../Utils/Interfaces/Interfaces.global';
import { Meta, ParserData } from '../../Utils/Types/types.global';
import ActionParser from '../ActionParser/ActionParser';
import { ENTITY } from '../Database/Schema/Schema.constant';

export const runSyncClient = async (
  action: ActionParser,
  actionParam: ActionParams | Meta,
): Promise<ParserData> => {
  const { syncList = [] } = actionParam as Record<string, Array<object>>;

  for await (let syncItem of syncList) {
    const { entity = '' } = syncItem as Record<string, string>;
    const { items = [] } = syncItem as Record<string, Array<object>>;
    const model: Model<Document> | null = getModelByName(entity, entity === 'tasks' ? ENTITY.TASK : entity);

    if (!model) continue;
    for await (let updateProps of items) {
      let copy = { ...updateProps };

      const { _id = null, key = '' } = (updateProps as Record<string, string>) || {};

      const validId: any = typeof _id === 'string' ? Types.ObjectId(_id) : null;

      if (!validId) {
        copy = Object.keys(copy).reduce((acc, key: string) => {
          if (key === '_id') return acc;

          const { [key]: item } = copy as Record<string, string | number | boolean>;

          return {
            ...acc,
            [key]: item,
          };
        }, {});
      }

      const query: ActionParams = {
        updateProps: copy,
        _id: validId,
        key,
      };

      await action.updateEntity(model, query, { upsert: true });
    }
  }

  return [{ syncDone: true }];
};

export const startDownloadPipe = (
  res: Response,
  file: files.GetTemporaryLinkResult,
  actionParam: ActionParams,
) => {
  const { link = '' } = file;
  const { filename = '' } = actionParam as ActionParams;
  const mimetype = (<any>mime).lookup(filename as string);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype ? mimetype : 'plain/text');

  if (process.env.NODE_ENV === 'development') {
    console.log('trace memory:', process.memoryUsage());
  }
  return request(link).pipe(res);
};
