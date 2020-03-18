import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Avatar, notification, message } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import clsx from 'clsx';

import modelContext from '../../Models/context';

class StreamBox extends React.Component {
  state = {
    type: null,
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

  componentDidMount = () => {
    const { Request } = this.context;
    const { type = '' } = this.props;

    if (!type) return;

    try {
      const res = new Request();

      res.sendRequest(`/system/${type}/notification`, 'POST', {
        actionType: 'get_notifications',
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: 'Stream error',
        description: 'Bad request',
      });
    }
  };

  render() {
    const { mode, boxClassName, type } = this.props;

    if (!type) return null;

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

const mapStateToProps = state => {};

const mapDispatchToProps = dispatch => {};

export default connect(mapStateToProps, mapDispatchToProps)(StreamBox);
