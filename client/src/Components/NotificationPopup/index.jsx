import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Icon, Badge, Popover } from 'antd';
import NotificationItem from './NotificationItem';
class NotificationPopup extends React.PureComponent {
  buildItems = items => {
    return items.map((it, i) => {
      return (
        <div key={`wrapper${i}`} className="itemWrapper">
          <NotificationItem
            key={i}
            image={it.image ? it.image : null}
            content={it.content ? it.content : ''}
          />
          <hr />
        </div>
      );
    });
  };

  render() {
    const content = (
      <div className="notificationContent">
        <Scrollbars style={{ height: '200px' }}>
          {this.buildItems([
            { image: true, content: 'Новое сообщение' },
            { image: false, content: 'Изменение в задаче test' },
            { image: false, content: 'Изменение в задаче test2' },
            { image: true, content: 'Новое сообщение 21231231231' },
          ])}
        </Scrollbars>
      </div>
    );
    const counter = 6;
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
