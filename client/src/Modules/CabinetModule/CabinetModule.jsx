import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { cabinetType } from './types';
import { Modal, Upload, message, Icon, Button } from 'antd';
import { updateUdata } from 'Redux/actions/publicActions';
import { saveComponentStateAction } from 'Redux/actions/routerActions';
import UserCard from 'Components/UserCard';
import TitleModule from 'Components/TitleModule';
import StreamBox from 'Components/StreamBox';
import ModelContext from 'Models/context';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
const { Dragger } = Upload;

class CabinetModule extends PureComponent {
  state = {
    modePage: '',
    imageUrl: null,
    loading: false,
    filesArray: [],
    disabled: false,
  };

  static contextType = ModelContext;
  static propTypes = cabinetType;
  static defaultProps = {
    modePage: '',
  };

  static getDerivedStateFromProps = (nextProps, state) => {
    const { path = '' } = nextProps || {};
    const { modePage = '' } = state || {};

    const isPersonalPage = path && path.includes('personalPage');

    if (isPersonalPage && modePage !== 'personal') {
      return {
        ...state,
        modePage: 'personal',
      };
    }

    if (!isPersonalPage && modePage === 'personal') {
      return {
        ...state,
        modePage: '',
      };
    }

    return state;
  };

  showModal = (event) => {
    this.setState({ ...this.state, visible: true });
  };

  hideModal = (event) => {
    this.setState({
      ...this.state,
      visible: false,
      imageUrl: null,
      loading: false,
      disabled: false,
    });
  };

  beforeUpload = (file) => {
    const isJpgOrPng = file.type.startsWith('image/');
    if (!isJpgOrPng) {
      this.setState((state) => ({ ...state, loading: !state.loading, disabled: false, error: true }));
      message.error('Вы можете загрузить только изображение.');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      this.setState((state) => ({ ...state, loading: !state.loading, disabled: false, error: true }));
      message.error('Изображение должно быть меньше 5 мб.');
    }
    return isJpgOrPng && isLt2M;
  };

  /**
   * @param {string} imageUrl
   * @param {boolean} disabled
   */
  setFile = (imageUrl, disabled) => {
    const { onUpdateUdata = null } = this.props;
    this.setState(
      {
        imageUrl: `data:image/png;base64,${imageUrl}`,
        loading: false,
        disabled,
      },
      () => {
        if (onUpdateUdata) onUpdateUdata({ avatar: imageUrl });
      },
    );
  };

  reset = (event) => {
    this.setState({ ...this.state, imageUrl: null, loading: false, disabled: false });
  };

  /**
   * @param {{ file: any; }} info
   */
  onChangeFile = (info) => {
    const { status } = info.file;
    if (status !== 'uploading') {
      this.setState({ disabled: false });
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      const { file: { xhr: { response = null } = {} } = {} } = info;

      const res = typeof response === 'string' ? JSON.parse(response) : response;

      const { response: { metadata = '', done = false } = {} } = res || {};

      if (!done) {
        this.setState({ disabled: false });
        message.error(`${info.file.name} file upload failed.`);
        return;
      }

      this.setFile(metadata, true);
    } else if (status === 'error') {
      this.setState({ disabled: false });
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  render() {
    const { visible, imageUrl, modePage = '' } = this.state;
    const { udata = {}, routeDataActive = {}, modelsContext } = this.props;
    const { rest } = modelsContext;

    const isPersonal = modePage === 'personal';

    const { _id: uidUser = '', avatar = '', isHidePhone = false, isHideEmail = false } = isPersonal
      ? routeDataActive
      : udata;

    const props = {
      name: 'avatar',
      multiple: false,
      withCredentials: true,
      headers: rest ? rest.getHeaders() : null,
      action: rest && uidUser ? `${rest.getApi()}/cabinet/${uidUser}/loadAvatar` : null,
    };

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
              cdShowModal={this.showModal}
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
          onCancel={this.hideModal}
          onOk={this.hideModal}
        >
          <Dragger
            beforeUpload={this.beforeUpload}
            showUploadList={false}
            listType="picture-card"
            disabled={this.state.disabled}
            onChange={this.onChangeFile}
            accept="image/*"
            {...props}
          >
            {imageUrl && !this.state.loading ? (
              <img className="user-avatar" src={imageUrl} alt="avatar" />
            ) : (
              uploadButton
            )}
            {imageUrl ? (
              <Button className="deleteButton" onClick={this.reset} type="primary">
                Удалить загруженное изображение
              </Button>
            ) : null}
          </Dragger>
        </Modal>
      </div>
    );
  }
}

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
    onSaveComponentState: (data) => dispatch(saveComponentStateAction(data)),
    onUpdateUdata: (payload) => dispatch(updateUdata(payload)),
  };
};

export default compose(moduleContextToProps, connect(mapStateToProps, mapDispatchToProps))(CabinetModule);
