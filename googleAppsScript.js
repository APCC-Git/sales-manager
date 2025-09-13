const SECRET_KEY = 'MY_SECRET_KEY'; // APIキー

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const param = e.parameter.method;

  // API認証
  if (data.token !== SECRET_KEY) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: 'SECRET_KEYが違います。', code: 401 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (!data.sheetName || !data.sheetUrl) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: '不正なリクエスト形式です。', code: 400 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.openByUrl(data.sheetUrl).getSheetByName(data.sheetName);

  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: 'スプレッドシートが見つかりません。', code: 404 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // GET,POST以外のMethodが使えないのでGET以外はクエリパラメータで条件分岐
  if (param === 'post' || !param) {
    if (!data.timestamp || !data.jst || !data.name || !data.payment || !data.method) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: '不正なリクエスト形式です。', code: 400 })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // POST: データ追加 (timestamp, jst, payment, method, name)
    sheet.appendRow([data.timestamp, data.jst, data.name, data.payment, data.method]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: '売上が追加されました。', code: 201 })
    ).setMimeType(ContentService.MimeType.JSON);
  } else if (param === 'delete') {
    if (!data.name) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: '不正なリクエスト形式です。', code: 400 })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // データ取得
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const nameIndex = headers.indexOf('name'); // "name" 列を探す

    if (nameIndex === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: 'name列が見つかりません。', code: 500 })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // 下から上へ走査して一致する最後の行を削除
    for (let i = allData.length - 1; i > 0; i--) {
      if (allData[i][nameIndex] === data.name) {
        sheet.deleteRow(i + 1); // 配列は0始まり、シートは1始まり
        return ContentService.createTextOutput(
          JSON.stringify({
            success: true,
            message: `${data.name}の最新データを一件削除しました。`,
            code: 200,
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 見つからなかった場合
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: `指定された名前(${data.name})のデータが見つかりません。`,
        code: 404,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET: データ取得
function doGet(e) {
  if (!e.parameter) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: '不正なリクエスト形式です。', code: 400 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const param = e.parameter;

  if (!param.sheetUrl || !param.sheetName) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: '不正なリクエスト形式です。', code: 400 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const sheetUrl = decodeURIComponent(param.sheetUrl);
  const sheetName = decodeURIComponent(param.sheetName);

  const sheet = SpreadsheetApp.openByUrl(sheetUrl).getSheetByName(sheetName);

  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: 'スプレッドシートが見つかりません', code: 404 })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  const values = sheet.getDataRange().getValues();

  // 1行目をヘッダーにしてオブジェクト化
  const [header, ...rows] = values;
  const result = rows.map(row => {
    let obj = {};
    header.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}
