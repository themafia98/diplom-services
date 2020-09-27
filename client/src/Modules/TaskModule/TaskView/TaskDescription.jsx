import React, { useMemo } from 'react';
import clsx from 'clsx';
import TagsContainer from 'Components/TagsContainer';
import { Descriptions, Input, Select, DatePicker } from 'antd';
import Output from 'Components/Output';
import moment from 'moment';
import { calculateTime } from '../TaskModule.utils';

const { Option } = Select;

const TaskDescription = ({
  columnStyleConfig,
  onOpenPageWithData,
  onChangeEditableStart,
  onChangeEditableEnd,
  shouldVisibleButtonAddTag,
  cachesJurnalList,
  cachesAuthorList,
  onChangeEditable,
  cachesEditorList,
  modeControllEdit,
  onChangeTagList,
  statusClassName,
  accessPriority,
  setCurrentTab,
  filteredUsers,
  depDataKey,
  modeControll,
  accessStatus,
  uidCreater,
  priority,
  tagsView,
  tagList,
  status,
  isLoad,
  router,
  editor,
  udata,
  name,
  date,
  taskKey,
}) => {
  const time = useMemo(() => calculateTime(cachesJurnalList), [cachesJurnalList]);

  const statusList = useMemo(
    () =>
      accessStatus?.map((it, index) => (
        <Option key={`${it}${index}`} value={it}>
          {it}
        </Option>
      )),
    [accessStatus],
  );

  const accessList = useMemo(
    () =>
      accessPriority.map((it, index) => (
        <Option key={`${index}${it}`} value={it}>
          {it}
        </Option>
      )),
    [accessPriority],
  );

  const users = useMemo(
    () =>
      filteredUsers.map((it, index) => (
        <Option key={`${it._id}${index}`} value={it._id} label={it.displayName}>
          <span>{it.displayName}</span>
        </Option>
      )),
    [filteredUsers],
  );

  return (
    <Descriptions bordered column={columnStyleConfig}>
      <Descriptions.Item label="Артикул">
        <Output className="key">{taskKey}</Output>
      </Descriptions.Item>
      <Descriptions.Item label="Название">
        {modeControll === 'default' ? (
          <Output className="name">{name}</Output>
        ) : modeControll === 'edit' && modeControllEdit ? (
          <Input className="nameEdit" onChange={onChangeEditable} value={modeControllEdit.name} />
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Статус">
        {modeControll === 'default' ? (
          <Output className={clsx('status', statusClassName)}>{status}</Output>
        ) : modeControll === 'edit' && modeControllEdit ? (
          <Select
            className="statusEdit"
            value={modeControllEdit.status}
            onChange={onChangeEditable}
            defaultValue={status}
            name="priority"
            type="text"
          >
            {statusList}
          </Select>
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Приоритет">
        {modeControll === 'default' ? (
          <Output className="priority">{priority}</Output>
        ) : modeControll === 'edit' && modeControllEdit ? (
          <Select
            className="priorityEdit"
            value={modeControllEdit.priority}
            onChange={onChangeEditable}
            defaultValue={priority}
            name="priority"
            type="text"
          >
            {accessList}
          </Select>
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Автор задачи">
        <Output
          className="author"
          typeOutput="link"
          depDataKey={depDataKey}
          router={router}
          links={filteredUsers?.length ? filteredUsers : cachesAuthorList}
          isLink={filteredUsers?.length ? Boolean(filteredUsers) : Boolean(cachesAuthorList)}
          list={true}
          onOpenPageWithData={onOpenPageWithData}
          setCurrentTab={setCurrentTab}
          udata={udata}
          isLoad={isLoad}
          isStaticList={true}
        >
          {cachesAuthorList?.length ? cachesAuthorList : uidCreater}
        </Output>
      </Descriptions.Item>
      <Descriptions.Item label="Исполнитель">
        {modeControll === 'default' ? (
          <Output
            typeOutput="link"
            depDataKey={depDataKey}
            router={router}
            links={filteredUsers?.length ? filteredUsers : cachesEditorList}
            isLink={filteredUsers?.length ? Boolean(filteredUsers) : Boolean(cachesEditorList)}
            list={true}
            onOpenPageWithData={onOpenPageWithData}
            setCurrentTab={setCurrentTab}
            className="editor"
            udata={udata}
            isLoad={isLoad}
          >
            {editor}
          </Output>
        ) : modeControll === 'edit' && modeControllEdit ? (
          <Select
            className="editorEdit"
            value={modeControllEdit.editor}
            onChange={onChangeEditable}
            name="editor"
            mode="multiple"
            defaultValue={editor}
            placeholder="выберете исполнителя"
            optionLabelProp="label"
          >
            {users}
          </Select>
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Метки">
        <div className="tags">
          <TagsContainer
            tagList={tagList}
            tagsView={tagsView}
            onChangeTagList={onChangeTagList}
            shouldVisibleButtonAddTag={shouldVisibleButtonAddTag}
            modeControll={modeControll}
            modeControllEdit={modeControllEdit}
          />
        </div>
      </Descriptions.Item>
      <Descriptions.Item label="Дата назначения">
        {modeControll === 'default' ? (
          <Output className="startDate"> {date[0] ? date[0] : null}</Output>
        ) : modeControll === 'edit' && modeControllEdit ? (
          <DatePicker
            value={
              modeControllEdit
                ? moment(
                    Array.isArray(modeControllEdit.date) && modeControllEdit.date[0]
                      ? modeControllEdit.date[0]
                      : date[0]
                      ? date[0]
                      : moment(),
                    'DD.MM.YYYY',
                  )
                : undefined
            }
            className="dateStartEdit"
            onChange={onChangeEditableStart}
            defaultValue={date[0] ? moment(date[0], 'DD.MM.YYYY') : null}
            format="DD.MM.YYYY"
          />
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Дата завершения">
        {modeControll === 'default' ? (
          <Output className="endDate"> {date[1] ? date[1] : null}</Output>
        ) : modeControll === 'edit' && modeControllEdit ? (
          <DatePicker
            value={
              modeControllEdit
                ? moment(
                    Array.isArray(modeControllEdit.date) && modeControllEdit?.date[1]
                      ? modeControllEdit.date[1]
                      : date[1]
                      ? date[1]
                      : moment(),
                    'DD.MM.YYYY',
                  )
                : undefined
            }
            className="dateEndEdit"
            onChange={onChangeEditableEnd}
            defaultValue={date[1] ? moment(date[1], 'DD.MM.YYYY') : null}
            format="DD.MM.YYYY"
          />
        ) : null}
      </Descriptions.Item>
      <Descriptions.Item label="Затрачено времени">
        <Output>{`${time} ч`}</Output>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default TaskDescription;