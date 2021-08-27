import ServerRunner from './Models/Server';
import { ServerRun } from './Utils/Interfaces/Interfaces.global';
import { loggerError } from './Utils/Logger/Logger';

export default () => {
  try {
    const app: ServerRun = new ServerRunner(process.env.APP_PORT || '3001');
    app.start();
  } catch (err) {
    loggerError(
      `Server shut down. PPID: ${process.ppid} || ${err}. Node: ${process.versions.node}. v8: ${process.versions.v8}`,
    );
    console.error(err);
    console.error('Server shut down');
    process.exit(1);
  }
};
