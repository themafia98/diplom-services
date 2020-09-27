import React, { memo, useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { notificationPopupType } from './NotificationPopup.types';
import { Icon, Badge, Popover } from 'antd';
import NotificationItem from './NotificationItem';
import StreamBox from 'Components/StreamBox';
import ModelContext from 'Models/context';
import actionsTypes from 'actions.types';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';

const NotificationPopup = memo(({ appConfig, notificationDep, udata, type }) => {
  const { _id: uid } = udata;
  const { IntervalPrivateNotifications = 10000 } = appConfig;

  const [counter, setCounter] = useState(0);
  const [isLoadPopover, setLoadPopover] = useState(false);
  const [isCounter, setIsCounter] = useState(true);
  const [visible, setVisible] = useState(false);

  const context = useContext(ModelContext);
  const intervalNotif = useRef(null);

  const changeCounter = useCallback(
    (value, mode = '') => {
      if (counter !== value || !isLoadPopover) {
        setCounter(mode === 'calc' ? counter + value : value);
        setLoadPopover(true);
      }
    },
    [counter, isLoadPopover],
  );

  const getNotifications = useCallback(async () => {
    try {
      const { Request } = context;
      const { filterStream = '' } = notificationDep;

      const rest = new Request();
      const res = await rest.sendRequest(
        `/system/${type}/notification`,
        'POST',
        {
          ...requestTemplate,
          moduleName: 'system',
          actionType: actionsTypes.$GET_NOTIFICATIONS,
          params: {
            ...paramsTemplate,
            options: {
              ids: typeof filterStream === 'string' ? { [filterStream]: uid } : {},
            },
          },
        },
        true,
      );

      if (res.status !== 200 && res.status !== 404) throw new Error('Bad get notification request');

      const {
        data: { response: { metadata = [] } = {} },
      } = res;

      if (metadata && metadata?.length) changeCounter(metadata.filter((it) => it?.isRead === false).length);
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
    }
  }, [changeCounter, context, notificationDep, type, uid]);

  const fetchNotification = useCallback(
    async (isCounter = false, shoudUpdate = false) => {
      const { filterStream = '' } = notificationDep;

      if (shoudUpdate) return getNotifications();

      if (!shoudUpdate && (!filterStream || (isLoadPopover && !isCounter) || !uid)) return;

      setIsCounter(false);
      setLoadPopover(true);

      getNotifications();
    },
    [getNotifications, isLoadPopover, notificationDep, uid],
  );

  useEffect(() => {
    if (isCounter) fetchNotification();

    intervalNotif.current = setInterval(() => fetchNotification(false, true), IntervalPrivateNotifications);

    return () => intervalNotif?.current && clearInterval(intervalNotif.current);
  }, [IntervalPrivateNotifications, fetchNotification, isCounter]);

  const onLoadPopover = (event) => {
    setLoadPopover(true);
  };

  const onVisibleChange = (visible) => {
    setVisible(visible);
    setLoadPopover(!visible);
  };

  const parseContent = useCallback((message) => (typeof message === 'string' ? message : null), []);

  const buildItems = useCallback(
    (items, onRunAction) =>
      items.map((it, index) => {
        const { _id: id = '', authorName = '', message = null } = it || {};

        return (
          <div onClick={onRunAction.bind(this, index)} key={`wrapper${id}`} className="itemWrapper">
            <NotificationItem key={id} authorName={authorName} content={parseContent(message)} />
            <hr />
          </div>
        );
      }),
    [parseContent],
  );

  const content = useMemo(
    () => (
      <div className="notificationContent">
        <StreamBox
          key="private_streamBox"
          type="private"
          withStore={true}
          prefix="#notification"
          setCounter={changeCounter}
          visiblePopover={visible}
          isLoadPopover={isLoadPopover}
          onLoadPopover={onLoadPopover}
          buildItems={buildItems}
          {...notificationDep}
          listHeight="200px"
        />
      </div>
    ),
    [buildItems, changeCounter, isLoadPopover, notificationDep, visible],
  );

  return (
    <>
      <div className="notificationControllers">
        <Badge className="notificationCounter" count={counter} />
        <Popover
          onVisibleChange={onVisibleChange}
          visible={visible}
          className="notificationBox"
          placement="bottom"
          title={
            <div className="headerPopover">
              <span className="title">Уведомления</span>
              {counter ? <span className="counter">{`Непрочитано уведомлений: ${counter}`}</span> : null}
            </div>
          }
          content={content}
          trigger="click"
        >
          <Icon className="alertBell" type="bell" theme="twoTone" />
        </Popover>
      </div>
    </>
  );
});

NotificationPopup.defaultProps = {
  type: 'private',
  notificationDep: {},
  udata: {},
  appConfig: {},
};

NotificationPopup.propTypes = notificationPopupType;

export default NotificationPopup;
