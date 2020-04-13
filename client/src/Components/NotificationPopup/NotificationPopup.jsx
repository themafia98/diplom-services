import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Icon, Badge, Popover, notification } from 'antd';
import NotificationItem from './NotificationItem';
import StreamBox from '../StreamBox';
import modelContext from '../../Models/context';
class NotificationPopup extends React.PureComponent {
  state = {
    counter: 0,
    defaultVisible: true,
  };

  static contextType = modelContext;

  componentDidMount = async () => {
    const { Request } = this.context;
    const {
      notificationDep = {},
      udata: { _id: uid },
      type = 'private',
    } = this.props;
    const { filterStream = '' } = notificationDep;
    const rest = new Request();

    try {
      const res = await rest.sendRequest(`/system/${type}/notification`, 'POST', {
        actionType: 'get_notifications',
        methodQuery: filterStream ? { [filterStream]: uid } : {},
      });

      if (res.status !== 200) throw new Error('Bad get notification request');

      const {
        data: { response: { metadata = [] } = {} },
      } = res;

      if (metadata && metadata?.length) this.setCounter(metadata.length);
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Stream error',
        description: 'Bad request',
      });
    }
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

  setCounter = value => {
    this.setState({
      ...this.state,
      counter: value,
    });
  };

  render() {
    const { notificationDep = {} } = this.props;
    const { counter } = this.state;
    const content = (
      <div className="notificationContent">
        <StreamBox
          type="private"
          setCounter={this.setCounter}
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
