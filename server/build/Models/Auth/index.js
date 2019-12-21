"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = __importDefault(require("express-jwt"));
var Auth;
(function (Auth) {
    const getTokenFromHeaders = (req) => {
        const { headers: { authorization } } = req;
        if (authorization && authorization.split(' ')[0] === 'Token') {
            return authorization.split(' ')[1];
        }
        return null;
    };
    Auth.config = {
        required: express_jwt_1.default({
            secret: 'jwtsecret',
            userProperty: 'payload',
            getToken: getTokenFromHeaders,
            credentialsRequired: true,
        }),
        optional: express_jwt_1.default({
            secret: 'jwtsecret',
            userProperty: 'payload',
            getToken: getTokenFromHeaders,
            credentialsRequired: false,
        }),
    };
})(Auth || (Auth = {}));
;
exports.default = Auth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kZWxzL0F1dGgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw4REFBOEI7QUFHOUIsSUFBVSxJQUFJLENBd0JiO0FBeEJELFdBQVUsSUFBSTtJQUNaLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxHQUFZLEVBQUUsRUFBRTtRQUMzQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsYUFBYSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFFM0MsSUFBSSxhQUFhLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDNUQsT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7SUFFVyxXQUFNLEdBQUc7UUFDcEIsUUFBUSxFQUFFLHFCQUFHLENBQUM7WUFDWixNQUFNLEVBQUUsV0FBVztZQUNuQixZQUFZLEVBQUUsU0FBUztZQUN2QixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLG1CQUFtQixFQUFFLElBQUk7U0FDMUIsQ0FBQztRQUNGLFFBQVEsRUFBRSxxQkFBRyxDQUFDO1lBQ1osTUFBTSxFQUFFLFdBQVc7WUFDbkIsWUFBWSxFQUFFLFNBQVM7WUFDdkIsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixtQkFBbUIsRUFBRSxLQUFLO1NBQzNCLENBQUM7S0FDSCxDQUFDO0FBQ0osQ0FBQyxFQXhCUyxJQUFJLEtBQUosSUFBSSxRQXdCYjtBQUFBLENBQUM7QUFFRixrQkFBZSxJQUFJLENBQUMifQ==