import React from 'react';
import { observerTimeType } from './types';
import Scrollbars from 'react-custom-scrollbars';
import _ from 'lodash';
import moment from 'moment';
import TitleModule from 'Components/TitleModule';
import { Timeline, Spin } from 'antd';

const ObserverTime = (props) => {
  const { title, settingsLogs, isLoading } = props;

  const renderLogs = (settingsLogs = []) => {
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
  };

  const isInvalid = !isLoading && (!settingsLogs.length || _.isEmpty(settingsLogs));

  return (
    <>
      <TitleModule classNameTitle="observerTitle" title={title ? title : 'История изменений'} />
      <Scrollbars hideTracksWhenNotNeeded={true}>
        <div className="observerWrapper">
          {isInvalid ? (
            <span className="empty-logger">Истории пока нет</span>
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
