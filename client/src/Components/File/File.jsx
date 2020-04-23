// @ts-nocheck
import React from 'react';
import { fileType } from './types';
import { v4 as uuid } from 'uuid';
import { Upload, Icon, message } from 'antd';
const { Dragger } = Upload;

class File extends React.Component {
  state = {
    filesArray: null,
  };

  static propTypes = fileType;

  static getDerivedStateFromProps = (props, state) => {
    const isArray = Array.isArray(props.filesArray) && Array.isArray(state.filesArray);

    if (
      props.filesArray !== state.filesArray ||
      (isArray && state.filesArray.length !== props.filesArray.length)
    ) {
      if (Array.isArray(props.filesArray))
        return {
          ...state,
          filesArray: [...props.filesArray],
        };
    }

    return state;
  };

  onChange = (info) => {
    const { status } = info.file;
    const { onAddFileList } = this.props;

    if (status === 'uploading') {
      if (onAddFileList) onAddFileList(info.fileList, status);
    }
    if (status === 'done') {
      if (onAddFileList) {
        onAddFileList(info.fileList, status);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else message.error('Error add file');
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  onRemove = (file) => {
    const { onRemoveFile = null } = this.props;
    if (onRemoveFile) onRemoveFile(file);
  };

  render() {
    const { moduleData: { _id = '' } = {}, rest, module = '', isLocal = false } = this.props;
    const props = {
      name: `${uuid()}__${_id}`,
      multiple: !isLocal ? true : false,
      withCredentials: true,
      headers: rest && isLocal ? rest.getHeaders() : null,
      fileList: this.state.filesArray,
      action: rest && isLocal ? `${rest.getApi()}/system/${module}/file` : null,
    };

    return (
      <div className="file">
        <Dragger
          beforeUpload={this.beforeUpload}
          onChange={this.onChange}
          onRemove={this.onRemove}
          {...props}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Нажмите или перетащите файл в эту область, чтобы загрузить</p>
          <p className="ant-upload-hint">Поддержка разовой или массовой загрузки.</p>
        </Dragger>
      </div>
    );
  }
}

export default File;
