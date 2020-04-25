// @ts-nocheck
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Scrollbars from 'react-custom-scrollbars';

import Comments from '../../../Components/Comments';
import File from '../../../Components/File';

const DescriptionTask = forwardRef(
  (
    {
      onEditContentMode,
      onAddFileList,
      routeDataActive,
      onRemoveFile,
      description,
      rulesEdit,
      filesArray,
      onUpdate,
      udata,
      rest,
    },
    ref,
  ) => (
    <>
      <p className="descriptionTask__title">Задача</p>
      <div
        ref={ref}
        onClick={rulesEdit ? onEditContentMode : null}
        className={clsx('description', 'descriptionTask__content', rulesEdit ? 'editable' : null)}
      >
        <span className="icon-wrapper">
          <i className="icon-pencil"></i>
        </span>
        <Scrollbars style={{ height: '150px' }}>
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
        module="tasks"
      />
      <p className="descriptionTask__comment">Коментарии</p>
      <Comments udata={udata} rules={true} onUpdate={onUpdate} data={routeDataActive} />
    </>
  ),
);

export default DescriptionTask;