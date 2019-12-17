import express from 'express';
import { ServerRun } from '../../Utils/Interfaces';
declare namespace Contact {
    const module: (app: ServerRun, route: express.Router) => void | null;
}
export default Contact;
