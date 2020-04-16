import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button } from 'antd';
import _ from 'lodash';

class Output extends React.PureComponent {
  state = {
    showTooltip: false,
    widthChild: null,
    widthParent: null,
  };

  child = null;
  parent = null;
  childRef = node => (this.child = node);
  parentRef = node => (this.parent = node);

  componentDidMount = () => {
    const { showTooltip, widthChild, widthParent } = this.state;
    const { typeOutput } = this.props;
    if (_.isNull(widthChild) && _.isNull(widthParent) && !showTooltip && this.child && this.parent) {
      const children = typeOutput === 'link' ? this.child?.buttonNode?.firstChild : this.child;

      const childW = children.getBoundingClientRect().width;
      const parentW = this.parent.getBoundingClientRect().width;
      this.setState({
        ...this.state,
        showTooltip: childW > parentW,
        widthChild: childW,
        widthParent: parentW,
      });
    }
  };

  componentDidUpdate = () => {
    const { showTooltip, widthChild, widthParent } = this.state;
    const { typeOutput } = this.props;
    if (!_.isNull(widthChild) && !_.isNull(widthParent) && this.child && this.parent) {
      const children = typeOutput === 'link' ? this.child?.buttonNode?.firstChild : this.child;

      const childW = children.getBoundingClientRect().width;
      const parentW = this.parent.getBoundingClientRect().width;

      const showTooltipUpdate = childW > parentW;

      if (showTooltipUpdate !== showTooltip) {
        return this.setState({
          ...this.state,
          showTooltip: showTooltipUpdate,
          widthChild: childW,
          widthParent: parentW,
        });
      }
    }
  };

  onOpenLink = ({ id = null, action = null }) => {
    console.log('id:', id);
    console.log('action', action);
  };

  render() {
    const { className, children, type, typeOutput = '', id = null, action = null } = this.props;
    const { showTooltip } = this.state;
    if (type === 'table') {
      const output = (
        <td>
          <div className="output" ref={this.parentRef}>
            {typeOutput === 'link' ? (
              <Button
                onClick={this.onOpenLink.bind(this, { action, id })}
                type={typeOutput}
                ref={this.childRef}
                className={className ? className : null}
              >
                {children}
              </Button>
            ) : (
              <span ref={this.childRef} className={className ? className : null}>
                {children}
              </span>
            )}
          </div>
        </td>
      );
      if (!showTooltip) return output;
      else
        return (
          <Tooltip className="pointerTooltip" placement="topLeft" title={children}>
            {output}
          </Tooltip>
        );
    } else {
      const output = (
        <div className="output" ref={this.parentRef}>
          {typeOutput === 'link' ? (
            <Button
              onClick={this.onOpenLink.bind(this, { action, id })}
              type={typeOutput}
              ref={this.childRef}
              className={className ? className : null}
            >
              {children}
            </Button>
          ) : (
            <span ref={this.childRef} className={className ? className : null}>
              {children}
            </span>
          )}
        </div>
      );
      if (!showTooltip) return output;
      else
        return (
          <Tooltip placement="topLeft" title={children}>
            {output}
          </Tooltip>
        );
    }
  }
}

Output.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string, () => null]),
  type: PropTypes.string,
};

export default Output;
