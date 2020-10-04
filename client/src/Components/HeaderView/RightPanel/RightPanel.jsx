import React from 'react';
import Updater from 'Components/Updater';
import UserPopup from 'Components/UserPopup';

import NotificationPopup from 'Components/NotificationPopup';
import Status from './Status';
import { rightPanelType } from '../HeaderView.types';

const RightPanel = ({
  onUpdate,
  onLogout,
  goCabinet,
  status,
  shouldUpdate,
  udata,
  notificationDep,
  appConfig,
  webSocket,
}) => (
  <div className="headerControllers rightPanel">
    <UserPopup statusApp={status} udata={udata} goCabinet={goCabinet} />
    <div className="groupControllers">
      <NotificationPopup
        appConfig={appConfig}
        statusApp={status}
        udata={udata}
        notificationDep={notificationDep}
        webSocket={webSocket}
      />
      <Updater statusApp={status} onClick={onUpdate} additionalClassName="updaterDefault" />
      <div onClick={onLogout} className="logout">
        Выйти
      </div>
      <Status shouldUpdate={shouldUpdate} statusApp={status} />
    </div>
  </div>
);

RightPanel.defaultProps = {
  onUpdate: null,
  onLogout: null,
  goCabinet: null,
  shouldUpdate: false,
  active: true,
  udata: {},
  notificationDep: {},
  appConfig: {},
  status: '',
};
RightPanel.propTypes = rightPanelType;

export default RightPanel;
