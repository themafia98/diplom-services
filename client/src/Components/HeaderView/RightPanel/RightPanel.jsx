// @ts-nocheck
import React from 'react';
import { rightPanelType } from '../types';
import Updater from '../../Updater';
import UserPopup from '../../UserPopup';

import NotificationPopup from '../../NotificationPopup';
import Status from './Status';

const RightPanel = (props) => {
  const { onUpdate, onLogout, goCabinet, status, shouldUpdate, udata, notificationDep } = props;

  return (
    <div className="headerControllers rightPanel">
      <UserPopup statusApp={status} udata={udata} goCabinet={goCabinet} />
      <div className="groupControllers">
        <NotificationPopup statusApp={status} udata={udata} notificationDep={notificationDep} />
        <Updater statusApp={status} onClick={onUpdate} additionalClassName="updaterDefault" />
        <div onClick={onLogout} className="logout">
          Выйти
        </div>
        <Status shouldUpdate={shouldUpdate} statusApp={status} />
      </div>
    </div>
  );
};

RightPanel.defaultProps = {
  onUpdate: null,
  onLogout: null,
  goCabinet: null,
  shouldUpdate: false,
  active: true,
  udata: {},
  notificationDep: {},
  status: '',
};
RightPanel.propTypes = rightPanelType;

export default RightPanel;
