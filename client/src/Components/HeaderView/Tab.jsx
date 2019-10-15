import React,{ useState } from 'react';

const Tab = ({value, active, onClick: callbackOnClick, itemKey}) => {

    const [saveKey] = useState(itemKey);

    const onClick = event => {
        
        callbackOnClick(event, saveKey);
    };
    
    return (
            <li onClick = {callbackOnClick ? onClick : null} 
                className = {[active ? 'active' : null].join(" ")} 
                key = {saveKey}
            >
                <span className = {[active ? 'selected' : null].join(" ")}>{value}</span>
            </li>
    );
};

export default Tab;