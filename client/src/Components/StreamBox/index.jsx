import React from 'react';
import PropTypes from 'prop-types';
import { Avatar } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import clsx from 'clsx';
class StreamBox extends React.Component {
  render() {
    const { mode, boxClassName } = this.props;
    let value = `
        Hello world!!!
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        Hello world!!!
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        Hello world!!!
        My name Pavel Petrovich and I'm Frontend developer. I looking for job.
        Hello world!!!`;
    return (
      <Scrollbars style={mode ? { height: 'calc(100% - 100px)' } : null}>
        <div className={clsx('streamBox', boxClassName ? boxClassName : null)}>
          <div className={clsx('cardStream', mode ? mode : null)}>
            <div className="about">
              <Avatar size="64" icon="user" />
              <p className="name">Pavel Petrovich</p>
            </div>
            <p className="card_message">{value}</p>
          </div>
          <div className={clsx('cardStream', mode ? mode : null)}>
            <div className="about">
              <Avatar size="64" icon="user" />
              <p className="name">Pavel Petrovich</p>
            </div>
            <p className="card_message">{value}</p>
          </div>
          <div className={clsx('cardStream', mode ? mode : null)}>
            <div className="about">
              <Avatar size="64" icon="user" />
              <p className="name">Pavel Petrovich</p>
            </div>
            <p className="card_message">{value}</p>
          </div>
          <div className={clsx('cardStream', mode ? mode : null)}>
            <div className="about">
              <Avatar size="64" icon="user" />
              <p className="name">Pavel Petrovich</p>
            </div>
            <p className="card_message">{value}</p>
          </div>
        </div>
      </Scrollbars>
    );
  }
}

StreamBox.propTypes = {
  mode: PropTypes.string,
  boxClassName: PropTypes.string,
};

export default StreamBox;
