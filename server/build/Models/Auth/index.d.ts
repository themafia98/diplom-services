import jwt from 'express-jwt';
declare namespace Auth {
    const config: {
        required: jwt.RequestHandler;
        optional: jwt.RequestHandler;
    };
}
export default Auth;
