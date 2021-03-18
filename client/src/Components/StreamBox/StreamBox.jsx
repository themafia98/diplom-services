import React, { Component, createRef } from 'react';
import { streamBoxType } from './StreamBox.types';
import { connect } from 'react-redux';
import moment from 'moment';
import { openTab } from 'Redux/middleware/routerReducer.thunk';
import _ from 'lodash';
import { Avatar, message, Tooltip, Spin, Button } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import clsx from 'clsx';
import { parseArrayByLimit } from 'Utils';
import ModelContext from 'Models/context';
import actionsTypes from 'actions.types';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';
import { paramsTemplate, requestTemplate } from 'Utils/Api/api.utils';
import { withTranslation } from 'react-i18next';
import { refreshRouterData } from 'Redux/reducers/routerReducer.slice';

class StreamBox extends Component {
  state = {
    showLoader: false,
    type: null,
    streamList: [],
    listLimit: null,
    visibleItemIndex: 0,
    count: 0,
  };

  scrollRef = createRef();
  streamListRef = createRef();

  static propTypes = streamBoxType;
  static contextType = ModelContext;
  static defaultProps = {
    type: null,
    setCounter: null,
    onLoadPopover: null,
    personalUid: null,
    buildItems: null,
    listHeight: null,
    isSingleLoading: false,
    visiblePopover: false,
    isLoadPopover: false,
    mode: '',
    filterStream: '',
    streamStore: '',
    streamModule: '',
    prefix: '',
    boxClassName: '',
    parentPath: '',
  };

  static getDerivedStateFromProps = (props, state) => {
    const { countItems = null } = props;

    const shouldBeSetCount = countItems !== null && countItems !== state.count;
    const shouldBeSetType = state.type === null && props.type;

    if (!(shouldBeSetCount && shouldBeSetType)) {
      return state;
    }

    const newState = {
      ...state,
    };

    if (countItems !== null && countItems !== state.count) {
      newState.count = countItems;
    }

    if (state.type === null && props.type) {
      newState.type = props.type;
    }

    return newState;
  };

  onLoadingInterval = null;

  componentDidMount = async () => {
    const { listLimit } = this.state;
    const { type, isSingleLoading, setCounter, visiblePopover, isLoadPopover, appConfig = {} } = this.props;
    const shouldUpdatePrivate = setCounter && visiblePopover && !isLoadPopover;
    const { intervalNotification = 30000, streamLimit } = appConfig;

    if (!type) return;

    if (streamLimit && listLimit === null && listLimit !== streamLimit) {
      this.setState({ listLimit: streamLimit });
    }

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
    const { type, filterStream, udata } = this.props;
    const { _id: uid } = udata;

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
          ...requestTemplate,
          moduleName: 'system',
          actionType: actionsTypes.$GET_NOTIFICATIONS,
          params: {
            options: { ids, updateProps: { isRead: true } },
          },
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

  getNormalizeUidNotification = () => {
    const { udata, personalUid } = this.props;
    const { _id } = udata;

    return !personalUid ? _id : personalUid;
  };

  fetchNotification = async (showLoader) => {
    try {
      const { listLimit, showLoader: showLoaderState = false } = this.state;
      const { Request } = this.context;
      const {
        type = '',
        onRefreshRouterData,
        streamStore,
        filterStream,
        setCounter,
        visiblePopover,
        isLoadPopover,
        onLoadPopover,
        appConfig: { streamLimit } = {},
      } = this.props;

      const uid = this.getNormalizeUidNotification();

      const shouldUpdatePrivate = setCounter && visiblePopover && !isLoadPopover;

      const ids = filterStream && uid ? { [filterStream]: uid } : {};
      if (type.includes('private') && _.isEmpty(ids)) return;

      if (shouldUpdatePrivate && onLoadPopover) {
        onLoadPopover();
      }

      if (showLoaderState) return;

      if (showLoader)
        this.setState({ showLoader: true }, () => {
          const { current: scrollbar } = this.scrollRef;
          if (scrollbar) scrollbar.scrollToBottom();
        });

      const rest = new Request();
      const res = await rest.sendRequest(
        `/system/${type}/notification`,
        'POST',
        {
          ...requestTemplate,
          moduleName: 'system',
          actionType: actionsTypes.$GET_NOTIFICATIONS,
          params: {
            ...paramsTemplate,
            options: {
              ids,
              limitList: listLimit ?? streamLimit,
            },
          },
        },
        true,
      );

      if (res.status !== 200 && res.status !== 404) {
        throw new Error('Bad get notification request');
      }

      const { response = {} } = res.data;
      const { metadata: draftMetadata = [], metadata: meta = {} } = response;
      const { count: total = null } = meta;

      const metadata = Array.isArray(draftMetadata) ? draftMetadata : draftMetadata?.result;

      if (visiblePopover && (shouldUpdatePrivate || (type === 'private' && metadata?.length))) {
        const ids = metadata.reduce((idsList, data) => {
          if (!data?.isRead) return [...idsList, data?._id];
          else return idsList;
        }, []);

        const { count = ids?.length } = await this.updateRead(ids);
        if (setCounter) setCounter(-count, 'calc');
      }

      if (typeof onRefreshRouterData !== 'function') {
        return this.setState({ streamList: metadata, isLoading: true, showLoader: false });
      }

      const pathNotification = this.getNotificationPath(uid);

      let metaSorted = metadata;

      if (type === 'private') {
        metaSorted = metadata.sort((a, b) => {
          const aDate = moment(a.createdAt).unix();
          const bDate = moment(b.createdAt).unix();
          return bDate - aDate;
        });
      }

      await onRefreshRouterData({
        [streamStore]: metaSorted,
        load: true,
        path: pathNotification,
        shoudParseToUniq: true,
      });

      this.setState({ isLoading: true, count: total, showLoader: false });
    } catch (error) {
      console.error(error);
      this.setState({ isLoading: true, showLoader: false });
    }
  };

  onRunAction = (actionIndex) => {
    const { streamList: streamListState = [] } = this.state;
    const { routeData, withStore, prefix, streamStore, onOpenTab } = this.props;

    const nameModuleStream = this.getNotificationPath(this.getNormalizeUidNotification());

    const streamList = withStore
      ? routeData[nameModuleStream] && routeData[nameModuleStream][streamStore]
        ? routeData[nameModuleStream][streamStore]
        : []
      : streamListState;

    const { action = {}, type = '' } = streamList[actionIndex] || {};
    const { type: typeAction = '', link: actionLink = '', moduleName: name = '' } = action;

    const moduleName = `${name}${prefix}`;
    const [, typeCurrentAction = ''] = typeAction.split('_');
    const pathLink = this.getPathLink(moduleName, type);

    onOpenTab({ uuid: actionLink, action: pathLink, data: {}, openType: typeCurrentAction });
  };

  showMessageError = ({ tabsLimit }) => {
    const { t } = this.props;
    message.error(`${t('globalMessages_maxTabs')}:` + tabsLimit);
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
    if (!message || (message && typeof message !== 'string')) {
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

  getNotificationPath = (uid = '') => {
    const { prefix, streamModule, type } = this.props;
    return `${streamModule}${type !== 'global' ? `#${type}` : prefix}${uid ? uid : ''}`.trim();
  };

  onLoadItemsList = () => {
    const { appConfig: { streamLimit } = {} } = this.props;
    const currentScrollTop = this.scrollRef?.current?.getScrollTop();

    this.setState(
      (state) => {
        return {
          listLimit: streamLimit + state.listLimit,
        };
      },
      async () => {
        const { current: scrollbar } = this.scrollRef;
        try {
          await this.fetchNotification(true);
          if (currentScrollTop) scrollbar.scrollTop(currentScrollTop);
        } catch (error) {
          console.error(error);
        }
      },
    );
  };

  render() {
    const {
      mode,
      boxClassName,
      type,
      udata,
      parentPath,
      parentDataName,
      routeData,
      streamStore,
      withStore,
      buildItems,
      listHeight,
      t,
    } = this.props;

    const { avatar: myAvatar = null } = udata;

    const {
      streamList: streamListState = [],
      isLoading = false,
      visibleItemIndex,
      listLimit,
      count,
      showLoader,
    } = this.state;

    const uid = this.getNormalizeUidNotification();
    let nameModuleStream = this.getNotificationPath(uid);

    /** TODO: removed when will be implemented backend (loading Listlimit) */
    const _streamList = withStore
      ? routeData[nameModuleStream] && routeData[nameModuleStream][streamStore]
        ? routeData[nameModuleStream][streamStore]
        : []
      : streamListState;

    const streamList = parseArrayByLimit(_streamList, {
      listLimit,
      visibleItemIndex,
    });

    const totalVisible = typeof listLimit === 'number' ? visibleItemIndex + listLimit : 0;
    const shouldShowLoadingButton = streamList?.length && totalVisible < count;

    if (!type) return null;
    const { [parentPath]: { [parentDataName]: parentDataList = [] } = {} } = routeData || {};

    if (type === 'private' && buildItems) {
      const scrollStyle = { height: listHeight };
      return (
        <Scrollbars ref={this.scrollRef} autoHide hideTracksWhenNotNeeded style={scrollStyle}>
          {streamList && streamList?.length ? (
            <div className="notification-content-wrapper">
              {buildItems(streamList, this.onRunAction)}
              {shouldShowLoadingButton ? (
                <Button className="private-loadAction" onClick={this.onLoadItemsList}>
                  {t('components_stream_loadMoreButton')}
                </Button>
              ) : null}
            </div>
          ) : !isLoading ? (
            <Spin className="popover-spiner" size="large" />
          ) : (
            <div className="empty-streamBox">
              <span>{t('components_stream_noNotifications')}</span>
            </div>
          )}
        </Scrollbars>
      );
    }

    return (
      <Scrollbars
        ref={this.scrollRef}
        hideTracksWhenNotNeeded
        autoHide
        style={
          mode
            ? {
                height: listHeight ? listHeight : 'calc(100% - 100px)',
              }
            : {
                height: 'calc(100% - 20px)',
              }
        }
      >
        <div ref={this.streamListRef} className={clsx('streamBox', boxClassName ? boxClassName : null)}>
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
                  title={t('components_stream_notificationLinkTooltip')}
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
              <span>{t('components_stream_noNotifications')}</span>
            </div>
          )}
          {shouldShowLoadingButton ? (
            <Button onClick={this.onLoadItemsList}>{t('components_stream_loadMoreButton')}</Button>
          ) : null}
          {showLoader ? <Spin className="popover-spiner-preloader" /> : null}
        </div>
      </Scrollbars>
    );
  }
}

const mapStateToProps = (state) => {
  const { router, publicReducer } = state;
  const { udata, appConfig } = publicReducer;
  const { routeData } = router;

  return { routeData, udata, appConfig };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onOpenTab: (params) => dispatch(openTab(params)),
    onRefreshRouterData: (data) => dispatch(refreshRouterData(data)),
  };
};

export default compose(
  withClientDb,
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(StreamBox);
