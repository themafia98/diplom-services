import React, { useState, useEffect } from 'react';
import userPopupType from './types';
import _ from 'lodash';
import { Avatar } from 'antd';

const UserPopup = ({ udata, goCabinet }) => {
  const [userData, setData] = useState(udata);

  useEffect(() => {
    if (_.isEqual(udata, userData)) return;

    setData((state) => {
      if (state && typeof state === 'object') {
        return {
          ...state,
          ...userData,
        };
      }

      return userData;
    });
  }, [userData, udata]);

  const { avatar = '', displayName = '' } = userData || {};

  return (
    <div className="userPopup">
      <div onClick={goCabinet} className="userPopupMain">
        <Avatar
          src={avatar ? `data:image/png;base64,${avatar}` : null}
          shape="square"
          type="small"
          icon="user"
        />
        <p className="userName_link">{displayName}</p>
      </div>
    </div>
  );
};

UserPopup.propTypes = userPopupType;
UserPopup.defaultProps = {
  goCabinet: null,
  udata: {},
};

export default UserPopup;
