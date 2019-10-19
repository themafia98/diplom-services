import React, { useState, createRef, useEffect } from "react";
import { Icon } from "antd";

const Tab = ({ value, active, hendlerTab: callbackHendlerTab, itemKey, wrapperRight }) => {
    const [saveKey] = useState(itemKey);
    const tabRef = createRef();

    const eventHandler = event => {
        event.stopPropagation();
        callbackHendlerTab(event, saveKey, "open");
    };

    const eventCloseHandler = event => {
        event.stopPropagation();
        if (saveKey === "mainModule") return;
        callbackHendlerTab(event, saveKey, "close");
    };

    useEffect(() => {
        const tabNode = tabRef.current.getBoundingClientRect().right;
        if (tabNode >= wrapperRight) console.log("alert");
    }, [tabRef, wrapperRight]);

    return (
        <li
            onClick={callbackHendlerTab ? eventHandler : null}
            className={[active ? "active" : null].join(" ")}
            key={saveKey}
            ref={tabRef}
        >
            <span className={[active ? "selected" : null].join(" ")}>{value}</span>
            <Icon onClick={callbackHendlerTab ? eventCloseHandler : null} className="closeTab" type="close" />
        </li>
    );
};

export default Tab;
