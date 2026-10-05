/**
 * Word Search - shared leaderboard backend (Google Apps Script).
 *
 * HOW TO USE
 *  1. Create a new Google Sheet.  Extensions > Apps Script.
 *  2. Delete the sample code, paste this whole file, click Save.
 *  3. Deploy > New deployment > type "Web app"
 *       Execute as:      Me
 *       Who has access:  Anyone
 *  4. Authorize when asked, then copy the Web app URL (ends with /exec)
 *     and paste it into index.html as  scoreApiUrl.
 *
 * Every finished puzzle becomes one row in the "Scores" sheet, so you can
 * read, sort, filter or download the player details like any spreadsheet.
 * If you change this code later: Deploy > Manage deployments > Edit > New version.
 */

var SHEET_NAME = 'Scores';
var HEADERS = ['Timestamp', 'Name', 'Roll No', 'Unit', 'Score', 'Time (s)',
               'Words found', 'Hints used', 'Player ID', 'Submission ID'];
var UNITS = 5;          // number of units in the game
var MAX_SCORE = 1000;   // 8 words x 100 = 800 is the real maximum

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    // Name / Roll No / Player ID / Submission ID are plain text, so nothing typed
    // by a player can ever be treated as a spreadsheet formula.
    sh.getRange('B:C').setNumberFormat('@');
    sh.getRange('I:J').setNumberFormat('@');
  }
  return sh;
}

function clean_(value, maxLen) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// A short anonymous id so players can be grouped without publishing roll numbers.
function playerId_(roll, name) {
  var key = roll ? 'R:' + roll.toUpperCase() : 'N:' + name.toLowerCase();
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key);
  return bytes.map(function (b) {
    var h = (b < 0 ? b + 256 : b).toString(16);
    return h.length < 2 ? '0' + h : h;
  }).join('').slice(0, 12);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Save a finished puzzle.
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);

    var name = clean_(d.name, 40);
    var roll = clean_(d.roll, 20);
    var sid = clean_(d.sid, 40);
    var unit = Number(d.unit), score = Number(d.score), time = Number(d.time);
    var words = Number(d.wordsFound), hints = Number(d.hintsUsed);

    if (!name) return json_({ ok: false, error: 'name is required' });
    if (!(unit >= 1 && unit <= UNITS && unit % 1 === 0)) return json_({ ok: false, error: 'bad unit' });
    if (!(score >= 0 && score <= MAX_SCORE)) return json_({ ok: false, error: 'bad score' });
    if (!(time >= 0 && time <= 86400)) return json_({ ok: false, error: 'bad time' });
    if (!(words >= 0 && words <= 20)) words = 0;
    if (!(hints >= 0 && hints <= 100)) hints = 0;

    var pid = playerId_(roll, name);
    var sh = getSheet_();

    // The app may re-send a score if the network dropped; ignore repeats.
    if (sid && sh.createTextFinder(sid).matchEntireCell(true).findNext()) {
      return json_({ ok: true, duplicate: true, pid: pid });
    }

    sh.appendRow([new Date(), name, roll, unit, Math.round(score), Math.round(time),
                  words, hints, pid, sid]);
    return json_({ ok: true, pid: pid });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) { /* not locked */ }
  }
}

// Read the leaderboard data (names and scores only - roll numbers are NOT sent).
function doGet(e) {
  try {
    var sh = getSheet_();
    var last = sh.getLastRow();
    var scores = [];
    if (last > 1) {
      var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
      rows.forEach(function (r) {
        scores.push({
          name: String(r[1]), unit: Number(r[3]), score: Number(r[4]),
          time: Number(r[5]), pid: String(r[8])
        });
      });
    }
    return json_({ ok: true, scores: scores });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
