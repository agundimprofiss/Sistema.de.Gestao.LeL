import {
    clearSessionCookie,
    sendJson
} from "./_security.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");

        return sendJson(res, 405, {
            ok: false,
            error: "Método não permitido."
        });
    }

    clearSessionCookie(res);

    return sendJson(res, 200, {
        ok: true
    });
}
