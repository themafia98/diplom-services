import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal, Upload, message, Icon, Button } from 'antd';
import { b64toBlob } from '../../../Utils';
import { updateUdata } from '../../../Redux/actions/publicActions';
import UserCard from '../../UserCard';
import TitleModule from '../../TitleModule';
import StreamBox from '../../StreamBox';
import modelContext from '../../../Models/context';
const { Dragger } = Upload;

class CabinetModule extends React.PureComponent {
  state = {
    imageUrl: null,
    loading: false,
    filesArray: [],
    disabled: false,
  };

  static contextType = modelContext;

  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
  };

  showModal = event => {
    this.setState({ ...this.state, visible: true });
  };

  hideModal = event => {
    this.setState({
      ...this.state,
      visible: false,
      imageUrl: null,
      loading: false,
      disabled: false,
    });
  };

  beforeUpload = file => {
    const isJpgOrPng = file.type.startsWith('image/');
    if (!isJpgOrPng) {
      this.setState(state => ({ ...state, loading: !state.loading, disabled: false, error: true }));
      message.error('Вы можете загрузить только изображение.');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      this.setState(state => ({ ...state, loading: !state.loading, disabled: false, error: true }));
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

  reset = event => {
    this.setState({ ...this.state, imageUrl: null, loading: false, disabled: false });
  };

  /**
   * @param {{ file: any; }} info
   */
  onChangeFile = info => {
    const { status } = info.file;
    if (status !== 'uploading') {
      this.setState({ disabled: false });
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
      const { file: { xhr: { response = null } = {} } = {} } = info;

      const res = _.isString(response) ? JSON.parse(response) : response;

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
    const { visible, imageUrl } = this.state;
    const { rest } = this.context;
    const { udata: { _id: uid = '', avatar = '' } = {} } = this.props;

    const uidUser = uid;

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
        <TitleModule additional="Профиль" classNameTitle="cabinetModuleTitle" title="Личный кабинет" />
        <div className="cabinetModule_main">
          <div className="col-6">
            <UserCard imageUrl={avatar} cdShowModal={this.showModal} />
          </div>
          <div className="col-6">
            <p className="lastActivity">Последняя активность</p>
            <StreamBox boxClassName="streamActivityCabinet" mode="activity" />
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
              <img src={imageUrl} alt="avatar" style={{ width: '50%' }} />
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

const mapStateToProps = state => {
  const { udata = {} } = state.publicReducer;

  return {
    udata,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onUpdateUdata: payload => dispatch(updateUdata(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CabinetModule);