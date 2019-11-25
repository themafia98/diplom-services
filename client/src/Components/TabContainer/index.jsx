import React from 'react';

const TabContainer = ({ isBackground, visible, children }) => {
    if (isBackground || visible)
        return (
            <div className={['tabContainer', visible ? "visible" : 'hidden'].join(" ")}>
                {children}
            </div>
        )
    else return null;
};

export default TabContainer;