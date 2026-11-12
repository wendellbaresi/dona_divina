class FinanceService {
  constructor(repository) {
    this.repository = repository || new FinanceRepository();
  }

  /**
   * Retorna as métricas consolidadas do mês atual (ou geral se preferir)
   */
  getDashboardMetrics(mesAnoFiltro) {
    // Busca registros de todas as abas principais
    const vendas = this.repository.getRecordsBySheet(CONFIG.SHEET_NAMES.VENDAS, 'ENTRADA');
    const compras = this.repository.getRecordsBySheet(CONFIG.SHEET_NAMES.COMPRAS, 'SAIDA');
    const contas = this.repository.getRecordsBySheet(CONFIG.SHEET_NAMES.CONTAS, 'SAIDA');

    // Junta todas as movimentações em uma única lista unificada
    const allRecords = [...vendas, ...compras, ...contas];

    // Define o filtro de mês/ano (Ex: '2026-11'). Se não passar, pega o mês atual.
    const targetMonth = mesAnoFiltro || new Date().toISOString().slice(0, 7);

    let totalEntradas = 0;
    let totalSaidas = 0;
    const filteredRecords = [];

    allRecords.forEach(item => {
      // Verifica se o registro pertence ao mês selecionado (compara 'YYYY-MM')
      const itemMonth = item.date ? item.date.slice(0, 7) : '';
      
      if (!mesAnoFiltro || itemMonth === targetMonth) {
        filteredRecords.push(item);
        if (item.type === 'ENTRADA') {
          totalEntradas += item.amount;
        } else if (item.type === 'SAIDA') {
          totalSaidas += item.amount;
        }
      }
    });

    // Ordena do mais recente para o mais antigo
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    const saldoAtual = totalEntradas - totalSaidas;

    return {
      mesReferencia: targetMonth,
      totalEntradas,
      totalSaidas,
      saldoAtual,
      totalLancamentos: filteredRecords.length,
      recentTransactions: filteredRecords.slice(0, 10) // Retorna os 10 últimos do mês
    };
  }

  saveTransaction(payload) {
    if (!payload.amount || payload.amount <= 0) {
      throw new Error('O valor da transação deve ser maior que zero.');
    }

    // Direciona para a aba correta baseada no tipo ou categoria escolhida
    let targetSheet = CONFIG.SHEET_NAMES.VENDAS;
    if (payload.type === 'SAIDA') {
      targetSheet = payload.category === 'Conta Fixa' ? CONFIG.SHEET_NAMES.CONTAS : CONFIG.SHEET_NAMES.COMPRAS;
    }

    return this.repository.insertRecord(targetSheet, payload);
  }
}