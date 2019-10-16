import React from 'react';

const Loader = ({className = 'defaultLoader', classNameSpiner = null}) => (
    <div className = {className ? className : null}>
        <img className = {classNameSpiner ? classNameSpiner : null} src = '/img/loader.gif' alt = 'loader' />
    </div>
);
export default Loader;