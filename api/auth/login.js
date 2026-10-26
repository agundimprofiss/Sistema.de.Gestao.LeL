import {
    encontrarUsuario
} from "../config/users.js";

import {
    createSessionToken,
    setSessionCookie,
    sendJson,
    verifyPassword,
    hashPassword
} from "./_security.js";

function obterHashSenha(usuario) {
    /*
     * No protótipo, as senhas ficam no código.
     * O hash é gerado em memória na primeira utilização
     * e usado para validar a senha durante a execução.
     */
    if (!usuario.__senhaHash) {
        usuario.__senhaHash = hashPassword(usuario.senha);
    }

    return usuario.__senhaHash;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");

        return sendJson(res, 405, {
            ok: false,
            error: "Método não permitido."
        });
    }

    try {
        const body = req.body || {};

        const usuarioDigitado = String(
            body.usuario ||
            body.username ||
            ""
        ).trim();

        const senhaDigitada = String(
            body.senha ||
            body.password ||
            ""
        );

        if (!usuarioDigitado || !senhaDigitada) {
            return sendJson(res, 400, {
                ok: false,
                error: "Informe usuário e senha."
            });
        }

        const usuario =
            encontrarUsuario(usuarioDigitado);

        if (!usuario) {
            return sendJson(res, 401, {
                ok: false,
                error: "Usuário ou senha inválidos."
            });
        }

        const senhaValida = verifyPassword(
            senhaDigitada,
            obterHashSenha(usuario)
        );

        if (!senhaValida) {
            return sendJson(res, 401, {
                ok: false,
                error: "Usuário ou senha inválidos."
            });
        }

        const token = createSessionToken({
            id: usuario.id,
            usuario: usuario.usuario,
            cargo: usuario.cargo,
            almoxarifados:
                usuario.almoxarifados
        });

        setSessionCookie(res, token);

        return sendJson(res, 200, {
            ok: true,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                usuario: usuario.usuario,
                cargo: usuario.cargo,
                almoxarifados:
                    usuario.almoxarifados
            }
        });

    } catch (error) {
        console.error(
            "ALMOX_LOGIN_ERROR:",
            error
        );

        return sendJson(res, 500, {
            ok: false,
            error: "Não foi possível realizar o login."
        });
    }
}
