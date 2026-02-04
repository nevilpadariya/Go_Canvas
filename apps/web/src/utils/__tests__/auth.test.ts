import { describe, it, expect } from 'vitest';

/**
 * Utility function to decode JWT token payload
 */
export function decodeToken(token: string): any {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (error) {
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const payload = decodeToken(token);
        if (!payload || !payload.exp) {
            return true;
        }
        return Date.now() >= payload.exp * 1000;
    } catch (error) {
        return true;
    }
}

/**
 * Get user role from token
 */
export function getUserRole(token: string): string | null {
    const payload = decodeToken(token);
    return payload?.userrole || null;
}

describe('Auth Utilities', () => {
    describe('decodeToken', () => {
        it('decodes valid JWT token', () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjEsInVzZXJyb2xlIjoiU3R1ZGVudCJ9.fake';
            const decoded = decodeToken(token);

            expect(decoded).toHaveProperty('userid');
            expect(decoded).toHaveProperty('userrole');
            expect(decoded.userrole).toBe('Student');
        });

        it('returns null for invalid token', () => {
            const invalidToken = 'invalid.token.here';
            const decoded = decodeToken(invalidToken);

            expect(decoded).toBeNull();
        });

        it('returns null for malformed token', () => {
            const malformedToken = 'not-a-jwt';
            const decoded = decodeToken(malformedToken);

            expect(decoded).toBeNull();
        });
    });

    describe('isTokenExpired', () => {
        it('returns false for non-expired token', () => {
            // Create token that expires in the future
            const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const payload = btoa(JSON.stringify({ exp: futureExp }));
            const token = `header.${payload}.signature`;

            expect(isTokenExpired(token)).toBe(false);
        });

        it('returns true for expired token', () => {
            // Create token that expired in the past
            const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
            const payload = btoa(JSON.stringify({ exp: pastExp }));
            const token = `header.${payload}.signature`;

            expect(isTokenExpired(token)).toBe(true);
        });

        it('returns true for token without expiration', () => {
            const payload = btoa(JSON.stringify({ userid: 1 }));
            const token = `header.${payload}.signature`;

            expect(isTokenExpired(token)).toBe(true);
        });

        it('returns true for invalid token', () => {
            expect(isTokenExpired('invalid-token')).toBe(true);
        });
    });

    describe('getUserRole', () => {
        it('extracts user role from valid token', () => {
            const payload = btoa(JSON.stringify({ userrole: 'Faculty' }));
            const token = `header.${payload}.signature`;

            expect(getUserRole(token)).toBe('Faculty');
        });

        it('returns null for token without role', () => {
            const payload = btoa(JSON.stringify({ userid: 1 }));
            const token = `header.${payload}.signature`;

            expect(getUserRole(token)).toBeNull();
        });

        it('returns null for invalid token', () => {
            expect(getUserRole('invalid-token')).toBeNull();
        });
    });
});
