import React, { memo, Fragment, createRef, useEffect, useCallback, useState, useMemo } from 'react';
import _ from 'lodash';
import { outputType } from './Output.types';
import clsx from 'clsx';
import { Tooltip, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { openTab } from 'Redux/middleware/routerReducer.thunk';

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

    const { current: childNode } = childRef;
    const { current: parentNode } = parentRef;

    useEffect(() => {
      const isDefaultList = isChildrenList && typeOutput === 'default';
      if (
        [widthChild, widthParent].every((type) => type === null) &&
        !showTooltip &&
        childNode &&
        parentNode
      ) {
        const { buttonNode = {} } = childNode;
        const isLink = typeOutput === 'link';
        const childrenNode = isLink ? buttonNode?.firstChild : buttonNode ? buttonNode : childNode;

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
    }, [childNode, isChildrenList, parentNode, showTooltip, typeOutput, widthChild, widthParent]);

    const onOpenLink = useCallback(
      (uuid, action, event) => {
        if (event) event.stopPropagation();

        dispatch(openTab({ uuid, action, data: currentData, depKey: depDataKey }));
      },
      [currentData, depDataKey, dispatch],
    );

    const createHandleOpenLink = useCallback(
      (id, action) => {
        if (!id) {
          return null;
        }
        return (event) => onOpenLink(id, action, event);
      },
      [onOpenLink],
    );

    const renderLinks = useCallback(
      (item, mode = 'default') => {
        if ((!isLoad && Array.isArray(item) && !item.length) || !item) {
          return null;
        }

        if (!Array.isArray(item) || mode === 'single') {
          const { displayName, _id: id } = item;
          const displayValue = typeof item === 'string' ? item : displayName;

          if (typeOutput && typeOutput !== 'default') {
            return (
              <Button
                onClick={createHandleOpenLink(id || displayValue, 'cabinet')}
                type="link"
                key={`${id}-editor`}
                className="editor"
              >
                {displayValue}
              </Button>
            );
          }

          return <span className="list-item">{displayValue}</span>;
        }

        return item.map((it, index) => {
          const { displayValue, displayName, _id, id } = it || {};
          const uuid = id || _id;
          return (
            <Fragment key={`${index}${_id}${id}`}>
              {typeOutput && typeOutput !== 'default' ? (
                <Button
                  onClick={createHandleOpenLink(uuid, 'cabinet')}
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
      [createHandleOpenLink, isLoad, typeOutput],
    );

    const renderDefault = useCallback(
      (list, className, isLink, value) => {
        return (
          <>
            {list ? (
              <div
                ref={childRef}
                className={clsx('output-list-wrapper', className, 'list-mode', isLink && 'link')}
              >
                {value}
              </div>
            ) : (
              <span ref={childRef} className={clsx(className, isLink && 'link')}>
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
            <div className={clsx('output', outputClassName, typeOutput && 'withType')} ref={parentRef}>
              {typeOutput && typeOutput !== 'default' ? (
                <>
                  {value && typeof value === 'object' ? (
                    renderLinks(value, 'single')
                  ) : (
                    <Button
                      key={`${id}`}
                      onClick={createHandleOpenLink(id, action)}
                      type={typeOutput}
                      ref={childRef}
                      className={className}
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
        createHandleOpenLink,
        id,
        isLink,
        list,
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

    const value = useMemo(() => {
      if (shouldBeRunRenderLinks) {
        return null;
      }

      const isLinkStringValue = typeOutput === 'link' && Array.isArray(links);

      if (!isStaticList && Array.isArray(links)) {
        return renderLinks(
          links.reduce((links, link) => {
            if (isChildrenList && children.some((child) => child === link?._id)) {
              return [...links, { displayValue: link?.displayName, id: link?._id }];
            }
            return links;
          }, []),
        );
      }

      if (isChildrenList) {
        return renderLinks(
          children.map((link) => {
            return { displayValue: link?.displayName, id: link?._id };
          }),
        );
      }

      if (isLinkStringValue) {
        return renderLinks(links.find(({ _id }) => _id === children) || '', 'signle');
      }
      return children;
    }, [typeOutput, children, isChildrenList, isStaticList, links, renderLinks, shouldBeRunRenderLinks]);

    const output = useMemo(
      () => (
        <div className={clsx('output', outputClassName ? outputClassName : null)} ref={parentRef}>
          {typeOutput && typeOutput !== 'default' && !Array.isArray(children) ? (
            <Button
              onClick={createHandleOpenLink(id, action)}
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
        createHandleOpenLink,
        id,
        isLink,
        list,
        outputClassName,
        parentRef,
        renderDefault,
        typeOutput,
        value,
      ],
    );

    if (type === 'table') {
      return renderTableOutput(children);
    }

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
