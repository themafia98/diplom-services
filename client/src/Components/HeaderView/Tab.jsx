import React,{ useState } from 'react';
import { Icon } from 'antd';

const Tab = ({value, active, hendlerTab: callbackHendlerTab, itemKey}) => {

    const [saveKey] = useState(itemKey);

    const eventHandler = event => {
        event.stopPropagation();
        callbackHendlerTab(event, saveKey, 'open');
    };

    const eventCloseHandler = event => {
        event.stopPropagation();
        callbackHendlerTab(event, saveKey, 'close');
    }

    
    return (
            <li onClick = {callbackHendlerTab ? eventHandler : null} 
                className = {[active ? 'active' : null].join(" ")} 
                key = {saveKey}
            >
                <span className = {[active ? 'selected' : null].join(" ")}>{value}</span>
                <Icon onClick = {callbackHendlerTab ? eventCloseHandler : null} className = 'closeTab' type="close" />
            </li>
    );
};

export default Tab;