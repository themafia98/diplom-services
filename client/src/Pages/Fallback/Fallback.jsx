import classes from './Fallback.module.scss';

const Fallback = () => {
  const handleRefreshPage = () => window.location.reload();

  return (
    <div className={classes.container}>
      <div>
        <span className={classes.title}>Loading...</span>
        <button onClick={handleRefreshPage}>Refresh</button>
      </div>
    </div>
  );
};

export default Fallback;
