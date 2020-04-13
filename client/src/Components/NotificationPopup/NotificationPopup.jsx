import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Icon, Badge, Popover } from 'antd';
import NotificationItem from './NotificationItem';
import StreamBox from '../StreamBox';
class NotificationPopup extends React.PureComponent {
  state = {
    counter: 0,
  };

  componentDidMount = () => {};

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
          setCounter={this.setCounter}
          type="private"
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
