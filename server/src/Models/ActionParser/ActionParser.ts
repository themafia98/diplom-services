import { Document, FilterQuery, isValidObjectId, Model, Types } from 'mongoose';
import { ActionParams, Parser } from '../../Utils/Interfaces/Interfaces.global';
import {
  DeleteEntitiyParams,
  Filter,
  limiter,
  OptionsUpdate,
  ParserData,
} from '../../Utils/Types/types.global';
import { DATABASE_ACTION } from './ActionParser.constant';

class ActionParser implements Parser {
  public async getCounter(
    model: Model<Document>,
    query: FilterQuery<any>,
    options: Record<string, any>,
  ): Promise<number> {
    const counterResult = await model.collection.countDocuments(query, options);
    return counterResult;
  }

  public async getAll(
    model: Model<Document>,
    actionParam: ActionParams,
    limit: limiter,
    skip = 0,
    sortType = 'desc',
  ): Promise<ParserData> {
    try {
      const toSkip: number = Math.abs(skip);
      const { in: inn, where } = actionParam;

      if (inn && where) {
        const { and = [{}], filter = {} } = actionParam as Record<
          string,
          Filter | Array<Record<string, any>>
        >;
        const orCondition: Array<Record<string, any>> =
          (filter as Filter).$or || ([{}] as Record<string, any>[]);
        const andComdition: Array<Record<string, any>> = and as Array<Filter>;
        return await model
          .find()
          .or(orCondition)
          .skip(toSkip)
          .where(where as string)
          .and(andComdition)
          .in(inn as Array<Record<string, any>>)
          .limit(limit as number)
          .sort({
            createdAt: sortType,
          });
      }

      const actionData: Array<Document> = await model
        .find(actionParam)
        .limit(limit as number)
        .skip(toSkip)
        .sort({
          createdAt: sortType,
        });

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async getFilterData(
    model: Model<Document>,
    filter: Record<string, any>,
    sort?: string,
  ): Promise<ParserData> {
    if (!model || !filter) {
      return null;
    }

    const filterDataResult = await model.find(filter as FilterQuery<Record<string, any>>).sort({
      createdAt: sort || 'desc',
    });

    return filterDataResult;
  }

  public async findOnce(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    try {
      return await model.findOne(actionParam);
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async createEntity(model: Model<Document>, item: Record<string, any>): Promise<ParserData> {
    try {
      return await model.create(item);
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async deleteEntity(model: Model<Document>, query: ActionParams): Promise<ParserData> {
    try {
      const { multiple = false, mode = DATABASE_ACTION.PULL, findBy, queryParams = {} } = query;
      const { uid = '', updateField = '', ids = [] } = queryParams as DeleteEntitiyParams;

      let actionData: any = null;
      let doc: any = null;

      const runDelete = async (props: ActionParams, multipleDelete = false): Promise<Record<string, any>> => {
        if (!multipleDelete) {
          const onceDeleteResult = await model.deleteOne(props);
          return onceDeleteResult;
        }

        const manyDeleteResult = await model.deleteMany({ [findBy as string]: { $in: ids } });
        return manyDeleteResult;
      };

      if (mode === DATABASE_ACTION.PULL) {
        const findByParam = {
          [findBy as string]: findBy,
        };

        const queryUpdate = {
          [mode as string]: { [updateField as string]: [uid] },
        };

        actionData = await model.update(findByParam, queryUpdate);
        doc = await model.findOne({ [findBy as string]: findBy });

        if (!doc) {
          return null;
        }

        const record: ArrayLike<string> = doc.get(updateField);

        if (Array.isArray(record) && !record.length) {
          const docResult: Record<string, any> = await runDelete({ [findBy as string]: findBy }, !!multiple);

          if (docResult.ok) {
            return docResult;
          }

          return null;
        }

        return actionData;
      }
      const docResult: Record<string, any> = await runDelete({}, !!multiple);

      if ((docResult as Record<string, boolean>).ok) {
        return docResult as Document;
      }

      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async updateEntity(
    model: Model<Document>,
    query: ActionParams,
    options: OptionsUpdate = {},
  ): Promise<ParserData> {
    try {
      const { queryType = 'single', actionParam = null } = query;

      if (queryType === 'meny') {
        // eslint-disable-next-line no-shadow
        const { query = {} } = (actionParam as Record<string, Record<string, any>>) || {};
        const { ids = [], updateProps = {}, returnType = 'default' } = query as DeleteEntitiyParams;
        const parsedIds = ids.map((id: string) => Types.ObjectId(id as string));

        const actionData: Record<string, any> = await model.updateMany(
          { _id: { $in: parsedIds } },
          { $set: { ...updateProps } },
          { multi: true, ...options },
        );

        const { ok = 0, nModified = 0 } = (actionData as Record<string, number>) || {};

        if (returnType === 'arrayItems') {
          return await model.find({ _id: { $in: ids } });
        }

        return { status: !!ok, count: nModified };
      }

      const { _id: id, key } = query as Record<string, string>;
      const { customQuery, updateProps: upProps = {} } = query;
      const { [customQuery as string]: customQueryValue = '' } = query;

      const updateProps: Record<string, any> =
        upProps && typeof upProps === 'object'
          ? (upProps as Record<string, any>)
          : { updateProps: query.updateProps };

      // eslint-disable-next-line no-underscore-dangle
      const _id: any = isValidObjectId(id) ? Types.ObjectId(id) : null;

      let findQuery: Record<string, any> | null = null;

      if (_id && !customQuery) {
        findQuery = { _id };
      } else if (key) {
        findQuery = { key };
      } else if (customQuery) {
        findQuery = { [customQuery as string]: customQueryValue };
      }

      if (!findQuery) {
        return null;
      }

      const actionData = await model.updateOne(
        findQuery,
        {
          ...updateProps,
        },
        options,
      );

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

export default ActionParser;
