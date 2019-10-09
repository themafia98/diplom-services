import express,{Application} from 'express';
import cluster from 'cluster';
import os from 'os';

/** @librarys */
import chalk from 'chalk';


namespace Server {

    const CPU = os.cpus().length;

    if (cluster.isMaster){

        for (let i = 0; i < CPU; i++){
            cluster.fork();
        };

    } else if (cluster.isWorker){

        const app:Application = express();

        app.set('port', process.env.PORT || '3001');

        app.listen((error:Error) => {
            if (error) console.log(error);
            else chalk.bgGreen(`Server start on ${app.get('port')} port`);
        });

    }
};

export default Server;