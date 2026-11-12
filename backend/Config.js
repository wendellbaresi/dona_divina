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

  const isVip = ADMIN_EMAILS.includes(email) || ADMIN_EMAILS.includes(Session.getEffectiveUser().getEmail());

  return { 
    email: email || Session.getEffectiveUser().getEmail() || "EMAIL_AQUI@gmail.com", 
    isAdmin: true 
  };
}

const CONFIG = Object.freeze({
  APP_NAME: 'NOME_DA_LOJA_AQUI',
  PHONE: 'TELEFONE_AQUI',
  WORK_HOURS: 'HORARIO_AQUI',
  
  SPREADSHEET_ID: 'ID_PLANILHA_AQUI',

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
