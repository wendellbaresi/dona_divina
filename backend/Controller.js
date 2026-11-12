function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle(CONFIG.APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- CACHE SERVICE AUXILIAR (Blindado com ScriptCache) ---
function getCachedData(cacheKey, fetchFunction) {
  try {
    const cache = CacheService.getScriptCache();
    if (cache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached; 
      }
    }
    
    const data = fetchFunction();
    if (cache && data) {
      cache.put(cacheKey, data, 300); // Guarda por 5 minutos
    }
    return data;
  } catch (e) {
    // Fallback caso o cache falhe por qualquer motivo: executa direto sem cache
    return fetchFunction();
  }
}

function clearAppCache() {
  try {
    const cache = CacheService.getScriptCache();
    if (cache) {
      cache.remove('clientes_data');
      cache.remove('contas_data');
    }
  } catch (e) {
    // Ignora erros de limpeza de cache
  }
}

function apiGetDashboardData(mesAnoFiltro) {
  const service = new FinanceService();
  return JSON.stringify(service.getDashboardMetrics(mesAnoFiltro));
}

function apiSaveTransaction(data) {
  const service = new FinanceService();
  clearAppCache();
  return service.saveTransaction(data);
}

function apiGetAppConfigs() {
  return CONFIG;
}

function apiGetAvailableMonths() {
  const repository = new FinanceRepository();
  const vendas = repository.getRecordsBySheet(CONFIG.SHEET_NAMES.VENDAS, 'ENTRADA');
  const compras = repository.getRecordsBySheet(CONFIG.SHEET_NAMES.COMPRAS, 'SAIDA');
  const contas = repository.getRecordsBySheet(CONFIG.SHEET_NAMES.CONTAS, 'SAIDA');

  const allRecords = [...vendas, ...compras, ...contas];
  const monthsSet = new Set();

  allRecords.forEach(item => {
    if (item.date) {
      const mesAno = item.date.slice(0, 7); // Formato 'YYYY-MM'
      monthsSet.add(mesAno);
    }
  });

  const sortedMonths = Array.from(monthsSet).sort().reverse();
  return sortedMonths;
}

function apiUpdateTransaction(id, data) {
  const repository = new FinanceRepository();
  clearAppCache();
  return repository.updateRecord(id, data);
}

function apiDeleteTransaction(id) {
  const repository = new FinanceRepository();
  clearAppCache();
  return repository.deleteRecord(id);
}

// --- FUNÇÃO AUXILIAR SEGURA PARA OBTER A PLANILHA ---
function getSpreadsheet() {
  if (typeof CONFIG !== 'undefined' && CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// --- CRIAÇÃO / BUSCA DA ABA DE CLIENTES ---
function getOrCreateClientesSheet() {
  const ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Não foi possível acessar a planilha. Verifique a ID no CONFIG.SPREADSHEET_ID.");
  }

  let sheet = ss.getSheetByName('controle_clientes');
  if (!sheet) {
    sheet = ss.insertSheet('controle_clientes');
    sheet.appendRow(['ID', 'Data', 'Nome_Cliente', 'Descricao_Pedido', 'Valor_Total', 'Status_Pagamento', 'Status_Registro', 'Mesa']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0F172A').setFontColor('#FFFFFF');
  }
  return sheet;
}

// --- BUSCAR APENAS CLIENTES ATIVOS ---
function apiGetClientesData() {
  return getCachedData('clientes_data', function() {
    const sheet = getOrCreateClientesSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return JSON.stringify([]);

    const clientes = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const statusRegistro = row[6] || 'ATIVO';
      if (statusRegistro === 'ATIVO') {
        clientes.unshift({
          id: row[0],
          date: row[1],
          nome: row[2],
          descricao: row[3],
          amount: parseFloat(row[4] || 0),
          status: row[5],
          mesa: row[7] || 'Balcão',
          rowIndex: i + 1
        });
      }
    }
    return JSON.stringify(clientes);
  });
}

// --- SALVAR NOVO CLIENTE NA PLANILHA ---
function apiSaveCliente(payload) {
  const sheet = getOrCreateClientesSheet();
  const id = 'CLI_' + new Date().getTime();
  sheet.appendRow([
    id,
    payload.date || new Date().toISOString().split('T')[0],
    payload.nome,
    payload.descricao,
    payload.amount,
    payload.status, // 'PAGO' ou 'EM DÍVIDA'
    'ATIVO',
    payload.mesa || 'Balcão'
  ]);
  clearAppCache();
  return { success: true, id: id };
}

// --- SOFT DELETE DE CLIENTE ---
function apiDeleteCliente(id) {
  const sheet = getOrCreateClientesSheet();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 7).setValue('INATIVO');
      clearAppCache();
      return { success: true };
    }
  }
  throw new Error("Registro de cliente não encontrado.");
}

// --- DAR BAIXA EM CONTA DE CLIENTE ---
function apiPagarCliente(id) {
  const sheet = getOrCreateClientesSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 6).setValue('PAGO');

      const payloadVenda = {
        type: "ENTRADA",
        category: "Venda Presencial / Cliente",
        description: `${data[i][2]} - ${data[i][3]}`,
        amount: data[i][4],
        date: new Date().toISOString().split('T')[0]
      };
      
      apiSaveTransaction(payloadVenda);
      clearAppCache();
      return { success: true };
    }
  }
  throw new Error("Cliente não encontrado para dar baixa.");
}

function apiAdicionarItensCliente(id, novosItensDesc, valorAdicional) {
  const sheet = getOrCreateClientesSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      const descricaoAtual = data[i][3];
      const valorAtual = parseFloat(data[i][4] || 0);
      
      const novaDescricao = `${descricaoAtual}, ${novosItensDesc}`;
      const novoValor = valorAtual + parseFloat(valorAdicional);
      
      sheet.getRange(i + 1, 4).setValue(novaDescricao);
      sheet.getRange(i + 1, 5).setValue(novoValor);
      clearAppCache();
      return { success: true };
    }
  }
  throw new Error("Comanda/Cliente não encontrado.");
}

function apiGetFechamentoCaixaDiario(dataStr) {
  const repository = new FinanceRepository();
  const dataConsulta = dataStr || new Date().toISOString().split('T')[0];
  
  const vendas = repository.getRecordsBySheet(CONFIG.SHEET_NAMES.VENDAS, 'ENTRADA');
  let totalEntradasDia = 0;

  vendas.forEach(item => {
    if (item.date === dataConsulta) {
      totalEntradasDia += item.amount;
    }
  });

  return JSON.stringify({
    data: dataConsulta,
    totalEntradas: totalEntradasDia
  });
}

// --- CONTAS FIXAS DA LOJA (CRUD INDEPENDENTE) ---
function apiGetContasData(mesAnoFiltro) {
  const cacheKey = 'contas_data_' + (mesAnoFiltro || 'todos');
  return getCachedData(cacheKey, function() {
    const repository = new FinanceRepository();
    const contas = repository.getRecordsBySheet(CONFIG.SHEET_NAMES.CONTAS, 'SAIDA');
    return JSON.stringify(contas.reverse());
  });
}

function apiSaveContaTransaction(data) {
  const repository = new FinanceRepository();
  clearAppCache();
  return repository.insertRecord(CONFIG.SHEET_NAMES.CONTAS, data);
}