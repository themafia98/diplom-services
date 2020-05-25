// @ts-nocheck
import React, { forwardRef, useState, useMemo } from 'react';
import fixedToolbarType from './types';
import _ from 'lodash';
import { Button } from 'antd';

const FixedToolbar = forwardRef((props, ref) => {
  const { customRender, name, onChangeVisibleAction } = props;
  const [visible, setVisible] = useState(false);
  const [useCustomRender] = useState(!_.isNull(customRender));

  const onChangeCustomVisible = () => {
    setVisible((prevVisible) => !prevVisible);
  };

  const visibilityStyle = useMemo(() => {
    return visible ? { display: 'block' } : { display: 'none' };
  }, [visible]);

  return (
    <div ref={ref} className="action-button">
      <Button
        className="runAction-button"
        onClick={useCustomRender ? onChangeCustomVisible : onChangeVisibleAction}
        type="primary"
      >
        {name}
      </Button>
      <div style={visibilityStyle} className="render-wrapper">
        {customRender}
      </div>
    </div>
  );
});

FixedToolbar.defaultProps = {
  customRender: null,
  name: 'Action',
  onChangeVisibleAction: null,
};

FixedToolbar.propTypes = fixedToolbarType;

export default FixedToolbar;
