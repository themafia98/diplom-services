import React, { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import Scrollbars from 'react-custom-scrollbars';

import Comments from 'Components/Comments';
import File from 'Components/File';

const DescriptionTask = forwardRef(
  (
    {
      onEditContentMode,
      onAddFileList,
      routeDataActive,
      onRemoveFile,
      commentProps,
      description,
      rulesEdit,
      filesArray,
      onUpdate,
      udata,
      rest,
      path,
    },
    ref,
  ) => {
    const scrollStyle = useMemo(() => {
      return { height: '150px' };
    }, []);
    return (
      <>
        <p className="descriptionTask__title">Задача</p>
        <div
          ref={ref}
          onDoubleClick={rulesEdit ? (event) => onEditContentMode(event, 'editDescription') : null}
          className={clsx('description', 'descriptionTask__content', rulesEdit ? 'editable' : null)}
        >
          <span className="icon-wrapper">
            <i className="icon-pencil" />
          </span>
          <Scrollbars style={scrollStyle}>
            <span className="descriptionContent">{description ? description : 'Описания задачи нету.'}</span>
          </Scrollbars>
        </div>

        <p className="task_file">Дополнительные файлы для задачи</p>
        <File
          filesArray={filesArray}
          rest={rest}
          onAddFileList={onAddFileList}
          onRemoveFile={onRemoveFile}
          moduleData={routeDataActive}
          isLocal={true}
          module="tasks"
        />
        <p className="descriptionTask__comment">Коментарии</p>
        <Comments
          commentProps={commentProps}
          udata={udata}
          path={path}
          rules={true}
          onUpdate={onUpdate}
          data={routeDataActive}
        />
      </>
    );
  },
);

export default DescriptionTask;
