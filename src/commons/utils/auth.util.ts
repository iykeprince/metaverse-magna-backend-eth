import jwt from 'jsonwebtoken';

export const validAuthToken = (token: string, secret: string) => {
    try {
        var decoded = jwt.verify(token,secret);
        console.log('decoded', decoded);
        return decoded;
      } catch(err) {
        return false;
      }
}