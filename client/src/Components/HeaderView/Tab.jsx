import React from 'react';

const Tab = ({value, active, onClick: callbackOnClick, EUID}) => {
    const onClick = event => {
        callbackOnClick(event, EUID);
    };
    return (
            <li onClick = {callbackOnClick ? onClick : null} 
                className = {[active ? 'active' : null].join(" ")} 
                key = {value}
            >
                <span className = {[active ? 'selected' : null].join(" ")}>{value}</span>
            </li>
    );
};

export default Tab;