// @ts-nocheck
import React, { useState } from 'react';
import { tagsContainerType } from './types';
import { Input, Tag, Button, Tooltip } from 'antd';

const TagsContainer = (props) => {
  const { shouldVisibleButtonAddTag, modeControll, modeControllEdit } = props;

  const [tagValue, setTagValue] = useState('');
  const [tagList, setTagList] = useState([
    {
      color: '#2db7f5',
      id: Math.random(),
      tagValue: 'hi',
    },
  ]);

  const onCloseTag = (id) => {
    setTagList(tagList.filter(({ id: tagId = '' }) => tagId !== id));
  };
  const onClick = (event) => onKeyDown(event, true);

  const onKeyDown = (event, click = false) => {
    event.stopPropagation();
    const { key = '', ctrlKey } = event;
    if ((key !== 'Enter' && !ctrlKey && !click) || !tagValue) return;
    setTagValue('');
    setTagList([
      ...tagList,
      {
        color: '#2db7f5',
        id: Math.random(),
        tagValue: 'hi',
      },
    ]);
  };

  const onChange = ({ target: { value = '' } }) => {
    setTagValue(value);
  };

  const isEditable = modeControll === 'edit' && modeControllEdit;

  return (
    <>
      {tagList.map((tag) => {
        const { color = '', id = '', tagValue = '' } = tag;
        const editableTabProps = isEditable
          ? {
              closable: true,
              onClose: onCloseTag.bind(this, id),
            }
          : {};
        return (
          <Tag color={color} key={id} {...editableTabProps}>
            {tagValue}
          </Tag>
        );
      })}
      {isEditable ? (
        <div className="tags-controllers">
          <Tooltip
            placement="top"
            mouseEnterDelay={1}
            trigger="hover"
            title="Что бы добавить новый тег нажмите на комбинацию клавиш Ctrl+Enter"
          >
            <Input
              value={tagValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder="добавление новых тегов"
              type="text"
            />
          </Tooltip>
          {shouldVisibleButtonAddTag ? (
            <Button onClick={onClick} type="primary" size="small">
              Добавить
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

TagsContainer.defaultProps = {
  shouldVisibleButtonAddTag: false,
  modeControll: 'default',
  modeControllEdit: false,
};
TagsContainer.propTypes = tagsContainerType;

export default TagsContainer;
