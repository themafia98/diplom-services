import React from 'react';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import { Icon, Badge, Popover, notification } from 'antd';
import NotificationItem from './NotificationItem';
import StreamBox from '../StreamBox';
import modelContext from '../../Models/context';
class NotificationPopup extends React.PureComponent {
  state = {
    counter: 0,
    defaultVisible: true,
    isLoadPopover: false,
    isCounter: true,
    visible: false,
  };

  static contextType = modelContext;

  componentDidMount = () => {
    const { isCounter } = this.state;
    if (isCounter) this.fetchNotification();
  };

  componentDidUpdate = () => {
    const { isCounter } = this.state;
    if (isCounter) this.fetchNotification();
  };

  fetchNotification = async (isCounter = false) => {
    const { Request } = this.context;
    const { notificationDep = {}, udata: { _id: uid } = {}, type = 'private' } = this.props;
    const { isLoadPopover = false } = this.state;
    const { filterStream = '' } = notificationDep;
    const rest = new Request();

    if (!filterStream || (isLoadPopover && !isCounter) || !uid) return;

    this.setState(
      state => {
        return { ...state, isLoadPopover: true, isCounter: false };
      },
      async () => {
        try {
          const res = await rest.sendRequest(`/system/${type}/notification`, 'POST', {
            actionType: 'get_notifications',
            methodQuery: _.isString(filterStream) ? { [filterStream]: uid } : {},
          });

          if (res.status !== 200 && res.status !== 404) throw new Error('Bad get notification request');

          const {
            data: { response: { metadata = [] } = {} },
          } = res;

          if (metadata && metadata?.length)
            this.setCounter(metadata.filter(it => it?.isRead === false).length);
        } catch (error) {
          console.error(error);
        }
      },
    );
  };

  buildItems = items => {
    return items.map(it => {
      const { _id: id = '' } = it;
      return (
        <div key={`wrapper${id}`} className="itemWrapper">
          <NotificationItem key={id} image={it?.image} content={it?.message} />
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

  onLoadPopover = event => {
    this.setState({
      ...this.state,
      isLoadPopover: true,
    });
  };

  onVisibleChange = visible => {
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
      <React.Fragment>
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
                <span className="counter">{`Непрочитано уведомлений: ${counter}`}</span>
              </div>
            }
            content={content}
            trigger="click"
          >
            <Icon className="alertBell" type="bell" theme="twoTone" />
          </Popover>
        </div>
      </React.Fragment>
    );
  }
}

export default NotificationPopup;
