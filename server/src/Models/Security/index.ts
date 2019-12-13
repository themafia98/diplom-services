import bcrypt from "bcrypt";
import { CryptoSecurity } from "../../Utils/Interfaces";

namespace Security {
    export class Crypto implements CryptoSecurity {
        private mode: string;
        constructor(mode?: string) {
            this.mode = mode || "default";
        }

        public getMode(): string {
            return this.mode;
        }

        public async hashing(password: string, salt: number, callback: Function): Promise<void> {
            if (this.getMode() === 'default') {
                bcrypt.hash(password, salt, (err: Error, hash: any): void => {
                    if (err) return void console.error(err);

                    console.log(hash);
                    if (callback) callback(hash);
                });
            }
        }

        public async verify(password: string, hash: any, callback: Function): Promise<void> {
            if (this.getMode() === 'default') {
                bcrypt.compare(password, hash, (err: Error, valid: boolean): void => {
                    if (err) return void console.error(err);
                    if (valid) {

                    } else {

                    }
                });
            }
        }
    }
}

export default Security;
