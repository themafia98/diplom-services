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
    const { typeOutput, children: child } = this.props;
    const isDefaultList = _.isArray(child) && typeOutput === 'default';
    if (_.isNull(widthChild) && _.isNull(widthParent) && !showTooltip && this.child && this.parent) {
      let children =
        typeOutput === 'link'
          ? this.child?.buttonNode?.firstChild
          : this.child?.buttonNode
          ? this.child?.buttonNode
          : this.child;

      const childW =
        children && !isDefaultList
          ? children.getBoundingClientRect().width
          : isDefaultList && children
          ? Array.from(children?.children).reduce((total, elem) => total + elem?.offsetWidth, 0)
          : null;
      const parentW = this.parent ? this.parent.getBoundingClientRect().width : null;

      if (!_.isNull(childW) && !_.isNull(parentW))
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
    const { typeOutput, children: child } = this.props;

    const isDefaultList = _.isArray(child) && typeOutput === 'default';
    if (!_.isNull(widthChild) && !_.isNull(widthParent) && this.child && this.parent) {
      const children =
        typeOutput === 'link'
          ? this.child?.buttonNode?.firstChild
          : this.child?.buttonNode
          ? this.child?.buttonNode
          : this.child;

      const childW =
        children && !isDefaultList
          ? children.getBoundingClientRect().width
          : isDefaultList && children
          ? Array.from(children?.children).reduce((total, elem) => total + elem?.offsetWidth, 0)
          : null;
      const parentW = this.parent ? this.parent.getBoundingClientRect().width : null;

      if (_.isNull(childW) || _.isNull(parentW)) return;

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

  onOpenLink = ({ id: key = null, action = null }, event) => {
    if (event) event.stopPropagation();

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
    const moduleId = !isCurrentKey ? 'personalPage' : '';

    if (!currentDataState && depModuleName && routeData[depModuleName]) {
      const store = action?.includes('cabinet') ? 'users' : action;
      const { [store]: storeList = [] } = routeData[depModuleName] || {};

      currentData = storeList.find((it) => it?._id === key) || {};
    }

    if (!key || !page || !currentData || (currentData && _.isEmpty(currentData))) {
      return;
    }

    const activePage = routePathNormalise({
      pathType: isCurrentKey ? 'module' : 'moduleItem',
      pathData: { page, moduleId, key },
    });

    const index = actionTabs.findIndex(
      (tab) => (isCurrentKey && tab === page) || (tab.includes(page) && tab.includes(key)),
    );
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

  renderLinks = (item = '', mode = 'default') => {
    const { isLoad = false, typeOutput = '' } = this.props;
    if ((!isLoad && Array.isArray(item) && !item.length) || !item) return <Spin size="small" />;

    if (!Array.isArray(item) || mode === 'single') {
      const { displayName = '', _id: id = '' } = item || {};

      return (
        <>
          {typeOutput && typeOutput !== 'default' ? (
            <Button
              onKeyDown={id ? this.onOpenLink.bind(this, { id, action: 'cabinet' }) : null}
              type="link"
              key={`${id}-editor`}
              className="editor"
            >
              {displayName}
            </Button>
          ) : (
            <span className="list-item"> {displayName}</span>
          )}
        </>
      );
    }

    return item.map((it, index) => {
      const { displayValue = '', displayName = '', _id = '', id = '' } = it || {};
      return (
        <React.Fragment key={`${index}${_id}${id}`}>
          {typeOutput && typeOutput !== 'default' ? (
            <Button
              onClick={
                id || _id ? this.onOpenLink.bind(this, { id: id ? id : _id, action: 'cabinet' }) : null
              }
              type="link"
              key={`${index}${_id}`}
              className="editor"
            >
              {displayValue || displayName}
            </Button>
          ) : (
            <span key={`${index}${_id}`} className="list-item">
              {displayValue || displayName}
            </span>
          )}
        </React.Fragment>
      );
    });
  };

  renderDefault = (list, className, isLink, value) => {
    return (
      <>
        {list ? (
          <div
            ref={this.childRef}
            className={clsx(
              'output-list-wrapper',
              className ? className : null,
              'list-mode',
              isLink ? 'link' : null,
            )}
          >
            {value}
          </div>
        ) : (
          <span ref={this.childRef} className={clsx(className ? className : null, isLink ? 'link' : null)}>
            {value}
          </span>
        )}
      </>
    );
  };

  render() {
    const {
      links = null,
      className = '',
      children,
      type,
      typeOutput,
      id,
      action,
      list = false,
      isLink = false,
      isStaticList = false,
      outputClassName = '',
    } = this.props;
    const { showTooltip } = this.state;
    let value = children;

    if (links || isStaticList) {
      if (Array.isArray(children)) {
        const linksList = !isStaticList
          ? links
              .reduce((links, link) => {
                if (children.some((child) => child === link?._id)) {
                  return [...links, { displayValue: link?.displayName, id: link?._id }];
                }
                return links;
              }, [])
              .sort((a, b) => a?.displayName - b?.displayName)
          : children.map((link) => {
              return { displayValue: link?.displayName, id: link?._id };
            });

        value = this.renderLinks(linksList);
      } else if (links) return this.renderLinks(links.find((link) => link?._id === children));
    }
    if (type === 'table') {
      const output = (
        <td>
          <div
            className={clsx(
              'output',
              outputClassName ? outputClassName : null,
              typeOutput ? 'withType' : null,
            )}
            ref={this.parentRef}
          >
            {typeOutput && typeOutput !== 'default' ? (
              <Button
                key={`${id}`}
                onClick={this.onOpenLink.bind(this, { action, id })}
                type={typeOutput}
                ref={this.childRef}
                className={className ? className : null}
              >
                {_.isPlainObject(value) ? this.renderLinks(value, 'single') : value}
              </Button>
            ) : (
              this.renderDefault(list, className, isLink, value)
            )}
          </div>
        </td>
      );
      if (!showTooltip) return output;
      else
        return (
          <Tooltip className="pointerTooltip" placement="topLeft" title={value}>
            {output}
          </Tooltip>
        );
    } else {
      const output = (
        <div className={clsx('output', outputClassName ? outputClassName : null)} ref={this.parentRef}>
          {typeOutput && typeOutput !== 'default' ? (
            <Button
              onClick={this.onOpenLink.bind(this, { action, id })}
              type={typeOutput}
              ref={this.childRef}
              className={className ? className : null}
            >
              {value}
            </Button>
          ) : (
            this.renderDefault(list, className, isLink, value)
          )}
        </div>
      );
      if (!showTooltip) return output;
      else
        return (
          <Tooltip placement="topLeft" title={value}>
            {output}
          </Tooltip>
        );
    }
  }
}

export default Output;
