// JWT utility using jose (Edge Runtime compatible)
import { SignJWT, jwtVerify } from 'jose';

const getSecret = () =>
    new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret-change-this-in-env'
    );

export async function signToken(payload: Record<string, unknown>, duration: string = '8h'): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(duration)
        .sign(getSecret());
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as Record<string, unknown>;
    } catch {
        return null;
    }
}
