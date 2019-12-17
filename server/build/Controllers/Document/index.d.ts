import express from 'express';
import { ServerRun } from '../../Utils/Interfaces';
declare namespace Document {
    const module: (app: ServerRun, route: express.Router) => void | null;
}
export default Document;
