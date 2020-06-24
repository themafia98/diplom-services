const actionsTypes = Object.freeze({
  /**
   * param key: actionType
   *
   * action for get notifications list
   *
   * 1. default params: methodQuery (/system/${type}/notification {POST})
   * 2. update multiple params: query (/system/notification/update/many {POST})
   */
  $GET_NOTIFICATIONS: 'get_notifications',
  /**
   * @private
   * param key: actionType
   *
   * action for create notification
   *
   * default params: item (/system/${type}/notification {POST})
   */
  $SET_NOTIFICATION: 'set_notification',
  /**
   * @private
   * param key: actionType
   *
   * action for create room in chat, default actionPath: 'chatRoom'
   *
   * default params: queryParams (/chat/createRoom {PUT})
   */
  $CREATE_CHAT_ROOM: 'create_chatRoom',
  /**
   * @private
   * param key: actionType
   *
   * action for load data by notification
   *
   * default params: any
   */
  $LOAD_NOTIFICATION_DATA: 'load_notification_data',
  /**
   * @private
   * param key: actionType, use with param type: 'wikiTree'
   *
   * action for create tree leaf in wiki
   *
   * default params: item, type (/wiki/createLeaf {PUT})
   */
  $CREATE_LEAF: 'create_leaf',
  /**
   * @private
   * param key: actionType
   *
   * action for delete tree leaf in wiki
   *
   * default params: queryParams with ids (array) (/wiki/deleteLeafs {DELETE})
   */
  $DELETE_LEAF: 'delete_leaf',
  /**
   * @private
   * param key: actionType,
   *
   * action for get current data list length
   *
   * default params: saveData, filterCounter (/tasks/listCounter {POST})
   */
  $CURRENT_LIST_COUNTER: 'current_list_counter',
  /**
   * @private
   * param key: actionType,
   *
   * action for update wiki page
   *
   * default params: wikiPage state (Editor) (/system/wiki/update/single {POST})
   */
  $UPDATE_WIKI_PAGE: 'update_wiki_page',
  /**
   * @private
   * param key: actionType, use with param type: 'wikiPage'
   *
   * action for get wiki page
   *
   * default params: methodQuery with treeId, type, params (page params)
   * (/wiki/wikiPage {POST})
   */
  $GET_WIKI_PAGE: 'update_wiki_page',
  /**
   * @private
   * param key: actionType
   *
   * action for save jurnal task data
   *
   * default params: queryParams with depKey and depStore, item
   * (/${depStore}/caching/jurnal {PUT})
   */
  $CACHING_JURNAL: 'caching_jurnal',
  /**
   * @private
   * param key: actionType
   *
   * action for multiple update data
   *
   * default params: queryParams with id, key(optional), updateItem, updateField
   * (/system/${store}/update/many {POST})
   */
  $UPDATE_MANY: 'update_many',
  /**
   * @private
   * param key: actionType
   *
   * action for single update data
   *
   * default params: queryParams with id, key(optional), updateItem, updateField
   * (/system/${store}/update/single {POST})
   */
  $UPDATE_SINGLE: 'update_single',
  /**
   * @private
   * param key: actionType
   *
   * action for load application settings
   *
   * default params: body with tuning name(prop)
   * (/settings/${name} {GET|POST})
   */
  $SETTINGS_LOAD: 'settings_load',
  /**
   * @private
   * param key: actionType
   *
   * action for load or refresh new application settings
   *
   * default params: queryParams: { idSettings, item } or other settings props
   * (/settings/statusList {PUT})
   */
  SETTINGS_PUT: 'settings_put',
  /**
   * @private
   * param key: actionType
   *
   * action for load current tab data
   *
   * default params: methodQuery, options (dynamic path and request method)
   */
  $LOAD_CURRENT_DATA: 'load_current_data',
  /**
   * @private
   * param key: actionType
   *
   * action for load current chat room data by room token
   *
   * default params: queryParams with tokenRoom and options
   * (/${activeModule}/load/tokenData {POST})
   */
  $LOAD_TOKEN_DATA: 'load_token_data',
  /**
   * @private
   * param key: options: { ...props, actionType }
   *
   * action for refresh chat room or rooms
   *
   * default params: queryParams with queryParams(object, tokenRoom and moduleName)
   *
   * (/${activeModule}/load/tokenData {POST})
   */
  $GET_UPDATE_ROOMS: 'get_update_rooms',
  /**
   * @private
   * param key: actionType
   *
   * action for load settings changes logs
   *
   * default params: queryParams with uid
   * (/${depStore}/${type ? type : 'caching'} {POST})
   */
  $GET_USER_SETTINGS_LOGS: 'get_user_settings_log',
  /**
   * @private
   * param key: actionType
   *
   * action for save file
   *
   * default params: any file data
   * (/system/${store}/load/file {PUT})
   */
  $PUT_FILE: 'put_file',
  /**
   * @private
   * param key: actionType
   *
   * action for delete file
   *
   * default params: any file data
   * (/system/${store}/delete/file {DELETE})
   */
  $DELETE_FILE: 'delete_file',
  /**
   * @private
   * param key: actionType
   *
   * action for sync client with server data
   *
   * default params: syncList(Array)
   * (/system/sync {POST})
   */
  $SYNC_DATA: 'sync_data',
  /**
   * @private
   * param key: actionType
   *
   * action for load current user data
   *
   * default params: none
   * (/userload {POST})
   */
  $LOAD_SESSION_USER: 'load_session_user',
  /**
   * @public
   * param key: actionType
   *
   * action for registration new user
   *
   * default params: user object with data
   * (/reg {POST})
   */
  $REG_USER: 'reg_user',
  /**
   * @public
   * param key: actionType
   *
   * action for enter user
   *
   * default params: user object with data
   * (/login {POST})
   */
  $LOGIN: 'login_user',
  /**
   * @public
   * param key: actionType
   *
   * action for recovory user data
   *
   * default params: recovoryField, mode of recovory
   * (/recovory {POST})
   */
  $RECOVORY: 'recovory_checker',
});

export default actionsTypes;
