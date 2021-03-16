import React, { useState, useEffect, useMemo } from 'react';
import userPopupType from './UserPopup.types';
import _ from 'lodash';
import { Avatar } from 'antd';
import { useSelector } from 'react-redux';

const UserPopup = ({ goCabinet }) => {
  const udata = useSelector(({ publicReducer }) => publicReducer.udata);

  const [userData, setData] = useState(udata);
  const { avatar, displayName } = userData || {};

  useEffect(() => {
    if (_.isEqual(udata, userData) || !userData) return;

    setData((state) => {
      if (state && typeof state === 'object') {
        return {
          ...state,
          ...udata,
          ...userData,
        };
      }

      return userData;
    });
  }, [userData, udata]);

  const avatarUrl = useMemo(() => (avatar ? `data:image/png;base64,${avatar}` : null), [avatar]);

  return (
    <div className="userPopup">
      <div onClick={goCabinet} className="userPopupMain">
        <Avatar src={avatarUrl} shape="square" type="small" icon="user" />
        <p className="userName_link">{displayName}</p>
      </div>
    </div>
  );
};

UserPopup.propTypes = userPopupType;
UserPopup.defaultProps = {
  goCabinet: null,
};

export default UserPopup;
