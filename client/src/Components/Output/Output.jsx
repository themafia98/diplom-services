import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { routePathNormalise } from '../../Utils';
import { Tooltip, Button, message } from 'antd';
import _ from 'lodash';
import modelContext from '../../Models/context';

class Output extends React.PureComponent {
  state = {
    showTooltip: false,
    widthChild: null,
    widthParent: null,
  };

  static contextType = modelContext;

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

  onOpenLink = ({ id: key = null, action = null }) => {
    const {
      udata: { _id: uid = '' } = {},
      router: { actionTabs = [] } = {},
      currentData = {},
      removeTab,
      onOpenPageWithData,
      setCurrentTab,
    } = this.props;

    const isCurrentUser = uid === key;
    const { config = {} } = this.context;

    if (config.tabsLimit <= actionTabs.length)
      return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

    const page = `${action}Module`;
    const moduleId = !isCurrentUser ? 'personalPage' : '';
    const path = !isCurrentUser ? `${page}_${moduleId}__${key}` : page;

    // @ts-ignore
    const activePage = routePathNormalise({
      pathType: isCurrentUser ? 'module' : 'moduleItem',
      pathData: { page, moduleId, key },
    });

    if (!key || !page) return;

    const index = actionTabs.findIndex(tab => tab.includes(page) && tab.includes(key));
    const isFind = index !== -1;

    let type = 'deafult';
    if (path.split('__')[1]) type = 'itemTab';

    if (!isFind) {
      onOpenPageWithData({
        activePage,
        routeDataActive: { ...currentData, key },
      });
    } else {
      setCurrentTab(actionTabs[index]);
    }
  };

  render() {
    const { className, children, type, typeOutput = '', id = null, action = null } = this.props;
    const { showTooltip } = this.state;
    if (type === 'table') {
      const output = (
        <td>
          <div className={clsx('output', typeOutput ? 'withType' : null)} ref={this.parentRef}>
            {typeOutput ? (
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
          {typeOutput ? (
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
