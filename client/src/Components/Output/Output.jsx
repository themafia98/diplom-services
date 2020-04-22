// @ts-nocheck
import React from 'react';
import { outputType } from './types';
import clsx from 'clsx';
import { routePathNormalise } from '../../Utils';
import { Tooltip, Button, message, Spin } from 'antd';
import _ from 'lodash';
import modelContext from '../../Models/context';

class Output extends React.PureComponent {
  state = {
    showTooltip: false,
    widthChild: null,
    widthParent: null,
  };

  static contextType = modelContext;
  static propTypes = outputType;
  static defaultProps = {
    children: '',
    id: '',
    action: '',
    typeOutput: '',
  };

  child = null;
  parent = null;
  childRef = (node) => (this.child = node);
  parentRef = (node) => (this.parent = node);

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
      router: { actionTabs = [], routeData = {} } = {},
      onOpenPageWithData,
      currentData: currentDataState = null,
      setCurrentTab,
      depModuleName = '',
    } = this.props;

    const isCurrentKey = uid === key;
    const { config = {} } = this.context;

    if (config.tabsLimit <= actionTabs.length)
      return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

    let currentData = currentDataState;
    const page = `${action}Module`;
    const moduleId = !isCurrentUser ? 'personalPage' : '';

    if (!currentDataState && depModuleName && routeData[depModuleName]) {
      const store = action?.includes('cabinet') ? 'users' : action;
      const { [store]: storeList = [] } = routeData[depModuleName] || {};

      currentData = storeList.find((it) => it?._id === key) || {};
    }

    if (!key || !page || !currentData || (currentData && _.isEmpty(currentData))) {
      return message.warn('По ссылке ничего не найдено.');
    }

    const activePage = routePathNormalise({
      pathType: isCurrentKey ? 'module' : 'moduleItem',
      pathData: { page, moduleId, key },
    });

    const index = actionTabs.findIndex((tab) => tab.includes(page) && tab.includes(key));
    const isFind = index !== -1;

    if (!isFind && onOpenPageWithData) {
      onOpenPageWithData({
        activePage,
        routeDataActive: { ...currentData, key },
      });
    } else if (setCurrentTab) {
      setCurrentTab(actionTabs[index]);
    }
  };

  renderList = (items = []) => {
    if (items && !items.length) return <Spin size="small" />;
    return items.map((it, index) => {
      const { displayValue = '', id = '' } = it || {};
      return (
        <Button
          onClick={id ? this.onOpenLink.bind(this, { id, action: 'cabinet' }) : null}
          type="link"
          key={`${index}${id}`}
          className="editor"
        >
          {displayValue}
        </Button>
      );
    });
  };

  render() {
    const {
      links = null,
      className,
      children,
      type,
      typeOutput,
      id,
      action,
      list = false,
      isLink = false,
    } = this.props;
    const { showTooltip } = this.state;
    let value = children;
    if (Array.isArray(children) && links) {
      value = this.renderList(
        links
          .map((link) => {
            if (children.some((child) => child === link?._id)) {
              return { displayValue: link.displayName, id: link?._id };
            }
            return null;
          })
          .filter(Boolean),
      );
    }
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
                {value}
              </Button>
            ) : (
              <span
                ref={this.childRef}
                className={clsx(
                  className ? className : null,
                  list ? 'list-mode' : null,
                  isLink ? 'link' : null,
                )}
              >
                {value}
              </span>
            )}
          </div>
        </td>
      );
      if (!showTooltip) return output;
      else
        return (
          <Tooltip className="pointerTooltip" placement="topLeft" title={value}>
            {value}
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
              {value}
            </Button>
          ) : (
            <span
              ref={this.childRef}
              className={clsx(
                className ? className : null,
                list ? 'list-mode' : null,
                isLink ? 'link' : null,
              )}
            >
              {value}
            </span>
          )}
        </div>
      );
      if (!showTooltip) return output;
      else
        return (
          <Tooltip placement="topLeft" title={value}>
            {value}
          </Tooltip>
        );
    }
  }
}

export default Output;
