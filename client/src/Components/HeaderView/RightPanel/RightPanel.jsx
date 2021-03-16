import React from 'react';
import Updater from 'Components/Updater';
import UserPopup from 'Components/UserPopup';
import NotificationPopup from 'Components/NotificationPopup';
import Status from './Status';
import { rightPanelType } from '../HeaderView.types';
import { useTranslation } from 'react-i18next';

const RightPanel = ({
  onUpdate,
  onLogout,
  goCabinet,
  status,
  shouldUpdate,
  notificationDep,
  appConfig,
  webSocket,
}) => {
  const { t } = useTranslation();

  return (
    <div className="headerControllers rightPanel">
      <UserPopup statusApp={status} goCabinet={goCabinet} />
      <div className="groupControllers">
        <NotificationPopup
          appConfig={appConfig}
          statusApp={status}
          notificationDep={notificationDep}
          webSocket={webSocket}
        />
        <Updater statusApp={status} onClick={onUpdate} additionalClassName="updaterDefault" />
        <div onClick={onLogout} className="logout">
          {t('components_rightPanel_logout')}
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
  notificationDep: {},
  appConfig: {},
  status: '',
};
RightPanel.propTypes = rightPanelType;

export default RightPanel;
