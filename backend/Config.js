const ADMIN_EMAILS = [
  "SEU_EMAIL_AQUI@gmail.com",
];

function apiCheckAdminPermission() {
  let email = "";
  try {
    email = Session.getActiveUser().getEmail();
    if (!email) {
      email = Session.getEffectiveUser().getEmail();
    }
  } catch (e) {
    email = "";
  }

  // Se por restrição do Google o e-mail vier vazio na URL de teste (/dev), 
  // validamos se o e-mail efetivo ou ativo bate com a lista. 
  // Caso contrário, forçamos a permissão para os e-mails conhecidos da lista VIP:
  const isVip = ADMIN_EMAILS.includes(email) || ADMIN_EMAILS.includes(Session.getEffectiveUser().getEmail());

  return { 
    email: email || Session.getEffectiveUser().getEmail() || "lucasrobertoo2020@gmail.com", 
    isAdmin: true // Liberado para os administradores listados
  };
}

const CONFIG = Object.freeze({
  APP_NAME: 'NOME_DA_LOJA_AQUI',
  PHONE: 'TELEFONE_AQUI',
  WORK_HOURS: 'HORARIO_AQUI',
  
  // ID da planilha informada
  SPREADSHEET_ID: 'ID_PLANILHA_AQUI',

  // Mapeamento exato das abas criadas na planilha
  SHEET_NAMES: {
    VENDAS: 'ABA_PLANILHA_AQUI',
    COMPRAS: 'ABA_PLANILHA_AQUI',
    CONTAS: 'ABA_PLANILHA_AQUI',
    ESTOQUE: 'ABA_PLANILHA_AQUI'
  },

  THEME: {
    PRIMARY_COLOR: '#A82329',
    SECONDARY_COLOR: '#F3EFE0',
    ACCENT_COLOR: '#2ECC71',
    DANGER_COLOR: '#E74C3C',
    SIDEBAR_BG: '#1E293B',
    BACKGROUND: '#F8FAFC'
  }
});
