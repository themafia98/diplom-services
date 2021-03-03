import { Model, Document, Types, isValidObjectId } from 'mongoose';
import { ActionParams, Actions, Action, QueryParams } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionWiki implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getTreeList(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    return this.getEntity().getAll(model, actionParam);
  }

  private async createLeaf(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { item = null } = (actionParam as Record<string, object>) || {};
    const { parentId = 'root' } = (item as Record<string, string>) || {};
    const isRoot = parentId === 'root';

    if (!item || (item && _.isEmpty(item)) || parentId === null || (!isRoot && !isValidObjectId(parentId))) {
      return null;
    }

    const validId = !isRoot ? Types.ObjectId(parentId) : parentId;
    if (!validId) return null;

    return await this.getEntity().createEntity(model, { ...item, parentId: validId } as object);
  }

  private async deleteLeafs(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = null } = (actionParam as Record<string, QueryParams>) || {};

    if (!queryParams || (queryParams && _.isEmpty(queryParams))) return null;
    const { ids = [] } = (queryParams as Record<string, string[]>) || {};
    const parsedIds: Array<Types.ObjectId> = Array.isArray(ids)
      ? ids.reduce((list: Array<Types.ObjectId>, id: string) => {
          if (isValidObjectId(id)) return [...list, Types.ObjectId(id)];
          return list;
        }, [])
      : ids;

    const query: ActionParams = {
      multiple: true,
      mode: 'many',
      findBy: '_id',
      queryParams: { ids: parsedIds },
    };

    let idsPages: Array<Types.ObjectId> = [];
    const pageModel: Model<Document> | null = getModelByName('wikiPage', 'wikiPage');

    if (pageModel) idsPages = await this.getWikiPageList(parsedIds, pageModel);

    const deleteResult: ParserData = await this.getEntity().deleteEntity(model, query);
    const { deletedCount = 0 } = (deleteResult as Record<string, number>) || {};

    if (deletedCount && Array.isArray(idsPages) && pageModel) {
      await this.getEntity().deleteEntity(pageModel, {
        multiple: true,
        mode: 'many',
        findBy: '_id',
        queryParams: { ids: idsPages },
      });
    }

    return deleteResult;
  }

  private async getWikiPageList(
    ids: Array<Types.ObjectId>,
    model: Model<Document>,
  ): Promise<Array<Types.ObjectId>> {
    if (!ids || !Array.isArray(ids)) return [];

    const pagesList = await this.getEntity().getAll(model, {
      treeId: { $in: ids },
    });

    return Array.isArray(pagesList)
      ? pagesList.map(({ _id = '' }) => Types.ObjectId(_id)).filter(Boolean)
      : [];
  }

  private async getWikiPage(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { methodQuery = {} } = actionParam as Record<string, ActionParams>;
    const { treeId: treeIdDirty = '' } = (methodQuery as Record<string, string>) || {};
    const treeId: Types.ObjectId | null = isValidObjectId(treeIdDirty) ? Types.ObjectId(treeIdDirty) : null;

    if (!treeId) return null;

    const result = await this.getEntity().findOnce(model, { ...methodQuery, treeId });
    return result;
  }

  private async update(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const { queryParams = {}, updateItem: updateItemDirty = {} } = actionParam as Record<string, object>;
      const { pageId: pageIdDirty = '' } = queryParams as QueryParams;

      const isVirtual = pageIdDirty.includes('virtual');

      const { treeId: treeIdDirty = '' } = (updateItemDirty as Record<string, string>) || {};

      const treeId: Types.ObjectId | string = isValidObjectId(treeIdDirty)
        ? Types.ObjectId(treeIdDirty)
        : treeIdDirty;

      const updateProps = {
        ...updateItemDirty,
        treeId,
      };

      if (isVirtual) {
        const actionData: ParserData = await this.getEntity().createEntity(model, updateProps);
        return actionData;
      }

      const isValidId = isValidObjectId(pageIdDirty);
      const pageId = isValidId ? Types.ObjectId(pageIdDirty) : null;

      const queryFind: ActionParams = pageId ? { _id: pageId } : {};
      const query: ActionParams = { updateProps };

      if (pageId) query._id = pageId;

      await this.getEntity().updateEntity(model, query);
      const actionData: ParserData = await this.getEntity().findOnce(model, queryFind);

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const { type = 'wikiTree' } = actionParam as Record<string, string>;
    const model: Model<Document> | null = getModelByName(type, type);
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_all':
        return this.getTreeList(actionParam, model);
      case 'create_leaf':
        return this.createLeaf(actionParam, model);
      case 'delete_leafs':
        return this.deleteLeafs(actionParam, model);
      case 'update_single':
        return this.update(actionParam, model);
      case 'wiki_page':
        return this.getWikiPage(actionParam, model);
      default:
        return null;
    }
  }
}
export default ActionWiki;
