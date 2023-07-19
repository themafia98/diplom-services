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
  const { syncList = [] } = actionParam as Record<string, Array<Record<string, any>>>;

  // eslint-disable-next-line no-restricted-syntax
  for await (const syncItem of syncList) {
    const { entity = '' } = syncItem as Record<string, string>;
    const { items = [] } = syncItem as Record<string, Array<Record<string, any>>>;
    const model: Model<Document> | null = getModelByName(entity, entity === 'tasks' ? ENTITY.TASK : entity);

    // eslint-disable-next-line no-continue
    if (!model) continue;
    // eslint-disable-next-line no-restricted-syntax
    for await (const updateProps of items) {
      let copy = { ...updateProps };

      const { _id = null, key = '' } = (updateProps as Record<string, string>) || {};

      const validId: any = typeof _id === 'string' ? Types.ObjectId(_id) : null;

      if (!validId) {
        copy = Object.keys(copy).reduce((acc, copyKey: string) => {
          if (copyKey === '_id') return acc;

          const { [copyKey]: item } = copy as Record<string, string | number | boolean>;

          return {
            ...acc,
            [copyKey]: item,
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
  res.setHeader('Content-type', mimetype || 'plain/text');

  if (process.env.NODE_ENV === 'development') {
    console.log('trace memory:', process.memoryUsage());
  }
  return request(link).pipe(res as any);
};
