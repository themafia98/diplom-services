// @ts-nocheck
import React from 'react';
import _ from 'lodash';
import { Avatar } from 'antd';

class UserPopup extends React.PureComponent {
  state = {
    udata: {},
  };

  static getDerivedStateFromProps = (props, state) => {
    if (!_.isEqual(props.udata, state.udata)) {
      return {
        ...state,
        udata: {
          ...state.udata,
          ...props.udata,
        },
      };
    }

    return state;
  };

  render() {
    const { goCabinet } = this.props;
    const {
      udata = {},
      udata: { avatar = '' },
    } = this.state;
    return (
      <div className="userPopup">
        <div onClick={goCabinet} className="userPopupMain">
          <Avatar
            src={avatar ? `data:image/png;base64,${avatar}` : null}
            shape="square"
            type="small"
            icon="user"
          />
          <p className="userName_link">{udata && udata.displayName ? udata.displayName : 'Unknown'}</p>
        </div>
      </div>
    );
  }
}

export default UserPopup;
