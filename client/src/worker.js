import Request from 'Models/Rest';
import actionsTypes from 'actions.types';

/**
 * web worker
 */

let initial = null;

/**
 *
 * @param {string} token jwt token
 */

export function runSync(token, clientDB = null) {
  /**
   * sync client data with server data
   */
  async function loop() {
    if (initial) clearTimeout(initial);
    const rest = new Request(token);
    const range = IDBKeyRange.lowerBound(0);
    const valuesDb = clientDB?.availableList;

    if (!valuesDb || !valuesDb?.length) return null;

    const offlineDataList = [];

    for await (let value of valuesDb) {
      const { entity = '' } = value || {};
      if (!entity) continue;

      const items = await clientDB.getAllItems(entity, 'readonly', range);
      const filteredItems = items?.length ? items.filter((item) => item?.offline) : [];

      if (!filteredItems?.length) continue;

      offlineDataList.push({
        entity,
        items: items.reduce((itemsList, item) => {
          if (item?.offline) return [...itemsList, { ...item, offline: false }];
          return itemsList;
        }, []),
      });
    }

    if (offlineDataList?.length) runServerSync(offlineDataList, rest, loop);
    else initial = setTimeout(loop, 10000);
  }

  if (!clientDB) {
    console.error('Critical error (sync worker). Not found clientDB');
  }
  initial = setTimeout(loop, 10000);
}

async function runServerSync(list = [], rest, loop) {
  try {
    if (!rest instanceof Request) {
      throw new TypeError('invalid request model entity');
    }
    await rest.sendRequest(
      '/system/sync',
      'POST',
      {
        actionType: actionsTypes.$SYNC_DATA,
        syncList: list,
      },
      'worker',
    );
    initial = setTimeout(loop, 10000);
  } catch (error) {
    console.error(error);
    return null;
  }
}
