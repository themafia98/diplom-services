import React, { memo, Fragment, createRef, useEffect, useCallback, useState, useMemo } from 'react';
import _ from 'lodash';
import { outputType } from './Output.types';
import clsx from 'clsx';
import { Tooltip, Button, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { openTab } from 'Redux/actions/routerActions/middleware';

const Output = memo(
  ({
    typeOutput,
    children,
    links,
    className,
    type,
    id,
    action,
    list,
    isLink,
    isStaticList,
    outputClassName,
    currentData,
    depDataKey,
    isLoad,
  }) => {
    const dispatch = useDispatch();
    const isChildrenList = Array.isArray(children);

    const [showTooltip, setShowTooltip] = useState(false);
    const [widthChild, setWidthChild] = useState(null);
    const [widthParent, setWidthParent] = useState(null);

    const parentRef = createRef(null);
    const childRef = createRef(null);

    const update = useCallback(() => {
      const isDefaultList = isChildrenList && typeOutput === 'default';
      const { current: childNode = null } = childRef;
      const { current: parentNode = null } = parentRef;
      if (
        [widthChild, widthParent].every((type) => type === null) &&
        !showTooltip &&
        childNode &&
        parentNode
      ) {
        const { buttonNode = {} } = childNode;
        const isLink = typeOutput === 'link';
        const childrenNode = isLink ? buttonNode?.firstChild : buttonNode ? buttonNode : childRef?.current;

        const isEmptyNode = childrenNode && typeof childrenNode === 'object' && _.isEmpty(childrenNode);

        const childWidth =
          !isEmptyNode && !isDefaultList && childrenNode?.hasOwnProperty('getBoundingClientRect')
            ? childrenNode?.getBoundingClientRect()?.width
            : isDefaultList && childrenNode?.children
            ? Array.from(childrenNode?.children).reduce((total, elem) => total + elem?.offsetWidth, 0)
            : null;

        const { width: parentWidth = null } = parentNode?.getBoundingClientRect() || {};
        const shouldShowTooltip = childWidth > parentWidth;

        if (
          [childWidth, parentWidth].every((type) => type !== null) &&
          (widthChild !== childWidth || widthParent !== parentWidth || shouldShowTooltip !== showTooltip)
        ) {
          setShowTooltip(childWidth > parentWidth);
          setWidthChild(childWidth);
          setWidthParent(parentWidth);
        }
      }
    }, [childRef, isChildrenList, parentRef, showTooltip, typeOutput, widthChild, widthParent]);

    useEffect(() => {
      update();
    }, [update]);

    const onOpenLink = useCallback(
      ({ id: uuid = null, action = null }, event) => {
        if (event) event.stopPropagation();

        dispatch(openTab({ uuid, action, data: currentData, depKey: depDataKey }));
      },
      [currentData, depDataKey, dispatch],
    );

    const renderLinks = useCallback(
      (item = '', mode = 'default') => {
        if ((!isLoad && Array.isArray(item) && !item.length) || !item) return <Spin size="small" />;

        if (!Array.isArray(item) || mode === 'single') {
          const { displayName = '', _id: id = '' } = item || {};
          const displayValue = typeof item === 'string' ? item : displayName;

          return (
            <>
              {typeOutput && typeOutput !== 'default' ? (
                <Button
                  onKeyDown={id ? onOpenLink.bind(this, { id, action: 'cabinet' }) : null}
                  type="link"
                  key={`${id}-editor`}
                  className="editor"
                >
                  {displayValue}
                </Button>
              ) : (
                <span className="list-item">{displayValue}</span>
              )}
            </>
          );
        }

        return item.map((it, index) => {
          const { displayValue = '', displayName = '', _id = '', id = '' } = it || {};
          return (
            <Fragment key={`${index}${_id}${id}`}>
              {typeOutput && typeOutput !== 'default' ? (
                <Button
                  onClick={id || _id ? onOpenLink.bind(this, { id: id ? id : _id, action: 'cabinet' }) : null}
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
            </Fragment>
          );
        });
      },
      [isLoad, onOpenLink, typeOutput],
    );

    const renderDefault = useCallback(
      (list, className, isLink, value) => {
        return (
          <>
            {list ? (
              <div
                ref={childRef}
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
              <span ref={childRef} className={clsx(className ? className : null, isLink ? 'link' : null)}>
                {value}
              </span>
            )}
          </>
        );
      },
      [childRef],
    );

    const renderTableOutput = useCallback(
      (value) => {
        const output = (
          <td>
            <div
              className={clsx(
                'output',
                outputClassName ? outputClassName : null,
                typeOutput ? 'withType' : null,
              )}
              ref={parentRef}
            >
              {typeOutput && typeOutput !== 'default' ? (
                <>
                  {value && typeof value === 'object' ? (
                    renderLinks(value, 'single')
                  ) : (
                    <Button
                      key={`${id}`}
                      onClick={onOpenLink.bind(this, { action, id })}
                      type={typeOutput}
                      ref={childRef}
                      className={className ? className : null}
                    >
                      {value}
                    </Button>
                  )}
                </>
              ) : (
                renderDefault(list, className, isLink, value)
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
      },
      [
        action,
        childRef,
        className,
        id,
        isLink,
        list,
        onOpenLink,
        outputClassName,
        parentRef,
        renderDefault,
        renderLinks,
        showTooltip,
        typeOutput,
      ],
    );

    const shouldRenderList = links || isStaticList;
    const shouldBeRunRenderLinks =
      shouldRenderList && isChildrenList && links && typeof children === 'string';

    const value = useMemo(
      () =>
        shouldBeRunRenderLinks
          ? null
          : renderLinks(
              !isStaticList && Array.isArray(links)
                ? links
                    .reduce((links, link) => {
                      if (children.some((child) => child === link?._id)) {
                        return [...links, { displayValue: link?.displayName, id: link?._id }];
                      }
                      return links;
                    }, [])
                    .sort((a, b) => a?.displayName - b?.displayName)
                : isChildrenList
                ? children.map((link) => {
                    return { displayValue: link?.displayName, id: link?._id };
                  })
                : children,
            ),
      [children, isChildrenList, isStaticList, links, renderLinks, shouldBeRunRenderLinks],
    );

    const output = useMemo(
      () => (
        <div className={clsx('output', outputClassName ? outputClassName : null)} ref={parentRef}>
          {typeOutput && typeOutput !== 'default' && !Array.isArray(children) ? (
            <Button
              onClick={onOpenLink.bind(this, { action, id })}
              type={typeOutput}
              ref={childRef}
              className={className ? className : null}
            >
              {value}
            </Button>
          ) : (
            renderDefault(list, className, isLink, value)
          )}
        </div>
      ),
      [
        action,
        childRef,
        children,
        className,
        id,
        isLink,
        list,
        onOpenLink,
        outputClassName,
        parentRef,
        renderDefault,
        typeOutput,
        value,
      ],
    );

    if (type === 'table') return renderTableOutput(children);

    if (shouldBeRunRenderLinks) {
      return renderLinks(links.find((link) => link?._id === children));
    }

    if (!showTooltip) return output;
    else
      return (
        <Tooltip placement="topLeft" title={value}>
          {output}
        </Tooltip>
      );
  },
);

Output.propTypes = outputType;
Output.defaultProps = {
  data: null,
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

export default Output;
