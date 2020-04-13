import React from 'react';
import { connect } from 'react-redux';
import { loadCurrentData, multipleLoadData } from '../../Redux/actions/routerActions/middleware';
import { addTabAction, openPageWithDataAction, setActiveTabAction } from '../../Redux/actions/routerActions';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Avatar, notification, message, Tooltip, Spin } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import clsx from 'clsx';
import { routeParser, routePathNormalise, buildRequestList } from '../../Utils';
import modelContext from '../../Models/context';

class StreamBox extends React.Component {
  state = {
    type: null,
    streamList: [],
  };

  static propTypes = {
    mode: PropTypes.string,
    boxClassName: PropTypes.string,
  };

  static contextType = modelContext;

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
    const { Request } = this.context;
    const {
      type = '',
      onMultipleLoadData,
      isSingleLoading = false,
      onSaveComponentState,
      streamStore,
      streamModule,
    } = this.props;

    if (!type) return;

    const onLoadingStreamList = async () => {
      const { filterStream = '', udata: { _id: uid = '' } = {} } = this.props;
      try {
        const rest = new Request();
        const res = await rest.sendRequest(`/system/${type}/notification`, 'POST', {
          actionType: 'get_notifications',
          methodQuery: filterStream ? { [filterStream]: uid } : {},
        });

        if (res.status !== 200) throw new Error('Bad get notification request');

        const {
          data: { response: { metadata = [] } = {} },
        } = res;

        if (metadata && !metadata.length) {
          return this.setState({
            isLoading: true,
          });
        }

        onMultipleLoadData({
          requestsParamsList: buildRequestList(metadata),
          pipe: true,
        });

        if (!_.isFunction(onSaveComponentState)) this.setState({ streamList: metadata });
        else
          onSaveComponentState({
            [streamStore]: metadata,
            load: true,
            path: streamModule,
            mode: 'online',
          });
      } catch (error) {
        console.error(error);
        notification.error({
          message: 'Stream error',
          description: 'Bad request',
        });
      }
    };

    await onLoadingStreamList();
    if (!isSingleLoading) this.onLoadingInterval = setInterval(onLoadingStreamList, 30000);
  };

  componentWillUnmount = () => {
    if (this.onLoadingInterval) {
      clearInterval(this.onLoadingInterval);
    }
  };

  onRunAction = index => {
    const { streamList } = this.state;
    const {
      addTab,
      setCurrentTab,
      onOpenPageWithData,
      router: { routeData = {}, actionTabs = [] } = {},
    } = this.props;

    const { action: { type: typeAction = '', link: key = '', moduleName = '' } = {}, type = '' } =
      streamList[index] || {};
    const { config = {} } = this.context;

    const [storeName = '', typeCurrentAction = ''] = typeAction.split('_');

    switch (typeCurrentAction) {
      case 'link': {
        if (config?.tabsLimit <= actionTabs?.length)
          return message.error(`Максимальное количество вкладок: ${config?.tabsLimit}`);

        const path = `${moduleName}_${type}Notification`;

        const { moduleId = '', page = '' } = routeParser({ path });
        if (!moduleId || !page) return;

        const { [storeName]: data = [] } = routeData[page] || {};
        const index = actionTabs.findIndex(tab => tab.includes(page) && tab.includes(key));
        const isFind = index !== -1;

        if (isFind) return setCurrentTab(actionTabs[index]);

        const item = data.find(it => it?.key === key || it?._id === key);
        if (!item) {
          message.warning('Страница не найдена.');
          return;
        }

        const activePageParsed = routePathNormalise({
          pathType: 'moduleItem',
          pathData: { page, moduleId, key },
        });

        const pathParsed =
          moduleName == 'news'
            ? activePageParsed?.path.replace(`_${type}Notification`, '_informationPage')
            : activePageParsed?.path.replace(`_${type}Notification`, '');

        onOpenPageWithData({
          activePage: {
            ...activePageParsed,
            path: pathParsed + '___link',
          },
          routeDataActive: { ...item },
        });
      }
      default: {
        return;
      }
    }
  };

  /**
   * @param {string} id
   */
  onMouseEnter = id => {
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
  onMouseLeave = id => {
    const { idTooltipActive = '' } = this.state;
    if (idTooltipActive === id)
      this.setState({
        idTooltipActive: null,
      });
  };

  render() {
    const {
      mode,
      boxClassName,
      type,
      udata: { _id: uid = '' } = {},
      udata: { avatar: myAvatar = null } = {},
      parentPath = '',
      parentDataName = '',
      router: { routeData = {} } = {},
      streamModule = '',
      streamStore = '',
      store = null,
    } = this.props;
    const { streamList: streamListState = [], isLoading = false } = this.state;

    const streamList = store
      ? routeData[streamModule] && routeData[streamModule][streamStore]
        ? routeData[streamModule][streamStore]
        : []
      : streamListState;

    if (!type) return null;
    const { [parentPath]: { [parentDataName]: parentDataList = [] } = {} } = routeData || {};

    return (
      <Scrollbars style={mode ? { height: 'calc(100% - 100px)' } : null}>
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
              const key = _id ? _id : index;
              const { type = '', link = '' } = action;

              const isMine = uid === uidCreater;
              const avatar = isMine ? myAvatar : parentDataList?.find(it => it?._id === uidCreater)?.avatar;
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
                    <Avatar src={`data:image/png;base64,${avatar}`} size="default" icon="user" />
                    <p className="name">{authorName}</p>
                  </div>
                  <p className="card_title">{title}</p>
                  <p className="card_message">{message}</p>
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

const mapStateToProps = state => {
  const { router = {}, publicReducer: { udata = {} } = {} } = state;
  return { router, udata };
};

const mapDispatchToProps = dispatch => {
  return {
    addTab: tab => dispatch(addTabAction(tab)),
    setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
    onLoadCurrentData: props => dispatch(loadCurrentData({ ...props })),
    onMultipleLoadData: props => dispatch(multipleLoadData(props)),
    onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StreamBox);
