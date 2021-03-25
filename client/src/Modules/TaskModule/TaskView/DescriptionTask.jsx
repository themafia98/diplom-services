import React, { forwardRef, useMemo } from 'react';
import { oneOf, oneOfType, string, object, bool, array, func } from 'prop-types';
import clsx from 'clsx';
import Scrollbars from 'react-custom-scrollbars';

import Comments from 'Components/Comments';
import File from 'Components/File';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const DescriptionTask = forwardRef(
  (
    {
      onEditContentMode,
      onAddFileList,
      onRemoveFile,
      commentProps,
      description,
      rulesEdit,
      filesArray,
      path,
    },
    ref,
  ) => {
    const { t } = useTranslation();

    const routeDataActive = useSelector(({ router }) => router.routeDataActive);

    const scrollStyle = useMemo(() => {
      return { height: '150px' };
    }, []);
    return (
      <>
        <p className="descriptionTask__title">{t('taskModule_view_aboutBlock_title')}</p>
        <div
          ref={ref}
          onDoubleClick={rulesEdit ? (event) => onEditContentMode(event, 'editDescription') : null}
          className={clsx('description', 'descriptionTask__content', rulesEdit ? 'editable' : null)}
        >
          <span className="icon-wrapper">
            <i className="icon-pencil" />
          </span>
          <Scrollbars autoHide hideTracksWhenNotNeeded style={scrollStyle}>
            <span className="descriptionContent">
              {description ? description : t('taskModule_view_messages_aboutEmpty')}
            </span>
          </Scrollbars>
        </div>

        <p className="task_file">{t('taskModule_view_aboutBlock_files')}</p>
        <File
          filesArray={filesArray}
          onAddFileList={onAddFileList}
          onRemoveFile={onRemoveFile}
          moduleData={routeDataActive}
          isLocal={true}
          module="tasks"
        />
        <p className="descriptionTask__comment">{t('taskModule_view_comments')}</p>
        <Comments commentProps={commentProps} path={path} rules={true} data={routeDataActive} />
      </>
    );
  },
);

DescriptionTask.defaultProps = {
  commentProps: null,
  description: '',
  rulesEdit: false,
  filesArray: null,
};

DescriptionTask.propTypes = {
  commentProps: oneOfType([object, oneOf([null])]),
  description: string,
  rulesEdit: bool,
  filesArray: oneOfType([array, oneOf([null])]),
  onEditContentMode: func.isRequired,
  onAddFileList: func.isRequired,
  onRemoveFile: func.isRequired,
  path: string,
};

export default DescriptionTask;
