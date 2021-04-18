import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getDependencyModules } from 'Utils';

/**
 *
 * @param {import('react').Component} Component  react component
 * @requires {string} property 'path' in props
 */
const withRouter = (Component, exclude = []) => (props) => {
  const { path = '' } = props;

  const appConfig = useSelector(({ publicReducer }) => publicReducer.appConfig || null);

  const dependencyList = useMemo(() => getDependencyModules(path.split(/_|#/)[0], appConfig, exclude), [
    path,
    appConfig,
  ]);

  return <Component {...props} entitysList={dependencyList} />;
};

export default withRouter;
