import crypto from "node:crypto";

const SESSION_COOKIE = "almox_session";
const SESSION_DURATION = 8 * 60 * 60; // 8 horas

export const COOKIE_NAME = SESSION_COOKIE;

function getSecret() {
    const secret =
        process.env.AUTH_SESSION_SECRET ||
        "ALMOX-CONTROL-PROTOTIPO-2026-SECRET-CHANGE-ME";

    return secret;
}

export function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const iterations = 210000;

    const hash = crypto.pbkdf2Sync(
        String(password),
        salt,
        iterations,
        32,
        "sha256"
    );

    return [
        "pbkdf2_sha256",
        iterations,
        salt.toString("base64url"),
        hash.toString("base64url")
    ].join("$");
}

export function verifyPassword(password, storedHash) {
    try {
        const parts = String(storedHash || "").split("$");

        if (parts.length !== 4) {
            return false;
        }

        if (parts[0] !== "pbkdf2_sha256") {
            return false;
        }

        const iterations = Number(parts[1]);

        if (
            !Number.isInteger(iterations) ||
            iterations < 100000 ||
            iterations > 1000000
        ) {
            return false;
        }

        const salt = Buffer.from(parts[2], "base64url");
        const expected = Buffer.from(parts[3], "base64url");

        const derived = crypto.pbkdf2Sync(
            String(password),
            salt,
            iterations,
            expected.length,
            "sha256"
        );

        return (
            derived.length === expected.length &&
            crypto.timingSafeEqual(derived, expected)
        );
    } catch {
        return false;
    }
}

export function createSessionToken(user) {
    const now = Math.floor(Date.now() / 1000);
    const expires = now + SESSION_DURATION;

    const payload = JSON.stringify({
        id: user.id,
        usuario: user.usuario,
        cargo: user.cargo,
        almoxarifados: user.almoxarifados,
        issuedAt: now,
        expiresAt: expires
    });

    const encoded = Buffer
        .from(payload, "utf8")
        .toString("base64url");

    const signature = crypto
        .createHmac("sha256", getSecret())
        .update(encoded)
        .digest("base64url");

    return `${encoded}.${signature}`;
}

export function verifySessionToken(token) {
    try {
        if (!token) {
            return null;
        }

        const parts = String(token).split(".");

        if (parts.length !== 2) {
            return null;
        }

        const [encoded, signature] = parts;

        const expectedSignature = crypto
            .createHmac("sha256", getSecret())
            .update(encoded)
            .digest("base64url");

        const a = Buffer.from(signature);
        const b = Buffer.from(expectedSignature);

        if (
            a.length !== b.length ||
            !crypto.timingSafeEqual(a, b)
        ) {
            return null;
        }

        const payload = Buffer
            .from(encoded, "base64url")
            .toString("utf8");

        const session = JSON.parse(payload);

        const now = Math.floor(Date.now() / 1000);

        if (!session.usuario || !session.expiresAt) {
            return null;
        }

        if (Number(session.expiresAt) <= now) {
            return null;
        }

        if (Number(session.issuedAt) > now + 60) {
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

export function parseCookies(req) {
    const raw = req.headers?.cookie || "";

    const cookies = {};

    raw
        .split(";")
        .map(item => item.trim())
        .filter(Boolean)
        .forEach(item => {
            const separator = item.indexOf("=");

            if (separator === -1) {
                return;
            }

            const name = item.slice(0, separator);
            const value = item.slice(separator + 1);

            cookies[name] = decodeURIComponent(value);
        });

    return cookies;
}

export function setSessionCookie(res, token) {
    res.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION}`
    );
}

export function clearSessionCookie(res) {
    res.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    );
}

export function getSessionUser(req) {
    const cookies = parseCookies(req);

    const token = cookies[SESSION_COOKIE];

    return verifySessionToken(token);
}

export function sendJson(res, status, data) {
    res.statusCode = status;

    res.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
    );

    res.setHeader(
        "Cache-Control",
        "no-store"
    );

    return res.end(JSON.stringify(data));
}
