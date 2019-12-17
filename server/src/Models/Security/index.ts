import bcrypt from "bcrypt";
import { CryptoSecurity } from "../../Utils/Interfaces";

namespace Security {
    export class Crypto implements CryptoSecurity {
        private mode: string;
        constructor(mode?: string) {
            this.mode = mode || "default";
        }

        public getMode(): string {
            return this.mode || "default";
        }

        public async hashing(password: string, salt: number, callback?: Function): Promise<any> {
                let returnHash:string = "";
                await bcrypt.hash(password, salt, (err: Error, hash: any): void => {
                    if (err) console.error(err);

                    console.log("hash:",hash);
                    if (callback) return void callback(hash);
                    else returnHash = hash; 
                });
                return returnHash;
    
        }

        public async verify(password: string, hash: any, callback?: Function): Promise<any> {
            let isValid = false;
            
               await bcrypt.compare(password, hash, (err: Error, valid: boolean): void => {
                    if (err) isValid = false;
                    if (valid) isValid = true;
                    if (callback) callback(isValid);
                });
         
        }
    }

    export const globalSecuiriy = new Security.Crypto("Default");
}

export default Security;
