import jwt from 'express-jwt';
import { Request } from 'express';

namespace Auth {
  const getTokenFromHeaders = (req: Request) => {
    const { headers: { authorization } } = req;

    if (authorization && authorization.split(' ')[0] === 'Token') {
      return authorization.split(' ')[1];
    }
    return null;
  };

  export const config = {
    required: jwt({
      secret: 'jwtsecret',
      userProperty: 'payload',
      getToken: getTokenFromHeaders,
      credentialsRequired: true,
    }),
    optional: jwt({
      secret: 'jwtsecret',
      userProperty: 'payload',
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
    }),
  };
};

export default Auth;