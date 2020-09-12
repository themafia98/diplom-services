import React, { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';
import { ChromePicker } from 'react-color';
import { tagsContainerType } from './TagsContainer.types';
import { Input, Tag, Button, Tooltip } from 'antd';

const TagsContainer = ({
  shouldVisibleButtonAddTag,
  modeControll,
  modeControllEdit,
  tagList,
  onChangeTagList,
}) => {
  const setTagList = useCallback(onChangeTagList, [onChangeTagList]);

  const [hex, setHex] = useState('#2db7f5');
  const [colorVisible, setVisible] = useState(false);
  const [tagValue, setTagValue] = useState('');

  const onCloseTag = (id) => {
    setTagList(tagList.filter(({ id: tagId = '' }) => tagId !== id));
  };

  const onClick = (event) => onKeyDown(event, true);

  const onKeyDown = (event, click = false) => {
    event.stopPropagation();
    const { key = '', ctrlKey } = event;
    if (!click && (key !== 'Enter' || !ctrlKey || !tagValue)) return;

    if (colorVisible) setVisible(false);

    setTagValue('');

    setTagList([
      ...tagList,
      {
        color: hex,
        id: `${uuid()}`,
        sortable: false,
        tagValue,
      },
    ]);
  };

  const onChange = ({ target: { value = '' } }) => {
    setTagValue(value);
  };

  const onChangeVisible = () => setVisible((prevVisible) => !prevVisible);

  const onChangeColor = ({ hex = '' }) => {
    setHex(hex);
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
          <div className="input-controls">
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
            <Button type="primary" onClick={onChangeVisible}>
              Выбрать цвет
            </Button>
            <div className={clsx('color-wrapper', colorVisible ? 'visible' : 'hidden')}>
              <ChromePicker color={hex} onChange={onChangeColor} />
            </div>
          </div>
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
  tagList: [],
  onChangeTagList: null,
};
TagsContainer.propTypes = tagsContainerType;

export default TagsContainer;
