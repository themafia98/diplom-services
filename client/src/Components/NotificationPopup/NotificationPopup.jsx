import React from 'react';
import { notificationPopupType } from './types';
import _ from 'lodash';
import { Icon, Badge, Popover } from 'antd';
import NotificationItem from './NotificationItem';
import StreamBox from 'Components/StreamBox';
import modelContext from 'Models/context';
import actionsTypes from 'actions.types';
class NotificationPopup extends React.PureComponent {
  state = {
    counter: 0,
    defaultVisible: true,
    isLoadPopover: false,
    isCounter: true,
    visible: false,
  };

  static defaultProps = {
    type: 'private',
    notificationDep: {},
    udata: {},
  };

  static contextType = modelContext;
  static propTypes = notificationPopupType;

  intervalNotif = null;

  componentDidMount = () => {
    const { isCounter } = this.state;
    const { config: { IntervalPrivateNotifications = 10000 } = {} } = this.context;
    if (isCounter) this.fetchNotification();
    this.intervalNotif = setInterval(() => this.fetchNotification(false, true), IntervalPrivateNotifications);
  };

  componentWillUnmount = () => {
    if (this.intervalNotif) {
      clearInterval(this.intervalNotif);
    }
  };

  componentDidUpdate = () => {
    const { isCounter } = this.state;
    if (isCounter) this.fetchNotification();
  };

  getNotifications = async () => {
    try {
      const { Request } = this.context;
      const { notificationDep = {}, udata: { _id: uid } = {}, type } = this.props;
      const { filterStream = '' } = notificationDep;
      const rest = new Request();
      const res = await rest.sendRequest(
        `/system/${type}/notification`,
        'POST',
        {
          actionType: actionsTypes.$GET_NOTIFICATIONS,
          methodQuery: _.isString(filterStream) ? { [filterStream]: uid } : {},
        },
        true,
      );

      if (res.status !== 200 && res.status !== 404) throw new Error('Bad get notification request');

      const {
        data: { response: { metadata = [] } = {} },
      } = res;

      if (metadata && metadata?.length) this.setCounter(metadata.filter((it) => it?.isRead === false).length);
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
    }
  };

  fetchNotification = async (isCounter = false, shoudUpdate = false) => {
    const { notificationDep = {}, udata: { _id: uid } = {} } = this.props;
    const { isLoadPopover = false } = this.state;
    const { filterStream = '' } = notificationDep;

    if (shoudUpdate) return this.getNotifications();

    if (!shoudUpdate && (!filterStream || (isLoadPopover && !isCounter) || !uid)) return;

    this.setState({ ...this.state, isLoadPopover: true, isCounter: false }, this.getNotifications);
  };

  parseContent = (message) => {
    return _.isString(message) ? message : null;
  };

  buildItems = (items, onRunAction) => {
    return items.map((it, index) => {
      const { _id: id = '', authorName = '', message = null } = it || {};

      return (
        <div onClick={onRunAction.bind(this, index)} key={`wrapper${id}`} className="itemWrapper">
          <NotificationItem key={id} authorName={authorName} content={this.parseContent(message)} />
          <hr />
        </div>
      );
    });
  };

  setCounter = (value, mode = '') => {
    const { counter: counterState = 0, isLoadPopover = false } = this.state;

    if (counterState !== value || !isLoadPopover)
      this.setState({
        ...this.state,
        counter: mode === 'calc' ? counterState + value : value,
        isLoadPopover: true,
      });
  };

  onLoadPopover = (event) => {
    this.setState({
      ...this.state,
      isLoadPopover: true,
    });
  };

  onVisibleChange = (visible) => {
    this.setState({
      ...this.state,
      visible,
      isLoadPopover: !visible,
    });
  };

  render() {
    const { notificationDep = {} } = this.props;
    const { counter, visible, isLoadPopover = false } = this.state;
    const content = (
      <div className="notificationContent">
        <StreamBox
          key="private_streamBox"
          type="private"
          prefix="#notification"
          setCounter={this.setCounter}
          visiblePopover={visible}
          isLoadPopover={isLoadPopover}
          onLoadPopover={this.onLoadPopover}
          buildItems={this.buildItems}
          {...notificationDep}
          listHeight="200px"
        />
      </div>
    );

    return (
      <>
        <div className="notificationControllers">
          <Badge className="notificationCounter" count={counter} />
          <Popover
            onVisibleChange={this.onVisibleChange}
            visible={visible}
            className="notificationBox"
            placement="bottom"
            title={
              <div className="headerPopover">
                <span className="title">Уведомления</span>
                {counter ? <span className="counter">{`Непрочитано уведомлений: ${counter}`}</span> : null}
              </div>
            }
            content={content}
            trigger="click"
          >
            <Icon className="alertBell" type="bell" theme="twoTone" />
          </Popover>
        </div>
      </>
    );
  }
}

export default NotificationPopup;
