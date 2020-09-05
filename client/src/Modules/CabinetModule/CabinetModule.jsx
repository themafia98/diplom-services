import React, { memo, useEffect, useState, useMemo } from 'react';
import { connect } from 'react-redux';
import { cabinetType } from './types';
import { Modal, Upload, message, Icon, Button } from 'antd';
import { updateUdata } from 'Redux/actions/publicActions';
import UserCard from 'Components/UserCard';
import TitleModule from 'Components/TitleModule';
import StreamBox from 'Components/StreamBox';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
const { Dragger } = Upload;

const CabinetModule = memo(({ path, onUpdateUdata, udata, routeDataActive, modelsContext }) => {
  const [state, setState] = useState({
    modePage: '',
    imageUrl: null,
    loading: false,
    filesArray: [],
    disabled: false,
  });

  const { rest } = modelsContext;
  const { modePage, imageUrl, visible } = state;

  useEffect(() => {
    const isPersonalPage = path && path.includes('personalPage');

    if (isPersonalPage && modePage !== 'personal') {
      setState({ ...state, modePage: 'personal' });
      return;
    }

    if (!isPersonalPage && modePage === 'personal') {
      setState({ ...state, modePage: '' });
      return;
    }

    if (!isPersonalPage && modePage === 'personal') {
      setState({ ...state, modePage: '' });
    }
  }, [modePage, path, state]);

  const showModal = (event) => {
    setState({ ...state, visible: true });
  };

  const hideModal = (event) => {
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
      message.error('Вы можете загрузить только изображение.');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      setState((state) => ({ ...state, loading: !state.loading, disabled: false, error: true }));
      message.error('Изображение должно быть меньше 5 мб.');
    }
    return isJpgOrPng && isLt2M;
  };

  const setFile = (imageUrl, disabled) => {
    setState({
      ...state,
      imageUrl: `data:image/png;base64,${imageUrl}`,
      loading: false,
      disabled,
    });

    if (onUpdateUdata) onUpdateUdata({ avatar: imageUrl });
  };

  const reset = (event) => {
    setState({ ...state, imageUrl: null, loading: false, disabled: false });
  };

  const onChangeFile = (info) => {
    const { status } = info.file;
    if (status !== 'uploading') setState({ ...state, disabled: false });

    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      const { file: { xhr: { response = null } = {} } = {} } = info;

      const res = typeof response === 'string' ? JSON.parse(response) : response;

      const { response: { metadata = '', done = false } = {} } = res || {};

      if (!done) {
        setState({ ...state, disabled: false });
        message.error(`${info.file.name} file upload failed.`);
        return;
      }

      setFile(metadata, true);
    } else if (status === 'error') {
      setState({ ...state, disabled: false });
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const isPersonal = modePage === 'personal';

  const { _id: uidUser = '', avatar = '', isHidePhone = false, isHideEmail = false } = isPersonal
    ? routeDataActive
    : udata;

  const props = useMemo(
    () => ({
      name: 'avatar',
      multiple: false,
      withCredentials: true,
      headers: rest ? rest.getHeaders() : null,
      action: rest && uidUser ? `${rest.getApi()}/cabinet/${uidUser}/loadAvatar` : null,
    }),
    [rest, uidUser],
  );

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <div className="cabinetModule">
      <TitleModule
        additional="Профиль"
        classNameTitle="cabinetModuleTitle"
        title={!isPersonal ? 'Личный кабинет' : 'Карточка сотрудника'}
      />
      <div className="cabinetModule_main">
        <div className="col-6">
          <UserCard
            isHidePhone={isPersonal && isHidePhone ? true : false}
            isHideEmail={isPersonal && isHideEmail ? true : false}
            personalData={routeDataActive}
            modePage={modePage}
            imageUrl={avatar}
            cdShowModal={showModal}
          />
        </div>
        <div className="col-6">
          <p className="lastActivity">Последняя активность</p>
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
        title="Сменить фото"
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
              Удалить загруженное изображение
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
  onUpdateUdata: null,
  udata: {},
  routeDataActive: {},
  modelsContext: {},
};

const mapStateToProps = (state) => {
  const { udata = {} } = state.publicReducer;
  const { routeData = {}, routeDataActive = {} } = state?.router || {};

  return {
    udata,
    routeData,
    routeDataActive,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onUpdateUdata: (payload) => dispatch(updateUdata(payload)),
  };
};

export default compose(moduleContextToProps, connect(mapStateToProps, mapDispatchToProps))(CabinetModule);
