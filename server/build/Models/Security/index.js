"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
var Security;
(function (Security) {
    class Crypto {
        constructor(mode) {
            this.mode = mode || "default";
        }
        getMode() {
            return this.mode;
        }
        async hashing(password, salt, callback) {
            if (this.getMode() === "default") {
                bcrypt_1.default.hash(password, salt, (err, hash) => {
                    if (err)
                        return void console.error(err);
                    console.log(hash);
                    if (callback)
                        callback(hash);
                });
            }
        }
        async verify(password, hash, callback) {
            if (this.getMode() === "default") {
                bcrypt_1.default.compare(password, hash, (err, valid) => {
                    if (err)
                        return void console.error(err);
                    if (valid) {
                    }
                    else {
                    }
                });
            }
        }
    }
    Security.Crypto = Crypto;
    Security.globalSecuiriy = new Security.Crypto("Default");
})(Security || (Security = {}));
exports.default = Security;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL1NlY3VyaXR5L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0RBQTRCO0FBRzVCLElBQVUsUUFBUSxDQW1DakI7QUFuQ0QsV0FBVSxRQUFRO0lBQ2QsTUFBYSxNQUFNO1FBRWYsWUFBWSxJQUFhO1lBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLFNBQVMsQ0FBQztRQUNsQyxDQUFDO1FBRU0sT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFnQixFQUFFLElBQVksRUFBRSxRQUFtQjtZQUNwRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLGdCQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFVLEVBQUUsSUFBUyxFQUFRLEVBQUU7b0JBQ3hELElBQUksR0FBRzt3QkFBRSxPQUFPLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFFeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbEIsSUFBSSxRQUFRO3dCQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUM7UUFFTSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQWdCLEVBQUUsSUFBUyxFQUFFLFFBQW1CO1lBQ2hFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLFNBQVMsRUFBRTtnQkFDOUIsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEdBQVUsRUFBRSxLQUFjLEVBQVEsRUFBRTtvQkFDaEUsSUFBSSxHQUFHO3dCQUFFLE9BQU8sS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLEtBQUssRUFBRTtxQkFDVjt5QkFBTTtxQkFDTjtnQkFDTCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQztLQUNKO0lBL0JZLGVBQU0sU0ErQmxCLENBQUE7SUFFWSx1QkFBYyxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNqRSxDQUFDLEVBbkNTLFFBQVEsS0FBUixRQUFRLFFBbUNqQjtBQUVELGtCQUFlLFFBQVEsQ0FBQyJ9