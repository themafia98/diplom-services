import React, { memo, useEffect, useState, useMemo, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cabinetType } from './CabinetModule.types';
import { Modal, Upload, message, Icon, Button, Spin } from 'antd';
import { updateUdata } from 'Redux/actions/publicActions';
import UserCard from 'Components/UserCard';
import Title from 'Components/Title';
import StreamBox from 'Components/StreamBox';
import { findUser, routeParser } from 'Utils';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import actionPath from 'actions.path';
import modelsContext from 'Models/context';
import { CABINET_PAGE_TYPE } from './CabinetModule.constant';
import { useTranslation } from 'react-i18next';

const { Dragger } = Upload;

const CabinetModule = memo(({ path }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [state, setState] = useState({
    modePage: '',
    imageUrl: null,
    loading: false,
    filesArray: [],
    disabled: false,
  });

  const { rest, clientDB } = useContext(modelsContext);

  const { modePage, imageUrl, visible } = state;

  const { udata, currentActionTab, routeDataActive } = useSelector(({ publicReducer, router }) => {
    const { udata } = publicReducer;
    const { routeDataActive = null, currentActionTab } = router;

    return {
      udata,
      currentActionTab,
      routeDataActive,
    };
  });

  const fetchCurrentUser = async (id) => {
    try {
      const user = await findUser(id);

      if (!user) {
        throw new Error('Bad user for load page');
      }

      return user;
    } catch {
      return null;
    }
  };

  const isPersonal = modePage === CABINET_PAGE_TYPE.PERSONAL;

  const { _id: uidUser, avatar, isHidePhone = false, isHideEmail = false } = isPersonal
    ? routeDataActive
    : udata;

  const getCurrentCabinetUser = useCallback(async () => {
    const { page, itemId } = routeParser({ pageType: 'moduleItem', path: currentActionTab });

    const user = await fetchCurrentUser(itemId);

    dispatch(
      loadCurrentData({
        action: actionPath.$GLOBAL_LOAD_USERS,
        path: page,
        result: [user],
        optionsForParse: {
          force: true,
          add: true,
        },
        clientDB,
      }),
    );
  }, [currentActionTab, dispatch, clientDB]);

  useEffect(() => {
    if (uidUser) return;

    getCurrentCabinetUser();
  }, [getCurrentCabinetUser, uidUser]);

  useEffect(() => {
    const isPersonalPage = path && path.includes(CABINET_PAGE_TYPE.PERSONAL);

    if (isPersonalPage && modePage !== CABINET_PAGE_TYPE.PERSONAL) {
      setState({ ...state, modePage: CABINET_PAGE_TYPE.PERSONAL });
      return;
    }

    if (!isPersonalPage && modePage === CABINET_PAGE_TYPE.PERSONAL) {
      setState({ ...state, modePage: '' });
      return;
    }

    if (!isPersonalPage && modePage === CABINET_PAGE_TYPE.PERSONAL) {
      setState({ ...state, modePage: '' });
    }
  }, [modePage, path, state]);

  const showModal = () => {
    setState({ ...state, visible: true });
  };

  const hideModal = () => {
    setState({
      ...state,
      visible: false,
      imageUrl: null,
      loading: false,
      disabled: false,
    });
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type.startsWith('image/');
    if (!isJpgOrPng) {
      setState((state) => ({ ...state, loading: !state.loading, disabled: false, error: true }));
      message.error(t('cabinetModule_files_onlyImageError'));
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      setState((state) => ({ ...state, loading: !state.loading, disabled: false, error: true }));
      message.error(t('cabinetModule_files_onlyLessThan'));
    }
    return isJpgOrPng && isLt5M;
  };

  const setFile = (imageUrl, disabled) => {
    setState({
      ...state,
      imageUrl: `data:image/png;base64,${imageUrl}`,
      loading: false,
      disabled,
    });

    dispatch(updateUdata({ avatar: imageUrl }));
  };

  const reset = (event) => {
    setState({ ...state, imageUrl: null, loading: false, disabled: false });
  };

  const onChangeFile = (info) => {
    const { status } = info.file;
    if (status !== 'uploading') setState({ ...state, disabled: false });

    if (status === 'done') {
      message.success(`${info.file.name} ${t('cabinetModule_files_fileSuccess')}`);
      const { file: { xhr: { response = null } = {} } = {} } = info;

      const res = typeof response === 'string' ? JSON.parse(response) : response;

      const { response: { metadata = '', done = false } = {} } = res || {};

      if (!done) {
        setState({ ...state, disabled: false });
        message.error(`${info.file.name} ${t('cabinetModule_files_fileFailed')}`);
        return;
      }

      setFile(metadata, true);
    } else if (status === 'error') {
      setState({ ...state, disabled: false });
      message.error(`${info.file.name} ${t('cabinetModule_files_fileFailed')}`);
    }
  };

  const props = useMemo(
    () => ({
      name: 'avatar',
      multiple: false,
      withCredentials: true,
      headers: rest ? rest.getAuthorizationHeader() : null,
      action: rest && uidUser ? `${rest.getApi()}/cabinet/${uidUser}/loadAvatar` : null,
    }),
    [rest, uidUser],
  );

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">{t('cabinetModule_files_uploadButton')}</div>
    </div>
  );

  if (!uidUser) {
    return (
      <div className="cabinetModule cabinetModule--cabinetLoader">
        <Spin size="large" tip={t('cabinetModule_loadingPage')} />
      </div>
    );
  }

  const shouldHidePhone = isPersonal && isHidePhone;
  const shouldHideEmail = isPersonal && isHideEmail;

  return (
    <div className="cabinetModule">
      <Title
        additional={t('cabinetModule_pageName')}
        classNameTitle="cabinetModuleTitle"
        title={!isPersonal ? t('cabinetModule_titlePersonal') : t('cabinetModule_titleEmployee')}
      />
      <div className="cabinetModule_main">
        <div className="col-6">
          <UserCard
            isHidePhone={shouldHidePhone}
            isHideEmail={shouldHideEmail}
            personalData={routeDataActive}
            modePage={modePage}
            imageUrl={avatar}
            cdShowModal={showModal}
          />
        </div>
        <div className="col-6">
          <p className="lastActivity">{t('cabinetModule_activity')}</p>
          <StreamBox
            type="global"
            prefix="#notification"
            isSingleLoading={true}
            withStore={true}
            streamStore="streamList"
            streamModule="cabinetModule"
            filterStream="uidCreater"
            personalUid={isPersonal ? uidUser : null}
            boxClassName="streamActivityCabinet"
            mode="activity"
          />
        </div>
      </div>
      <Modal
        destroyOnClose={true}
        className="loadingAvatar-modal"
        title="Change photo"
        visible={visible}
        onCancel={hideModal}
        onOk={hideModal}
      >
        <Dragger
          beforeUpload={beforeUpload}
          showUploadList={false}
          listType="picture-card"
          disabled={state.disabled}
          onChange={onChangeFile}
          accept="image/*"
          {...props}
        >
          {imageUrl && !state.loading ? (
            <img className="user-avatar" src={imageUrl} alt="avatar" />
          ) : (
            uploadButton
          )}
          {imageUrl ? (
            <Button className="deleteButton" onClick={reset} type="primary">
              {t('cabinetModule_files_deleteButton')}
            </Button>
          ) : null}
        </Dragger>
      </Modal>
    </div>
  );
});

CabinetModule.propTypes = cabinetType;
CabinetModule.defaultProps = {
  path: '',
  modelsContext: {},
};

export default CabinetModule;
