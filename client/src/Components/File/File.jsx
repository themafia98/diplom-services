import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { fileType } from './File.types';
import { v4 as uuid } from 'uuid';
import { Upload, Icon, message, Checkbox } from 'antd';
import ModelContext from 'Models/context';
import { useTranslation } from 'react-i18next';
const { Dragger } = Upload;

const File = ({
  filesArray: filesListProps,
  onAddFileList,
  onRemoveFile,
  moduleData,
  module,
  isLocal,
  customUrl,
}) => {
  const { t } = useTranslation();
  const { _id = '' } = moduleData;

  const [directory, setDirectory] = useState(null);
  const [filesList, setFiles] = useState([]);

  const context = useContext(ModelContext);

  useEffect(() => {
    const isList = Array.isArray(filesListProps);
    const isArrayLikeFilesList = isList && Array.isArray(filesList);

    const isDiffFilesListCount = isArrayLikeFilesList && filesList.length !== filesListProps.length;

    if (isList && (filesListProps !== filesList || isDiffFilesListCount)) {
      setFiles(filesListProps);
    }
  }, [filesList, filesListProps]);

  const onChange = ({ file = {}, fileList = [] } = {}) => {
    const { status = '', name = '' } = file;

    if (status === 'uploading') {
      if (onAddFileList) onAddFileList(fileList, status);
    }
    if (status === 'done') {
      if (onAddFileList) {
        onAddFileList(fileList, status);
        message.success(`${name} ${t('components_file_messages_fileLoad')}.`);
      } else message.error('Error add file');
    } else if (status === 'error') {
      message.error(`${name} ${t('components_file_messages_failFileLoad')}.`);
    }
  };

  const onRemove = (file) => {
    if (onRemoveFile) onRemoveFile(file);
  };

  const handlePreview = ({ url = '', name = '' }) => {
    const linkDownload = document.createElement('a');
    linkDownload.href = url;
    linkDownload.download = name;
    document.body.appendChild(linkDownload);
    linkDownload.click();
    linkDownload.remove();
  };

  const onChangeMode = ({ target: { checked = false } }) => {
    setDirectory(checked);
  };

  const getFileProps = useCallback(() => {
    const { Request } = context;
    const rest = new Request();

    return {
      name: `${uuid()}_$FT$P$_${_id}`,
      multiple: !isLocal,
      withCredentials: true,
      headers: rest && isLocal ? rest.getAuthorizationHeader() : null,
      fileList: filesList,
      action: customUrl ? customUrl : rest && isLocal ? `${rest.getApi()}/system/${module}/file` : null,
      onPreview: handlePreview,
      directory,
    };
  }, [_id, context, customUrl, directory, filesList, isLocal, module]);

  const draggerProps = useMemo(() => getFileProps(), [getFileProps]);

  return (
    <div className="file">
      <Checkbox defaultChecked={false} onChange={onChangeMode} checked={directory}>
        {t('components_file_loadDir')}
      </Checkbox>
      <Dragger onChange={onChange} onRemove={onRemove} {...draggerProps}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">{t('components_file_dndLoad')}</p>
        <p className="ant-upload-hint">{t('components_file_aboutLoad')}</p>
      </Dragger>
    </div>
  );
};

File.defaultProps = {
  filesArray: [],
  onAddFileList: null,
  onRemoveFile: null,
  moduleData: {},
  rest: null,
  module: '',
  isLocal: false,
  customUrl: '',
};

File.propTypes = fileType;

export default File;
