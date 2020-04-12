const namespaceHooks = {
  errorHook: (error, dispatch, dep = {}) => {
    const { Request, setStatus, errorRequstAction, loadCurrentData, getState, storeLoad, path } = dep;
    console.error(error);
    if (error.status === 400) {
      const errorRequest = new Request();
      dispatch(setStatus({ statusRequst: 'offline' }));
      dispatch(errorRequstAction(error.message));
      errorRequest.follow(
        'offline',
        statusRequst => {
          if (getState().publicReducer.status !== statusRequst && statusRequst === 'online') {
            errorRequest.unfollow();

            dispatch(setStatus({ statusRequst }));
            dispatch(errorRequstAction(null));
            dispatch(loadCurrentData({ path, storeLoad }));
          }
        },
        3000,
      );
    } else dispatch(errorRequstAction(error.message));
  },
};

export default namespaceHooks;
