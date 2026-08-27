// FitTrack → Google Sheets receiver
// Pegá este archivo en el editor de Apps Script (Extensions → Apps Script)
// del Google Sheet donde querés guardar los datos.
//
// Luego: Deploy → New deployment → Web App
//   Execute as: Me
//   Who has access: Anyone
// Copiá la URL del deployment → esa es tu APPS_SCRIPT_URL

var SECRET = 'REEMPLAZAR_CON_TU_SECRET'; // mismo valor que SHEETS_SECRET en Vercel

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (!payload.secret || payload.secret !== SECRET) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(payload.sheet);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'hoja no encontrada: ' + payload.sheet }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var rows = payload.rows || [];
    rows.forEach(function(row) {
      sheet.appendRow(row);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, appended: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Correlo desde el editor para verificar que todo funciona antes de deployar
function testDoPost() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        secret: SECRET,
        sheet:  'Gym',
        rows:   [['2025-01-01', 'Sentadilla', 4, 8, 100]]
      })
    }
  };
  Logger.log(doPost(fakeEvent).getContent());
}
