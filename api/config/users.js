export const USERS = [
    {
        id: "usr-gundim",
        nome: "Gundim",
        usuario: "Gundim",
        senha: "Gundim@adm01",
        cargo: "Administrador",
        almoxarifados: ["engenharia", "seguranca"],
        telas: {
            engenharia: [
                "dashboard",
                "estoque",
                "projetos",
                "entradas",
                "saidas",
                "inventario",
                "localizacao",
                "gestao"
            ],
            seguranca: [
                "dashboard",
                "estoque",
                "colaboradores",
                "estoque-colaborador",
                "entradas",
                "saidas",
                "agenda"
            ]
        }
    },

    {
        id: "usr-jorge",
        nome: "Jorge",
        usuario: "Jorge",
        senha: "Jorge@gestor01",
        cargo: "Gestor",
        almoxarifados: ["engenharia", "seguranca"],
        telas: {
            engenharia: [
                "dashboard",
                "estoque",
                "projetos",
                "entradas",
                "saidas",
                "inventario",
                "localizacao",
                "gestao"
            ],
            seguranca: [
                "dashboard",
                "estoque",
                "colaboradores",
                "estoque-colaborador",
                "entradas",
                "saidas",
                "agenda"
            ]
        }
    },

    {
        id: "usr-felipe",
        nome: "Felipe",
        usuario: "Felipe",
        senha: "Felipe@consultor01",
        cargo: "Consultor",
        almoxarifados: ["engenharia"],
        telas: {
            engenharia: [
                "dashboard",
                "estoque",
                "projetos",
                "inventario",
                "localizacao",
                "gestao"
            ],
            seguranca: []
        }
    },

    {
        id: "usr-robert",
        nome: "Robert",
        usuario: "Robert",
        senha: "Robert@auxiliar01",
        cargo: "Auxiliar",
        almoxarifados: ["engenharia"],
        telas: {
            engenharia: [
                "dashboard",
                "estoque",
                "entradas",
                "saidas",
                "inventario",
                "localizacao"
            ],
            seguranca: []
        }
    }
];

export function encontrarUsuario(usuario) {
    const login = String(usuario || "")
        .trim()
        .toLowerCase();

    return USERS.find(
        user => user.usuario.toLowerCase() === login
    ) || null;
}

export function usuarioPodeAcessarAlmoxarifado(
    usuario,
    almoxarifado
) {
    return Boolean(
        usuario &&
        Array.isArray(usuario.almoxarifados) &&
        usuario.almoxarifados.includes(almoxarifado)
    );
}

export function usuarioPodeAcessarTela(
    usuario,
    almoxarifado,
    tela
) {
    if (!usuarioPodeAcessarAlmoxarifado(
        usuario,
        almoxarifado
    )) {
        return false;
    }

    const telas =
        usuario.telas?.[almoxarifado] || [];

    return telas.includes(tela);
}
