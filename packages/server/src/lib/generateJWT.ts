import { debugLog } from '@authenticake/common';
import jwt from 'jsonwebtoken';

import { JWTPayload } from '../model/types/Jwt';
import { BaseSession } from '../model/types/User';
import { JwtOptions } from '../modules/ServerAuth/types/authProps';

type GenerateJWT = (obj: {
  type: 'refresh' | 'access';
  user: BaseSession;
  secret: string;
  expires: number;
  customPayload?: JwtOptions['customPayload'];
}) => string;

const generateJWT: GenerateJWT = ({
  type,
  user,
  secret,
  expires,
  customPayload,
}) => {
  const payload: JWTPayload = {
    type,
    user_id: user.user_id,
    email: user.email,
    roles: user.roles,
    exp: Math.floor(Date.now() / 1000) + expires,
  };

  // execute user's custom payload function if provided
  // for access token only
  const payloadOverride =
    customPayload && type === 'access' ? customPayload(payload, user) : {};

  // override and/or extend payload with custom payload if applicable
  const finalPayload: JWTPayload & typeof payloadOverride = {
    ...payload,
    ...payloadOverride,
  };

  debugLog.info(`jwt payload:\n${JSON.stringify(finalPayload, null, 2)}`);

  return jwt.sign(finalPayload, secret);
};

export default generateJWT;
