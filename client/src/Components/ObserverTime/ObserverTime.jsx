import React, { useCallback, useMemo } from 'react';
import { observerTimeType } from './ObserverTime.types';
import Scrollbars from 'react-custom-scrollbars';
import _ from 'lodash';
import moment from 'moment';
import Title from 'Components/Title';
import { Timeline, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

const ObserverTime = ({ title, settingsLogs, isLoading }) => {
  const { t } = useTranslation();
  const renderLogs = useCallback((settingsLogs = []) => {
    if (!settingsLogs?.length) return null;

    return settingsLogs.map((log, index) => {
      const { message, date, _id = '' } = log;
      return (
        <Timeline.Item key={index + _id}>
          {message}
          {moment(date).locale(navigator.language).format('LLL')}
        </Timeline.Item>
      );
    });
  }, []);

  const isInvalid = useMemo(() => !isLoading && (!settingsLogs.length || _.isEmpty(settingsLogs)), [
    isLoading,
    settingsLogs,
  ]);

  return (
    <>
      <Title classNameTitle="observerTitle" title={title ? title : t('components_observerTime_historyLog')} />
      <Scrollbars autoHide hideTracksWhenNotNeeded>
        <div className="observerWrapper">
          {isInvalid ? (
            <span className="empty-logger">{t('globalMessages_empty')}</span>
          ) : isLoading ? (
            <Spin size="large" />
          ) : (
            <Timeline>{renderLogs(settingsLogs)}</Timeline>
          )}
        </div>
      </Scrollbars>
    </>
  );
};
ObserverTime.defaultProps = {
  title: '',
  settingsLogs: [],
  isLoading: false,
};
ObserverTime.propTypes = observerTimeType;
export default ObserverTime;
