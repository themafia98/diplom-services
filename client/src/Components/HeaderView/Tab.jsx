import React, { useState, createRef, useEffect } from "react";
import _ from "lodash";
import { Icon } from "antd";

const Tab = ({
    value,
    active,
    hendlerTab: callbackHendlerTab,
    cbCallbackResize,
    itemKey,
    wrapperRight,
    cdResize,
    sizeCount,
    items,
}) => {
    const [saveKey] = useState(itemKey);
    const [resizeUse, setResizeUse] = useState(false);
    const [tabNode, setNode] = useState(null);
    const [resize, setResize] = useState(sizeCount);
    const tabRef = createRef();
    const eventHandler = event => {
        event.stopPropagation();
        callbackHendlerTab(event, saveKey, "open");
    };

    const eventCloseHandler = event => {
        event.stopPropagation();
        if (saveKey === "mainModule") return;
        cbCallbackResize(resize);
        callbackHendlerTab(event, saveKey, "close", resize);
    };

    useEffect(() => {
        console.log("asd");
        const tabNode = tabRef.current.getBoundingClientRect().right;
        if (tabNode > wrapperRight && !_.isNull(wrapperRight) && !resizeUse) cdResize(resize);
        if (tabNode < wrapperRight && resize !== 10 && sizeCount !== 10) {
            cbCallbackResize(10);
        }
        setResizeUse(true);
        if (!_.isNull(tabNode) && tabNode) setNode(tabNode);
    }, [tabRef, wrapperRight, resize, cbCallbackResize, cdResize, resizeUse, sizeCount]);
    return (
        <li
            style={{ flex: `0 0 ${resize}%` }}
            onClick={callbackHendlerTab ? eventHandler : null}
            className={[active ? "active" : null].join(" ")}
            key={saveKey}
            ref={tabRef}
        >
            <span className={[active ? "selected" : null].join(" ")}>{value}</span>
            <Icon
                className={["closeTab", tabNode > wrapperRight && resize <= 7 ? "resizeTab" : null].join(" ")}
                onClick={callbackHendlerTab ? eventCloseHandler : null}
                type="close"
            />
        </li>
    );
};

export default Tab;
