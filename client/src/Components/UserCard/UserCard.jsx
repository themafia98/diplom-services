import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { userCardType } from './UserCard.types';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Icon, Dropdown, Menu, Tooltip, message, Popover } from 'antd';
import ModalWindow from 'Components/ModalWindow';

import ModelContext from 'Models/context';
import imageCard from './wallpaper_user.jpg';
import actionsTypes from 'actions.types';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';
import { updateUserData } from 'Redux/reducers/publicReducer.slice';

const { Item: MenuItem } = Menu;

const UserCard = ({
  modePage: modePageProps,
  cdShowModal,
  imageUrl,
  personalData,
  isHidePhone,
  isHideEmail,
}) => {
  const dispatch = useDispatch();
  const { udata } = useSelector((state) => {
    const { udata = {} } = state.publicReducer;
    return { udata };
  });

  const [visibilityModal, setVisibilityModal] = useState(false);
  const [modePage, setModePage] = useState('');

  const context = useContext(ModelContext);

  const isPersonalPage = modePage === 'personal';
  const { _id: uid } = udata;
  const {
    displayName = '',
    departament = '',
    email = '',
    isOnline = false,
    summary = '',
    phone = '',
  } = isPersonalPage ? personalData : udata;

  useEffect(() => {
    const isPersonalPage = modePageProps && modePageProps.includes('personal');

    if (isPersonalPage && modePage !== modePageProps) {
      setModePage('personal');
    }

    if (!isPersonalPage && modePage === 'personal') {
      setModePage('');
    }
  }, [modePage, modePageProps]);

  const showEditSummary = () => {
    setVisibilityModal(!visibilityModal);
  };

  const onSubmitSummary = useCallback(
    async (event, value) => {
      const { Request } = context;

      try {
        const rest = new Request();
        const res = await rest.sendRequest(
          '/system/users/update/single',
          'POST',
          {
            ...requestTemplate,
            moduleName: 'cabinetModule',
            actionType: actionsTypes.$UPDATE_SINGLE,
            params: {
              ...paramsTemplate,
              options: { uid },
              updateItem: {
                summary: value,
              },
            },
          },
          true,
        );

        if (res.status !== 200) {
          throw new Error('Bad summury update');
        }

        const { response: { metadata: { summary = '' } = {} } = {} } = res.data || {};

        dispatch(updateUserData({ summary }));

        setVisibilityModal(false);
      } catch (error) {
        if (error?.response?.status !== 404) console.error(error.message);
        message.error('Ошибка обновления описания.');
      }
    },
    [context, uid, dispatch],
  );

  const onRejectEditSummary = () => {
    setVisibilityModal(false);
  };

  const menu = useMemo(
    () =>
      !isPersonalPage ? (
        <Menu>
          <MenuItem onClick={cdShowModal ? cdShowModal : null} key="photoChange">
            Сменить аватар
          </MenuItem>
        </Menu>
      ) : (
        <div>No action</div>
      ),
    [cdShowModal, isPersonalPage],
  );

  const background = {
    backgroundImage: `url("${imageCard}")`,
  };

  const popoverStyle = { width: '500px' };
  const isHideMailIcon = !email || isHideEmail;

  return (
    <>
      <div className="userCard">
        <div style={background} className="wallpaper" />
        <div className="mainContentCard">
          <div className="col-6">
            {!isPersonalPage ? (
              <Tooltip trigger="hover" title="ПКМ - смена фотографии">
                <Dropdown disabled={isPersonalPage} overlay={menu} trigger={['contextMenu']}>
                  <Avatar
                    src={imageUrl ? `data:image/png;base64,${imageUrl}` : null}
                    className="userLogo"
                    size={84}
                    icon="user"
                  />
                </Dropdown>
              </Tooltip>
            ) : (
              <Avatar
                src={imageUrl ? `data:image/png;base64,${imageUrl}` : null}
                className="userLogo"
                size={84}
                icon="user"
              />
            )}
            <div className={clsx('mainInformUser', isHideMailIcon ? 'withHideIcon' : null)}>
              <div className="mainInformUser__main">
                <p className="name">{displayName ? displayName : 'Unknown'}</p>
                <p className="position">{departament ? departament : ''}</p>
              </div>
              <div className="mainInformUser__controllers">
                {email && !isHideEmail ? (
                  <Button title={email} className="controller" type="primary" icon="mail" />
                ) : null}
                {isOnline ? <Button className="controller" type="primary" icon="wechat" /> : null}
              </div>
            </div>
          </div>
          <div className="col-6 summary_wrapper">
            {!isPersonalPage ? (
              <div className="canEditSummary">
                <Tooltip title="Редактировать описание">
                  <Icon onClick={showEditSummary} type="edit" />
                </Tooltip>
              </div>
            ) : null}
            {summary ? (
              <Popover
                overlayStyle={popoverStyle}
                placement="top"
                content={<p className="summary-popover">{summary}</p>}
                trigger="click"
              >
                <p className="summary">{summary}</p>
              </Popover>
            ) : (
              <p className="summary">{summary}</p>
            )}
            <div className="contact">
              {email && !isHideEmail ? (
                <div className="email">
                  <Icon type="mail" /> <span>{email}</span>
                </div>
              ) : null}
              {phone && !isHidePhone ? (
                <div className="phone">
                  <Icon type="phone" /> <span>{phone}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {!isPersonalPage ? (
        <ModalWindow
          title="Редактирование описания"
          defaultView={true}
          maxLength={600}
          visibility={visibilityModal}
          onReject={onRejectEditSummary}
          onOkey={onSubmitSummary}
          defaultValue={udata.summary}
        />
      ) : null}
    </>
  );
};

UserCard.propTypes = userCardType;
UserCard.defaultProps = {
  cdShowModal: null,
  personalData: {},
  isHidePhone: false,
  isHideEmail: false,
};

export default UserCard;
