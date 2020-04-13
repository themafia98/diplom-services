import React from 'react';
import Updater from '../../Updater';
import UserPopup from '../../UserPopup';

import NotificationPopup from '../../NotificationPopup';
import Status from './Status';

const RightPanel = props => {
  const { onUpdate, onLogout, goCabinet, status, shouldUpdate, udata = {}, notificationDep = {} } = props;

  return (
    <div className="headerControllers rightPanel">
      <UserPopup udata={udata} goCabinet={goCabinet} />
      <div className="groupControllers">
        <NotificationPopup udata={udata} notificationDep={notificationDep} />
        <Updater onClick={onUpdate} additionalClassName="updaterDefault" />
        <div onClick={onLogout} className="logout">
          Выйти
        </div>
        <Status shouldUpdate={shouldUpdate} statusApp={status} />
      </div>
    </div>
  );
};
export default RightPanel;
