import React from 'react';
import { observerTimeType } from './types';
import Scrollbars from 'react-custom-scrollbars';
import _ from 'lodash';
import moment from 'moment';
import TitleModule from '../TitleModule';
import { Timeline, Spin } from 'antd';

const ObserverTime = props => {
  const { title = '', settingsLogs = [], isLoading = false } = props;

  const renderLogs = (settingsLogs = []) => {
    if (!settingsLogs || _.isEmpty(settingsLogs)) return null;

    return settingsLogs.map((log, index) => {
      const { message, date, _id = '' } = log;
      return (
        <Timeline.Item key={index + _id}>
          {message}
          {moment(date)
            .locale(navigator.language)
            .format('LLL')}
        </Timeline.Item>
      );
    });
  };

  const isInvalid = !isLoading && (!settingsLogs.length || _.isEmpty(settingsLogs));

  return (
    <React.Fragment>
      <TitleModule classNameTitle="observerTitle" title={title ? title : 'История изменений'} />
      <Scrollbars>
        <div className="observerWrapper">
          {isInvalid ? null : isLoading ? (
            <Spin size="large" />
          ) : (
            <Timeline>{renderLogs(settingsLogs)}</Timeline>
          )}
        </div>
      </Scrollbars>
    </React.Fragment>
  );
};
ObserverTime.defaultProps = {
  title: '',
};
ObserverTime.propTypes = observerTimeType;
export default ObserverTime;
