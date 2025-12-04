// auth-service/controllers/engineerAuthController.js
import { generateTokens , generateMagicLinkToken } from '../utils/jwt.js';
import redis from '../utils/redis.js';


const { setEx, del , get} = redis;

export async function generateMagicLink(email) {

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }

  const token = generateMagicLinkToken(email);
  await setEx(`magic:${token}`, 3600, email); // 1 hour expiry
  return `${process.env.CLIENT_URL}/onboard?token=${token}`;
}

export async function verifyMagicLink(token) {
  const email = await get(`magic:${token}`);
  if (!email) throw new Error('Invalid token');
  
  await del(`magic:${token}`); // One-time use
  
  return {
     accessToken: generateTokens(email, '15m'), // 15 minutes
    refreshToken: generateTokens(email, '7d')
  };
}