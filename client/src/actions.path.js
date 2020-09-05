const actionPath = {
  $GLOBAL_LOAD_USERS: 'GET__??system.userList??_$$get_all$$_{{users}}',
  $LOAD_STATISTICS_TASKS: 'POST__??statistic.taskBar??_$$get_stats$$_{{tasks}}',
  $LOAD_TASKS_LIST: 'POST__??tasks.list??_$$get_all$$_{{tasks}}',
  $LOAD_WIKI_TREE: 'GET__??wiki.list??_$$get_all$$__{{wikiTree}}',
  $LOAD_NEWS: 'POST__??news.list??_$$get_all$$__{{news}}',
};

const getActionPathByKey = (actionKey) => {
  return Object.values(actionPath).find((aPath) =>
    Array.isArray(actionKey) ? actionKey.every((key) => aPath.includes(key)) : aPath.includes(actionKey),
  );
};

export { getActionPathByKey };
export default actionPath;
