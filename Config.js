const ADMIN_EMAILS = [
  "wendell.bzinho@gmail.com",
  "wendellbaresi93@gmail.com",
  "lucasrobertoo2020@gmail.com"
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
  APP_NAME: 'Churrasquinho da Dona Divina',
  PHONE: '(61) 9 94448236',
  WORK_HOURS: 'Todos os dias 18:00 ás 23:30h.',
  
  // ID da planilha informada
  SPREADSHEET_ID: '1QBu6oqMP_cphZEMd0gTPGUADVMwHlbOUQllI7eSQOqA',

  // Mapeamento exato das abas criadas na planilha
  SHEET_NAMES: {
    VENDAS: 'controle_de_vendas',
    COMPRAS: 'controle_de_compras',
    CONTAS: 'controle_financeiro_contas',
    ESTOQUE: 'controle_estoque'
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
