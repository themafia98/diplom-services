import React from 'react';
import { streamBoxType } from './types';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadCurrentData, multipleLoadData } from 'Redux/actions/routerActions/middleware';
import { addTabAction, openPageWithDataAction, setActiveTabAction } from 'Redux/actions/routerActions';
import _ from 'lodash';
import { Avatar, message, Tooltip, Spin } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import clsx from 'clsx';
import { routeParser, routePathNormalise, buildRequestList } from 'Utils';
import modelContext from 'Models/context';
import actionsTypes from 'actions.types';

class StreamBox extends React.Component {
  state = {
    type: null,
    streamList: [],
  };

  static propTypes = streamBoxType;
  static contextType = modelContext;
  static defaultProps = {
    mode: '',
    visiblePopover: false,
    isLoadPopover: false,
    type: null,
    isSingleLoading: false,
    setCounter: null,
    udata: {},
    filterStream: '',
    onMultipleLoadData: null,
    onSaveComponentState: null,
    streamStore: '',
    streamModule: '',
    onLoadPopover: null,
    personalUid: null,
    setCurrentTab: null,
    onOpenPageWithData: null,
    router: {},
    store: '',
    prefix: '',
    boxClassName: '',
    parentPath: '',
    buildItems: null,
    listHeight: null,
  };

  static getDerivedStateFromProps = (props, state) => {
    if (_.isNull(state.type) && props.type) {
      return {
        ...state,
        type: props.type,
      };
    }
    return state;
  };

  onLoadingInterval = null;

  componentDidMount = async () => {
    const { type, isSingleLoading, setCounter, visiblePopover, isLoadPopover } = this.props;
    const shouldUpdatePrivate = setCounter && visiblePopover && !isLoadPopover;
    const { config: { intervalNotification = 30000 } = {} } = this.context;
    if (!type) return;

    await this.onLoadingStreamList(shouldUpdatePrivate);
    if (!isSingleLoading)
      this.onLoadingInterval = setInterval(() => this.fetchNotification(true), intervalNotification);
  };

  componentDidUpdate = () => {
    const { setCounter, visiblePopover, isLoadPopover } = this.props;
    const shouldUpdatePrivate = setCounter && visiblePopover && !isLoadPopover;

    if (shouldUpdatePrivate) this.onLoadingStreamList(true);
  };

  componentWillUnmount = () => {
    if (this.onLoadingInterval) {
      clearInterval(this.onLoadingInterval);
    }
  };

  onLoadingStreamList = async (shouldUpdatePrivate = false) => {
    const { type, filterStream, udata: { _id: uid = '' } = {} } = this.props;

    const isPrivate = type.includes('private');

    if (((!filterStream || !uid) && isPrivate) || !type || (!shouldUpdatePrivate && isPrivate)) {
      return;
    }

    if (!shouldUpdatePrivate && isPrivate) return;
    this.fetchNotification();
  };

  updateRead = async (ids) => {
    if (Array.isArray(ids) && !ids.length) return { ok: 1, count: 0 };
    try {
      const { Request } = this.context;
      const rest = new Request();
      const res = await rest.sendRequest(
        '/system/notification/update/many',
        'POST',
        {
          actionType: actionsTypes.$GET_NOTIFICATIONS,
          query: { ids, updateProps: { isRead: true } },
        },
        true,
      );
      const {
        data: { response: { metadata: metadataReadable = {} } = {} },
      } = res;

      return metadataReadable;
    } catch (error) {
      console.error(error);
      return { ok: 0 };
    }
  };

  fetchNotification = async () => {
    try {
      const { Request } = this.context;
      const {
        type = '',
        onMultipleLoadData,
        onSaveComponentState,
        streamStore,
        streamModule,
        filterStream,
        setCounter = null,
        visiblePopover,
        isLoadPopover,
        onLoadPopover,
        personalUid = null,
        udata: { _id = '' } = {},
      } = this.props;
      const uid = !personalUid ? _id : personalUid;
      const shouldUpdatePrivate = setCounter && visiblePopover && !isLoadPopover;

      let methodQuery = filterStream && uid ? { [filterStream]: uid } : {};
      if (type.includes('private') && _.isEmpty(methodQuery)) return;

      if (shouldUpdatePrivate && onLoadPopover) {
        onLoadPopover();
      }

      const rest = new Request();
      const res = await rest.sendRequest(
        `/system/${type}/notification`,
        'POST',
        {
          actionType: actionsTypes.$GET_NOTIFICATIONS,
          methodQuery,
        },
        true,
      );

      if (res.status !== 200 && res.status !== 404) {
        throw new Error('Bad get notification request');
      }

      const {
        data: { response: { metadata = [] } = {} },
      } = res;

      await onMultipleLoadData({
        requestsParamsList: buildRequestList(metadata, '#notification'),
        pipe: true,
      });

      if (visiblePopover && (shouldUpdatePrivate || (type === 'private' && metadata?.length))) {
        const ids = metadata.reduce((idsList, data) => {
          if (!data?.isRead) return [...idsList, data?._id];
          else return idsList;
        }, []);

        const { count = ids?.length } = await this.updateRead(ids);
        if (setCounter) setCounter(-count, 'calc');
      }

      if (!_.isFunction(onSaveComponentState)) {
        return this.setState({ streamList: metadata, isLoading: true });
      }

      const path = type === 'private' ? `${streamModule}#private` : `${streamModule}#notification`;

      await onSaveComponentState({
        [streamStore]:
          type === 'private'
            ? metadata.sort((a, b) => {
                const aDate = moment(a.createdAt).unix();
                const bDate = moment(b.createdAt).unix();
                return bDate - aDate;
              })
            : metadata,
        load: true,
        path,
        shoudParseToUniq: true,
      });

      this.setState({ isLoading: true });
    } catch (error) {
      console.error(error);
    }
  };

  onRunAction = (index) => {
    const { streamList: streamListState = [] } = this.state;
    const {
      setCurrentTab,
      onOpenPageWithData,
      router: { routeData = {}, activeTabs = [] } = {},
      store,
      prefix,
      streamModule,
      streamStore,
      type: typeStream = '',
    } = this.props;

    const nameModuleStream =
      typeStream === 'private' ? `${streamModule}#private` : `${streamModule}#notification`;

    const streamList = store
      ? routeData[nameModuleStream] && routeData[nameModuleStream][streamStore]
        ? routeData[nameModuleStream][streamStore]
        : []
      : streamListState;

    const { action: { type: typeAction = '', link: key = '', moduleName: name = '' } = {}, type = '' } =
      streamList[index] || {};
    const moduleName = `${name}${prefix}`;
    const { config = {} } = this.context;

    const [storeName = '', typeCurrentAction = ''] = typeAction.split('_');

    switch (typeCurrentAction) {
      case 'link': {
        if (config?.tabsLimit <= activeTabs?.length) {
          this.showMessageError();
          return;
        }

        const path = this.getPathLink(moduleName, type);

        const { moduleId = '', page = '' } = routeParser({ path, pageType: 'link' });
        if (!moduleId || !page) return;

        const { [storeName]: data = [] } = routeData[page] || {};
        const tabPage = page.split('#')[0];
        const index = activeTabs.findIndex((tab) => tab.includes(tabPage) && tab.includes(key));
        const isFind = index !== -1;

        if (isFind) return setCurrentTab(activeTabs[index]);

        const item = data.find((it) => it?.key === key || it?._id === key);
        if (!item) {
          message.warning('Страница не найдена.');
          return;
        }

        const activePageParsed = routePathNormalise({
          pathType: 'link',
          pathData: { page, moduleId, key },
        });

        const { path: normalizePath = '' } = activePageParsed || {};

        const pathParsed =
          moduleName === 'news'
            ? normalizePath.replace(`_${type}Notification`, '_informationPage')
            : normalizePath;

        onOpenPageWithData({
          activePage: {
            ...activePageParsed,
            path: pathParsed,
            from: 'link',
          },
          routeDataActive: { ...item },
        });
        break;
      }
      default:
        break;
    }
    return;
  };

  showMessageError = (config) => {
    message.error('Максимальное количество вкладок:' + config?.tabsLimit);
  };

  getPathLink = (moduleName, type) => `${moduleName}_$link$__${type}Notification`;

  /**
   * @param {string} id
   */
  onMouseEnter = (id) => {
    const { idTooltipActive = '' } = this.state;

    if (!idTooltipActive || idTooltipActive === id) {
      this.setState({
        idTooltipActive: id,
      });
    }
  };

  /**
   * @param {string} id
   */
  onMouseLeave = (id) => {
    const { idTooltipActive = '' } = this.state;
    if (idTooltipActive === id)
      this.setState({
        idTooltipActive: null,
      });
  };

  onParserdMessage = (message) => {
    if (!message || (message && !_.isString(message))) {
      return message;
    }

    const messageParts = message
      .split(/\n/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (messageParts.length)
      return messageParts.map((part, i) => (
        <p key={`${part}${i}`} className="messagePart">
          {part}
        </p>
      ));
    else return message;
  };

  render() {
    const {
      mode,
      boxClassName,
      type,
      udata: { _id = '' } = {},
      udata: { avatar: myAvatar = null } = {},
      parentPath,
      parentDataName,
      router: { routeData = {} } = {},
      streamModule,
      streamStore,
      store,
      buildItems,
      listHeight,
      personalUid,
    } = this.props;

    const uid = !personalUid ? _id : personalUid;
    const { streamList: streamListState = [], isLoading = false } = this.state;

    const nameModuleStream = type === 'private' ? `${streamModule}#private` : streamModule;

    const streamList = store
      ? routeData[nameModuleStream] && routeData[nameModuleStream][streamStore]
        ? routeData[nameModuleStream][streamStore]
        : []
      : streamListState;

    if (!type) return null;
    const { [parentPath]: { [parentDataName]: parentDataList = [] } = {} } = routeData || {};

    if (type === 'private' && buildItems) {
      const scrollStyle = { height: listHeight };
      return (
        <Scrollbars hideTracksWhenNotNeeded={true} style={scrollStyle}>
          {streamList && streamList?.length ? (
            buildItems(streamList, this.onRunAction)
          ) : !isLoading ? (
            <Spin className="popover-spiner" size="large" />
          ) : (
            <div className="empty-streamBox">
              <span>Уведомления отсутствуют</span>
            </div>
          )}
        </Scrollbars>
      );
    }

    return (
      <Scrollbars
        hideTracksWhenNotNeeded={true}
        style={mode ? { height: listHeight ? listHeight : 'calc(100% - 100px)' } : null}
      >
        <div className={clsx('streamBox', boxClassName ? boxClassName : null)}>
          {streamList?.length ? (
            streamList.map((card, index) => {
              const {
                uidCreater = '',
                _id = '',
                authorName = '',
                title = '',
                message = '',
                action = {},
              } = card;

              const { link = '' } = action;

              const isMine = uid === uidCreater;
              const avatar = isMine ? myAvatar : parentDataList?.find((it) => it?._id === uidCreater)?.avatar;
              const isWithTooltip = Boolean(link);

              const cardItem = (
                <div
                  key={`cardItem_${_id}`}
                  onMouseEnter={isWithTooltip ? this.onMouseEnter.bind(this, _id) : null}
                  onMouseLeave={isWithTooltip ? this.onMouseLeave.bind(this, _id) : null}
                  onClick={this.onRunAction.bind(this, index)}
                  className={clsx('cardStream', mode ? mode : null, !_.isEmpty(action) ? 'withAction' : null)}
                >
                  <div className="about">
                    <Avatar
                      src={avatar ? `data:image/png;base64,${avatar}` : null}
                      size="default"
                      icon="user"
                    />
                    <p className="name">{authorName}</p>
                  </div>
                  <p className="card_title">{title}</p>
                  <div className="card_message">{this.onParserdMessage(message)}</div>
                </div>
              );

              return isWithTooltip ? (
                <Tooltip
                  key={`cardTooltip_${_id ? _id : Math.random()}`}
                  mouseEnterDelay={0.2}
                  title="Кликните для перехода на страницу уведомления"
                >
                  {cardItem}
                </Tooltip>
              ) : (
                cardItem
              );
            })
          ) : !isLoading ? (
            <Spin size="large" />
          ) : (
            <div className="empty-streamBox">
              <span>Уведомления отсутствуют</span>
            </div>
          )}
        </div>
      </Scrollbars>
    );
  }
}

const mapStateToProps = (state) => {
  const { router = {}, publicReducer: { udata = {} } = {} } = state;
  return { router, udata };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: (tab) => dispatch(addTabAction(tab)),
    setCurrentTab: (tab) => dispatch(setActiveTabAction(tab)),
    onLoadCurrentData: (props) => dispatch(loadCurrentData({ ...props })),
    onMultipleLoadData: (props) => dispatch(multipleLoadData(props)),
    onOpenPageWithData: (data) => dispatch(openPageWithDataAction(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StreamBox);
