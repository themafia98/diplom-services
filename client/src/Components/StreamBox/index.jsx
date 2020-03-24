import React from 'react';
import { connect } from 'react-redux';
import { addTabAction, openPageWithDataAction, setActiveTabAction } from '../../Redux/actions/routerActions';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Avatar, notification, message, Tooltip } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import clsx from 'clsx';
import { routeParser, routePathNormalise } from '../../Utils';
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
    const { type = '' } = this.props;

    if (!type) return;

    const onLoadingStreamList = async () => {
      try {
        const rest = new Request();
        const res = await rest.sendRequest(`/system/${type}/notification`, 'POST', {
          actionType: 'get_notifications',
        });

        if (res.status !== 200) throw new Error('Bad get notification request');

        const {
          data: { response: { metadata = [] } = {} },
        } = res;

        this.setState({
          streamList: metadata,
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
    this.onLoadingInterval = setInterval(onLoadingStreamList, 30000);
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

    const { action: { type = '', link: key = '' } = {} } = streamList[index] || {};
    const { config = {} } = this.context;

    switch (type) {
      case 'task_link': {
        if (config?.tabsLimit <= actionTabs?.length)
          return message.error(`Максимальное количество вкладок: ${config?.tabsLimit}`);

        const path = 'taskModule_globalNotification';
        const { moduleId = '', page = '' } = routeParser({ path });
        if (!moduleId || !page) return;
        const { tasks = [] } = routeData['taskModule'] || {};
        const index = actionTabs.findIndex(tab => tab.includes(page) && tab.includes(key));
        const isFind = index !== -1;

        if (isFind) return setCurrentTab(actionTabs[index]);

        const item = tasks.find(it => it?.key === key);
        if (!item) {
          message.warning('Страница не найдена.');
          return;
        }

        onOpenPageWithData({
          // @ts-ignore
          activePage: routePathNormalise({
            pathType: 'moduleItem',
            pathData: { page, moduleId, key },
          }),
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
    const { mode, boxClassName, type, value = '' } = this.props;
    const { streamList = [] } = this.state;
    if (!type || !streamList?.length) return null;

    return (
      <Scrollbars style={mode ? { height: 'calc(100% - 100px)' } : null}>
        <div className={clsx('streamBox', boxClassName ? boxClassName : null)}>
          {streamList.map((card, index) => {
            const { _id = '', authorName = '', title = '', message = '', action = {} } = card;
            const key = _id ? _id : index;
            const { type = '', link = '' } = action;

            const isWithTooltip = type.includes('link') && link;

            const cardItem = (
              <div
                key={`cardItem_${_id}`}
                onMouseEnter={isWithTooltip ? this.onMouseEnter.bind(this, _id) : null}
                onMouseLeave={isWithTooltip ? this.onMouseLeave.bind(this, _id) : null}
                onClick={this.onRunAction.bind(this, index)}
                key={key}
                className={clsx('cardStream', mode ? mode : null, !_.isEmpty(action) ? 'withAction' : null)}
              >
                <div className="about">
                  <Avatar size="64" icon="user" />
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
          })}
        </div>
      </Scrollbars>
    );
  }
}

const mapStateToProps = state => {
  const { router = {} } = state;
  return { router };
};

const mapDispatchToProps = dispatch => {
  return {
    addTab: tab => dispatch(addTabAction(tab)),
    setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
    onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StreamBox);
