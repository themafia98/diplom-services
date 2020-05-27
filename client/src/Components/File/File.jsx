import React from 'react';
import { fileType } from './types';
import { v4 as uuid } from 'uuid';
import { Upload, Icon, message, Checkbox } from 'antd';
import modelContext from 'Models/context';
const { Dragger } = Upload;

class File extends React.Component {
  state = {
    filesArray: null,
  };

  static contextType = modelContext;
  static propTypes = fileType;
  static defaultProps = {
    filesArray: [],
    onAddFileList: null,
    onRemoveFile: null,
    moduleData: {},
    rest: null,
    module: '',
    isLocal: false,
    customUrl: '',
  };

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
    const { onRemoveFile } = this.props;
    if (onRemoveFile) onRemoveFile(file);
  };

  handlePreview = ({ url = '', name = '' }) => {
    const linkDownload = document.createElement('a');
    linkDownload.href = url;
    linkDownload.download = name;
    document.body.appendChild(linkDownload);
    linkDownload.click();
    linkDownload.remove();
  };

  getFileProps = () => {
    const { moduleData: { _id = '' } = {}, module, isLocal, customUrl } = this.props;
    const { Request } = this.context;
    const rest = new Request();
    const { filesArray = [], directory = false } = this.state;

    return {
      name: `${uuid()}_$FT$P$_${_id}`,
      multiple: !isLocal,
      withCredentials: true,
      headers: rest && isLocal ? rest.getHeaders() : null,
      fileList: filesArray,
      action: customUrl ? customUrl : rest && isLocal ? `${rest.getApi()}/system/${module}/file` : null,
      onPreview: this.handlePreview,
      directory,
    };
  };

  onChangeMode = ({ target: { checked: directory = false } }) => {
    this.setState({
      ...this.state,
      directory,
    });
  };

  render() {
    const props = this.getFileProps();
    const { directory = false } = this.state;
    return (
      <div className="file">
        <Checkbox defaultChecked={false} onChange={this.onChangeMode} value={directory}>
          Загрузка дирректории
        </Checkbox>
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
