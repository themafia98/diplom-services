import express from 'express';
import { ServerRun } from '../../Utils/Interfaces';
declare namespace Main {
    const module: (app: ServerRun, route: express.Router) => void | null;
}
export default Main;
