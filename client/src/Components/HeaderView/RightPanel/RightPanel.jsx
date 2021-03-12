import React, { useState } from 'react';
import Updater from 'Components/Updater';
import UserPopup from 'Components/UserPopup';
import NotificationPopup from 'Components/NotificationPopup';
import Status from './Status';
import { rightPanelType } from '../HeaderView.types';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

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
}) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setLanguage] = useState(i18n.language);

  const changeLanguage = () => {
    const nextHardCodeLang = i18n.language === 'ru' ? 'en' : 'ru';
    setLanguage(nextHardCodeLang);
    i18n.changeLanguage(nextHardCodeLang);
  };

  return (
    <div className="headerControllers rightPanel">
      <Button className="rightPanel__changeLangButton" onClick={changeLanguage}>
        {currentLanguage}
      </Button>
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
  udata: {},
  notificationDep: {},
  appConfig: {},
  status: '',
};
RightPanel.propTypes = rightPanelType;

export default RightPanel;
