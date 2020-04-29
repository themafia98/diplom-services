// @ts-nocheck
import React from 'react';
import clsx from 'clsx';
import { Descriptions, Input, Select, DatePicker } from 'antd';
import Output from '../../../Components/Output';
import moment from 'moment';

const { Option } = Select;

function renderDescription(theme = 'default') {
  return ({
    onOpenPageWithData,
    onChangeEditableStart,
    onChangeEditableEnd,
    cachesJurnalList,
    cachesAuthorList,
    onChangeEditable,
    cachesEditorList,
    modeControllEdit,
    statusClassName,
    calcSumWorkTime,
    accessPriority,
    setCurrentTab,
    filteredUsers,
    depModuleName,
    modeControll,
    accessStatus,
    uidCreater,
    priority,
    status,
    isLoad,
    router,
    editor,
    udata,
    name,
    date,
    key,
  }) => {
    return (
      <>
        <Descriptions.Item label="Артикул">
          <Output className="key">{key}</Output>
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
              {accessStatus.map((it) => (
                <Option key={it} value={it}>
                  {it}
                </Option>
              ))}
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
              {accessPriority.map((it) => (
                <Option key={it} value={it}>
                  {it}
                </Option>
              ))}
            </Select>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Автор задачи">
          <Output
            className="author"
            typeOutput="link"
            depModuleName={depModuleName}
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
              depModuleName={depModuleName}
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
              {filteredUsers.map((it) => (
                <Option key={it._id} value={it._id} label={it.displayName}>
                  <span>{it.displayName}</span>
                </Option>
              ))}
            </Select>
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Дата назначения">
          {modeControll === 'default' ? (
            <Output className="startDate"> {date[0] ? date[0] : null}</Output>
          ) : modeControll === 'edit' && modeControllEdit ? (
            <DatePicker
              value={moment(
                modeControllEdit?.date[0] ? modeControllEdit.date[0] : date[0] ? date[0] : moment(),
                'DD.MM.YYYY',
              )}
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
              value={moment(
                modeControllEdit?.date[1] ? modeControllEdit.date[1] : date[1] ? date[1] : moment(),
                'DD.MM.YYYY',
              )}
              className="dateEndEdit"
              onChange={onChangeEditableEnd}
              defaultValue={date[1] ? moment(date[1], 'DD.MM.YYYY') : null}
              format="DD.MM.YYYY"
            />
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="Затрачено времени">
          <Output>{`${calcSumWorkTime(cachesJurnalList)} ч`}</Output>
        </Descriptions.Item>
      </>
    );
  };
}

export default renderDescription;
