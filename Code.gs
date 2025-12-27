/**
 * 讀取附件清單工作表，回傳 {code, name, url} 的物件陣列。
 * @param {string} [sheetName='附件清單'] 指定附件清單的工作表名稱，預設尋找「附件清單」。
 * @returns {Array<{code:string,name:string,url:string}>}
 */
function getAttachmentList(sheetName) {
  const targetSheetName = sheetName || '附件清單';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(targetSheetName) || ss.getSheetByName('附件名稱');
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  return rows
    .map(([code, name, url]) => ({
      code: (code || '').toString().trim(),
      name: (name || '').toString().trim(),
      url: (url || '').toString().trim(),
    }))
    .filter(item => item.url);
}

/**
 * 範例：在 doGet 中併入附件資料，並保留既有回應結構。
 */
function doGet(e) {
  // 先取得既有的會議資料。如果有現成的函式可用（例如 getMeetingRecords 或 buildResponse），優先使用。
  let data = [];
  if (typeof getMeetingRecords === 'function') {
    data = getMeetingRecords(e);
  } else if (typeof buildResponse === 'function') {
    const base = buildResponse(e);
    data = base && base.data ? base.data : [];
  }

  const attachments = getAttachmentList();

  const response = {
    success: true,
    data,
    attachments,
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
