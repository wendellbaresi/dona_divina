class FinanceRepository {
  constructor() {
    this.spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }

  getRecordsBySheet(sheetName, defaultType) {
    const sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    return data.map(row => ({
      id: row[0] || Utilities.getUuid(),
      date: row[1] ? new Date(row[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: row[2] || defaultType,
      category: row[3] || 'Geral',
      description: row[4] || '',
      amount: Number(row[5]) || 0
    }));
  }

  insertRecord(sheetName, transaction) {
    let sheet = this.spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(sheetName);
      sheet.appendRow(['ID', 'Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#E2E8F0');
    }

    const id = Utilities.getUuid();
    const rowData = [
      id,
      transaction.date || new Date(),
      transaction.type || 'GERAL',
      transaction.category || '',
      transaction.description || '',
      transaction.amount || 0
    ];
    
    sheet.appendRow(rowData);
    return { success: true, id };
  }
  
  updateRecord(id, transaction) {
    const sheetsToSearch = [CONFIG.SHEET_NAMES.VENDAS, CONFIG.SHEET_NAMES.COMPRAS, CONFIG.SHEET_NAMES.CONTAS];
    
    for (const sheetName of sheetsToSearch) {
      const sheet = this.spreadsheet.getSheetByName(sheetName);
      if (!sheet) continue;

      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) continue;

      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0] === id) {
          const rowIdx = i + 2;
          sheet.getRange(rowIdx, 2).setValue(transaction.date || new Date());
          sheet.getRange(rowIdx, 3).setValue(transaction.type);
          sheet.getRange(rowIdx, 4).setValue(transaction.category);
          sheet.getRange(rowIdx, 5).setValue(transaction.description);
          sheet.getRange(rowIdx, 6).setValue(transaction.amount);
          return { success: true };
        }
      }
    }
    throw new Error('Registro não encontrado para atualização.');
  }


  deleteRecord(id) {
    const sheetsToSearch = [CONFIG.SHEET_NAMES.VENDAS, CONFIG.SHEET_NAMES.COMPRAS, CONFIG.SHEET_NAMES.CONTAS];

    for (const sheetName of sheetsToSearch) {
      const sheet = this.spreadsheet.getSheetByName(sheetName);
      if (!sheet) continue;

      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) continue;

      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0] === id) {
          sheet.deleteRow(i + 2);
          return { success: true };
        }
      }
    }
    throw new Error('Registro não encontrado para exclusão.');
  }
}