import React from 'react';
import { getDependencyModules } from 'Utils';

/**
 *
 * @param {import('react').Component} Component  react component
 * @requires {string} property 'path' in props
 */
const withRouter = (Component, exclude = []) => (props) => {
  const { path = '' } = props;
  return (
    <Component {...props} entitysList={getDependencyModules(path.split(/_|#/)[0], undefined, exclude)} />
  );
};

export default withRouter;
