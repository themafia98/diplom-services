import React from 'react';

const Loader = ({className = 'defaultLoader'}) => (
    <div className = {className ? className : null}>
        <img src = '/img/loader.gif' alt = 'loader' />
    </div>
);
export default Loader;