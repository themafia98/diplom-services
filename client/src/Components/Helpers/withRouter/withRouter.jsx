import React, { useMemo } from 'react';
import { getDependencyModules } from 'Utils/utils.global';

/**
 *
 * @param {import('react').Component} Component  react component
 * @requires {string} property 'path' in props
 */
const withRouter = (Component, exclude = []) => (props) => {
  const { path = '', appConfig = null } = props;

  const dependencyList = useMemo(() => getDependencyModules(path.split(/_|#/)[0], appConfig, exclude), [
    path,
    appConfig,
  ]);

  return <Component {...props} entitysList={dependencyList} />;
};

export default withRouter;
