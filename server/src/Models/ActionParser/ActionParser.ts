import { Document, FilterQuery, Model, Types } from 'mongoose';
import { ActionParams, Parser } from '../../Utils/Interfaces/Interfaces.global';
import {
  DeleteEntitiyParams,
  Filter,
  limiter,
  OptionsUpdate,
  ParserData,
} from '../../Utils/Types/types.global';

class ActionParser implements Parser {
  public async getCounter(model: Model<Document>, query: FilterQuery<any>, options: object): Promise<number> {
    const result = await model.collection.countDocuments(query, options);
    return result;
  }

  public async getAll(
    model: Model<Document>,
    actionParam: ActionParams,
    limit: limiter,
    skip: number = 0,
    sortType: string = 'desc',
  ): Promise<ParserData> {
    try {
      const toSkip: number = Math.abs(skip);
      const { in: inn = [], where = '' } = actionParam;
      if (inn && where) {
        const { and = [{}], filter = {} } = actionParam as Record<string, Filter | Array<object>>;
        const orCondition: Array<object> = (filter as Filter)['$or'] || ([{}] as object[]);
        const andComdition: Array<object> = and as Array<Filter>;
        return await model
          .find()
          .or(orCondition)
          .skip(toSkip)
          .where(where as string)
          .and(andComdition)
          .in(inn as Array<object>)
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

  public async getFilterData(model: Model<Document>, filter: object, sort?: string): Promise<ParserData> {
    if (!model || !filter) return null;
    const query: FilterQuery<object> = filter;
    const result = await model.find(query).sort({
      createdAt: sort || 'desc',
    });
    return result;
  }

  public async findOnce(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    try {
      const actionData = await model.findOne(actionParam);
      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async createEntity(model: Model<Document>, item: object): Promise<ParserData> {
    try {
      const actionData: Document = await model.create(item);
      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async deleteEntity(model: Model<Document>, query: ActionParams): Promise<ParserData> {
    try {
      const { multiple = false, mode = '$pullAll', findBy, queryParams = {} } = query;
      const { uid = '', updateField = '', ids = [] } = queryParams as DeleteEntitiyParams;

      const isPull = mode === '$pullAll';
      let actionData: Document | null = null;
      let doc: Document | null = null;

      const runDelete: Function = async (props: ActionParams, multiple: boolean = false): Promise<object> => {
        if (!multiple) {
          const result = await model.deleteOne(props);
          return result;
        }

        const result = await model.deleteMany({ [findBy as string]: { $in: ids } });
        return result;
      };

      if (isPull) {
        const findByParam = { [findBy as string]: findBy };
        const queryUpdate = {
          [mode as string]: { [updateField as string]: [uid] },
        };

        actionData = await model.update(findByParam, queryUpdate);
        doc = await model.findOne({ [findBy as string]: findBy });

        if (!doc) {
          return null;
        }

        const record: ArrayLike<string> = doc.get(updateField);

        if (Array.isArray(record) && (!record.length || record.length === 0)) {
          const docResult: { ok: boolean } = await runDelete({ [findBy as string]: findBy }, multiple);

          if (docResult.ok) {
            return docResult;
          } else return null;
        }

        return actionData;
      } else {
        const docResult: object = await runDelete({}, multiple);

        if ((docResult as Record<string, boolean>).ok) {
          return docResult as Document;
        } else return null;
      }
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

      switch (queryType) {
        case 'many': {
          const { query = {} } = (actionParam as Record<string, object>) || {};
          const { ids = [], updateProps = {}, returnType = 'default' } = query as DeleteEntitiyParams;
          const parsedIds = ids.map((id: string) => Types.ObjectId(id as string));

          const actionData: object = await model.updateMany(
            { _id: { $in: parsedIds } },
            { $set: { ...updateProps } },
            { multi: true, ...options },
          );
          const { ok = 0, nModified = 0 } = (actionData as Record<string, number>) || {};

          if (returnType === 'arrayItems') {
            return await model.find({ _id: { $in: ids } });
          } else return { status: Boolean(ok), count: nModified };
        }
        default: {
          const { _id: id, key } = query as Record<string, string>;
          const { customQuery, updateProps: upProps = {} } = query;
          const { [customQuery as string]: customQueryValue = '' } = query;

          const updateProps: object =
            upProps && typeof upProps === 'object' ? (upProps as object) : { updateProps: query.updateProps };

          const _id: any = id ? Types.ObjectId(id) : null;

          let findQuery: object = {};

          if (_id && !customQuery) findQuery = { _id };
          else if (key) findQuery = { key };
          else if (customQuery) findQuery = { [customQuery as string]: customQueryValue };

          const actionData = await model.updateOne(
            findQuery,
            {
              ...updateProps,
            },
            options,
          );

          return actionData;
        }
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

export default ActionParser;