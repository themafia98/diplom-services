import React from 'react';
import { outputType } from './types';
import clsx from 'clsx';
import { Tooltip, Button, Spin } from 'antd';
import ModelContext from 'Models/context';
import { connect } from 'react-redux';
import { openTab } from 'Redux/actions/routerActions/middleware';

class Output extends React.PureComponent {
  state = {
    showTooltip: false,
    widthChild: null,
    widthParent: null,
  };

  static contextType = ModelContext;
  static propTypes = outputType;
  static defaultProps = {
    data: {},
    depDataKey: '',
    children: '',
    id: '',
    action: '',
    typeOutput: '',
    isLoad: false,
    links: null,
    className: '',
    type: '',
    list: false,
    isLink: false,
    isStaticList: false,
    outputClassName: '',
  };

  child = null;
  parent = null;
  childRef = (node) => (this.child = node);
  parentRef = (node) => (this.parent = node);

  componentDidMount = () => {
    const { showTooltip, widthChild, widthParent } = this.state;
    const { typeOutput, children: child } = this.props;
    const isDefaultList = Array.isArray(child) && typeOutput === 'default';
    if (
      [widthChild, widthParent].every((type) => type === null) &&
      !showTooltip &&
      this.child &&
      this.parent
    ) {
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

      if ([childW, parentW].every((type) => type !== null))
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

    const isDefaultList = Array.isArray(child) && typeOutput === 'default';
    if ([widthChild, widthParent].every((type) => type !== null) && this.child && this.parent) {
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

      if ([childW, parentW].some((type) => type === null)) return;

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

  onOpenLink = ({ id: uuid = null, action = null }, event) => {
    if (event) event.stopPropagation();
    const { currentData: data, depDataKey: depKey, onOpenTab } = this.props;

    onOpenTab({ uuid, action, data, depKey });
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

  renderTableOutput = (value) => {
    const { className, typeOutput, id, action, list, isLink, outputClassName } = this.props;
    const { showTooltip } = this.state;
    const output = (
      <td>
        <div
          className={clsx('output', outputClassName ? outputClassName : null, typeOutput ? 'withType' : null)}
          ref={this.parentRef}
        >
          {typeOutput && typeOutput !== 'default' ? (
            <>
              {value && typeof value === 'object' ? (
                this.renderLinks(value, 'single')
              ) : (
                <Button
                  key={`${id}`}
                  onClick={this.onOpenLink.bind(this, { action, id })}
                  type={typeOutput}
                  ref={this.childRef}
                  className={className ? className : null}
                >
                  {value}
                </Button>
              )}
            </>
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
  };

  render() {
    const {
      links,
      className,
      children,
      type,
      typeOutput,
      id,
      action,
      list,
      isLink,
      isStaticList,
      outputClassName,
    } = this.props;
    const { showTooltip } = this.state;
    let value = children;

    if (type === 'table') return this.renderTableOutput(value);

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

    const output = (
      <div className={clsx('output', outputClassName ? outputClassName : null)} ref={this.parentRef}>
        {typeOutput && typeOutput !== 'default' && !Array.isArray(children) ? (
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

const mapStateTopProps = (state) => {
  const { appConfig } = state.publicReducer;
  return {
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onOpenTab: (param) => dispatch(openTab(param)),
  };
};

export default connect(mapStateTopProps, mapDispatchToProps)(Output);
