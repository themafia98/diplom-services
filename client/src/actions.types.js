const actionsTypes = {
  /**
   * @private
   * param key: actionType
   *
   * action for get notifications list
   *
   * 1. (/system/${type}/notification {POST})
   * 2. update multiple (/system/notification/update/many {POST})
   */
  $GET_NOTIFICATIONS: 'get_notifications',
  /**
   * @private
   * param key: actionType
   *
   * action for create notification
   *
   * (/system/${type}/notification {POST})
   */
  $SET_NOTIFICATION: 'set_notification',
  /**
   * @private
   * param key: actionType
   *
   * action for create room in chat, default actionPath: 'chatRoom'
   *
   * (/chat/createRoom {PUT})
   */
  $CREATE_CHAT_ROOM: 'create_chatRoom',
  /**
   * @private
   * param key: actionType
   *
   * action for load data by notification
   *
   */
  $LOAD_NOTIFICATION_DATA: 'load_notification_data',
  /**
   * @private
   * param key: actionType, use with param type: 'wikiTree'
   *
   * action for create tree leaf in wiki
   *
   * (/wiki/createLeaf {PUT})
   */
  $CREATE_LEAF: 'create_leaf',
  /**
   * @private
   * param key: actionType
   *
   * action for delete tree leaf in wiki
   *
   * (/wiki/deleteLeafs {DELETE})
   */
  $DELETE_LEAF: 'delete_leaf',
  /**
   * @private
   * param key: actionType,
   *
   * action for get current data list length
   *
   * (/tasks/listCounter {POST})
   */
  $CURRENT_LIST_COUNTER: 'current_list_counter',
  /**
   * @private
   * param key: actionType,
   *
   * action for update wiki page
   *
   * (/system/wiki/update/single {POST})
   */
  $UPDATE_WIKI_PAGE: 'update_wiki_page',
  /**
   * @private
   * param key: actionType, use with param type: 'wikiPage'
   *
   * action for get wiki page
   *
   * (/wiki/wikiPage {POST})
   */
  $GET_WIKI_PAGE: 'update_wiki_page',
  /**
   * @private
   * param key: actionType
   *
   * action for save jurnal task data
   *
   * (/${depStore}/caching/jurnal {PUT})
   */
  $CACHING_JURNAL: 'caching_jurnal',
  /**
   * @private
   * param key: actionType
   *
   * action for multiple update data
   *
   * (/system/${store}/update/many {POST})
   */
  $UPDATE_MANY: 'update_many',
  /**
   * @private
   * param key: actionType
   *
   * action for single update data
   *
   * (/system/${store}/update/single {POST})
   */
  $UPDATE_SINGLE: 'update_single',
  /**
   * @private
   * param key: actionType
   *
   * action for load application settings
   *
   * (/settings/${name} {GET|POST})
   */
  $SETTINGS_LOAD: 'settings_load',
  /**
   * @private
   * param key: actionType
   *
   * action for load or refresh new application settings
   *
   * (/settings/statusList {PUT})
   */
  SETTINGS_PUT: 'settings_put',
  /**
   * @private
   * param key: actionType
   *
   * action for load current tab data
   *
   * dynamic path and request method
   */
  $LOAD_CURRENT_DATA: 'load_current_data',
  /**
   * @private
   * param key: actionType
   *
   * action for load current chat room data by room token
   *
   * (/${activeModule}/load/tokenData {POST})
   */
  $LOAD_TOKEN_DATA: 'get_msg_by_token',
  /**
   * @private
   *
   * action for refresh chat room or rooms
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
   * (/${depStore}/${type ? type : 'caching'} {POST})
   */
  $GET_USER_SETTINGS_LOGS: 'get_user_settings_log',
  /**
   * @private
   * param key: actionType
   *
   * action for save file
   *
   * (/system/${store}/load/file {PUT})
   */
  $PUT_FILE: 'put_file',
  /**
   * @private
   * param key: actionType
   *
   * action for delete file
   *
   * (/system/${store}/delete/file {DELETE})
   */
  $DELETE_FILE: 'delete_file',
  /**
   * @private
   * param key: actionType
   *
   * action for sync client with server data
   *
   * (/system/sync {POST})
   */
  $SYNC_DATA: 'sync_data',
  /**
   * @private
   * param key: actionType
   *
   * action for load current user data
   *
   * (/userload {POST})
   */
  $LOAD_SESSION_USER: 'load_session_user',
  /**
   * @public
   * param key: actionType
   *
   * action for registration new user
   *
   * (/reg {POST})
   */
  $REG_USER: 'reg_user',
  /**
   * @public
   * param key: actionType
   *
   * action for enter user
   *
   * (/login {POST})
   */
  $LOGIN: 'login_user',
  /**
   * @public
   * param key: actionType
   *
   * action for recovory user data
   *
   * (/recovory {POST})
   */
  $RECOVORY: 'recovory_checker',
};

export default actionsTypes;
