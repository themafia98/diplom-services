import { CryptoSecurity } from "../../Utils/Interfaces";
declare namespace Security {
    class Crypto implements CryptoSecurity {
        private mode;
        constructor(mode?: string);
        getMode(): string;
        hashing(password: string, salt: number, callback?: Function): Promise<void>;
        verify(password: string, hash: any, callback?: Function): Promise<void>;
    }
    const globalSecuiriy: Crypto;
}
export default Security;
