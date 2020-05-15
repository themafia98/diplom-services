//@ts-nocheck
import React from 'react';
import { trackerModalType } from '../types';
import moment from 'moment';
import clsx from 'clsx';
import { Input, DatePicker } from 'antd';
import Textarea from 'Components/Textarea';

const TrackerModal = (props) => {
  const { visible, typeView = '', onChangeTask, error, timeLost, description, descriptionDefault } = props;

  return (
    <>
      {visible && typeView === 'jur' ? (
        <>
          <span>Затраченое время:</span>
          <Input
            onChange={onChangeTask}
            className={clsx('timeLost', error.has('timeLost') ? 'errorFild' : null)}
            value={timeLost}
            type="text"
            size="default"
            placeholder="20m / 1h / 2.5h "
          />
          <span>Дата и время:</span>
          <DatePicker
            onChange={onChangeTask}
            className={clsx('date', error.has('date') ? 'errorFild' : null)}
            format="DD.MM.YYYY HH:mm:ss"
            showTime={{ defaultValue: moment() }}
            defaultValue={moment()}
          />
          <span>Кометарии:</span>
          <Textarea
            key="commentsTextArea"
            onChange={onChangeTask}
            defaultValue={descriptionDefault}
            value={description}
            className={clsx('description', error.has('description') ? 'errorFild' : null)}
            rows={4}
          />
        </>
      ) : null}
    </>
  );
};

TrackerModal.defaultProps = {
  error: null,
  timeLost: '',
  description: '',
  descriptionDefault: '',
};

TrackerModal.propTypes = trackerModalType;

export default TrackerModal;
