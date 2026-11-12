class FinanceService {
  constructor(repository) {
    this.repository = repository || new FinanceRepository();
  }

  getDashboardMetrics(mesAnoFiltro) {
    const vendas = this.repository.getRecordsBySheet(CONFIG.SHEET_NAMES.VENDAS, 'ENTRADA');
    const compras = this.repository.getRecordsBySheet(CONFIG.SHEET_NAMES.COMPRAS, 'SAIDA');
    const contas = this.repository.getRecordsBySheet(CONFIG.SHEET_NAMES.CONTAS, 'SAIDA');

    const allRecords = [...vendas, ...compras, ...contas];

    const targetMonth = mesAnoFiltro || new Date().toISOString().slice(0, 7);

    let totalEntradas = 0;
    let totalSaidas = 0;
    const filteredRecords = [];

    allRecords.forEach(item => {
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

    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    const saldoAtual = totalEntradas - totalSaidas;

    return {
      mesReferencia: targetMonth,
      totalEntradas,
      totalSaidas,
      saldoAtual,
      totalLancamentos: filteredRecords.length,
      recentTransactions: filteredRecords.slice(0, 10)
    };
  }

  saveTransaction(payload) {
    if (!payload.amount || payload.amount <= 0) {
      throw new Error('O valor da transação deve ser maior que zero.');
    }

    let targetSheet = CONFIG.SHEET_NAMES.VENDAS;
    if (payload.type === 'SAIDA') {
      targetSheet = payload.category === 'Conta Fixa' ? CONFIG.SHEET_NAMES.CONTAS : CONFIG.SHEET_NAMES.COMPRAS;
    }

    return this.repository.insertRecord(targetSheet, payload);
  }
}