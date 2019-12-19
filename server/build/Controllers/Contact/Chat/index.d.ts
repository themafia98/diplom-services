import { App } from '../../../Utils/Interfaces';
declare namespace Chat {
    const module: (app: App, socket: any) => void;
}
export default Chat;
