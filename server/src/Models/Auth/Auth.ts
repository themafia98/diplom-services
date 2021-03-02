import jwt from 'express-jwt';
import { Request } from 'express';
import authConfig from '../../config/auth.config';

namespace Auth {
  const getTokenFromHeaders = (req: Request) => {
    const {
      headers: { authorization },
    } = req;

    if (authorization && authorization.split(' ')[0] === 'Token') {
      return authorization.split(' ')[1];
    }
    return null;
  };

  export const config = {
    required: jwt({
      secret: authConfig.SECRET,
      userProperty: authConfig.USER_PROPERTY,
      getToken: getTokenFromHeaders,
      credentialsRequired: true,
    }),
    optional: jwt({
      secret: authConfig.SECRET,
      userProperty: authConfig.USER_PROPERTY,
      getToken: getTokenFromHeaders,
      credentialsRequired: false,
    }),
  };
}

export default Auth;
