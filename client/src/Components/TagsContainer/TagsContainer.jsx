// @ts-nocheck
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';
import { ChromePicker } from 'react-color';
import { tagsContainerType } from './types';
import { Input, Tag, Button, Tooltip } from 'antd';

const TagsContainer = (props) => {
  const { shouldVisibleButtonAddTag, modeControll, modeControllEdit } = props;

  const [hex, setHex] = useState('#2db7f5');
  const [colorVisible, setVisible] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const [tagList, setTagList] = useState([]);

  const onCloseTag = (id) => {
    setTagList(tagList.filter(({ id: tagId = '' }) => tagId !== id));
  };

  const onClick = (event) => onKeyDown(event, true);

  const onKeyDown = (event, click = false) => {
    event.stopPropagation();
    const { key = '', ctrlKey } = event;
    if (!click && (key !== 'Enter' || !ctrlKey || !tagValue)) return;
    setTagValue('');
    setTagList([
      ...tagList,
      {
        color: hex,
        id: `virtual__${uuid()}`,
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
            <Button onClick={onChangeVisible}>Выбрать цвет</Button>
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
};
TagsContainer.propTypes = tagsContainerType;

export default TagsContainer;
