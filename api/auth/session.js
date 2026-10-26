import {
    getSessionUser,
    sendJson
} from "./_security.js";

import {
    encontrarUsuario
} from "../config/users.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");

        return sendJson(res, 405, {
            ok: false,
            error: "Método não permitido."
        });
    }

    try {
        const session = getSessionUser(req);

        if (!session) {
            return sendJson(res, 401, {
                ok: false,
                authenticated: false
            });
        }

        const usuario = encontrarUsuario(
            session.usuario
        );

        if (!usuario) {
            return sendJson(res, 401, {
                ok: false,
                authenticated: false
            });
        }

        return sendJson(res, 200, {
            ok: true,
            authenticated: true,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                usuario: usuario.usuario,
                cargo: usuario.cargo,
                almoxarifados:
                    usuario.almoxarifados,
                telas: usuario.telas
            }
        });

    } catch (error) {
        console.error(
            "ALMOX_SESSION_ERROR:",
            error
        );

        return sendJson(res, 500, {
            ok: false,
            authenticated: false,
            error: "Não foi possível verificar a sessão."
        });
    }
}
