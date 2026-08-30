/**
 * Google Apps Script Web App that receives {name, score} POSTs from the
 * Snake game and appends them as a row in the bound Google Spreadsheet.
 *
 * Setup: see README.md in the project root for full deployment steps.
 */

const SHEET_NAME = 'Scores';

function doPost(e) {
  const sheet = getOrCreateSheet_();
  const data = JSON.parse(e.postData.contents);

  const name = String(data.name || '匿名').slice(0, 50);
  const score = Number(data.score) || 0;

  sheet.appendRow([new Date(), name, score]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Score']);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}
