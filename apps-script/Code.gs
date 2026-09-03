/**
 * Google Apps Script Web App that receives ?name=&score= GET requests from
 * the Snake game, appends them as a row in the bound Google Spreadsheet,
 * and replies with the submitted score's rank plus the top-5 leaderboard
 * so the game can show it immediately.
 *
 * Uses GET (not POST) on purpose: Apps Script Web Apps serve their actual
 * response via a 302 redirect, and per the fetch spec a POST is downgraded
 * to GET when following a 301/302 redirect - which that redirect target
 * then rejects. A GET request has no such downgrade, so the redirect (and
 * therefore reading the JSON response back in the browser) works reliably.
 *
 * Setup: see README.md in the project root for full deployment steps.
 */

const SHEET_NAME = 'Scores';
const TOP_N = 5;

function doGet(e) {
  const sheet = getOrCreateSheet_();
  const params = (e && e.parameter) || {};

  const name = String(params.name || '匿名').slice(0, 50);
  const score = Number(params.score) || 0;
  const timestamp = new Date();

  sheet.appendRow([timestamp, name, score]);

  const leaderboard = getLeaderboard_(sheet);
  const rank = leaderboard.findIndex(function (row) {
    return row.score === score && row.timestamp.getTime() === timestamp.getTime();
  }) + 1;

  const top = leaderboard.slice(0, TOP_N).map(function (row) {
    return { name: row.name, score: row.score };
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      rank: rank || leaderboard.length,
      total: leaderboard.length,
      top: top
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// returns all rows sorted best-first (higher score wins; earlier timestamp breaks ties)
function getLeaderboard_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 3).getValues(); // Timestamp, Name, Score
  const rows = values.map(function (r) {
    return { timestamp: new Date(r[0]), name: r[1], score: Number(r[2]) || 0 };
  });

  rows.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.timestamp - b.timestamp;
  });

  return rows;
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
