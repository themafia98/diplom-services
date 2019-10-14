import React from 'react';
import Item from 'antd/lib/list/Item';


const Tab = ({value, selected}) => {
    return (
            <li className = {selected ? 'selected' : null} key = {value}>
                <span className = {selected ? 'selected' : null}>{value}</span>
            </li>
    );
};

export default Tab;