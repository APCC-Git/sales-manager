import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scriptUrl = searchParams.get('scriptUrl');
  const sheetUrl = searchParams.get('sheetUrl');
  const sheetName = searchParams.get('sheetName');

  if (!scriptUrl || !sheetUrl || !sheetName) {
    return NextResponse.json(
      { error: 'SpreadSheet,GoogleAppsScriptの設定を行ってください。' },
      { status: 400 }
    );
  }

  const targetUrl = `${scriptUrl}?sheetUrl=${encodeURIComponent(sheetUrl)}&sheetName=${encodeURIComponent(sheetName)}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
    });

    // レスポンスのステータスコードをチェック
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: 'GASからのエラーレスポンスを解析できませんでした。' }));
      console.error(`GAS API Error (GET): ${res.status} - ${errorData.message}`);
      return NextResponse.json(
        { error: `GAS APIからのエラー: ${res.status} - ${errorData.message || '不明なエラー'}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!data.success) {
      return NextResponse.json(
        { error: data.message || 'GAS APIからのエラー' },
        { status: data.status || 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    // ネットワークエラーやその他の例外をキャッチ
    console.error('GAS API Fetch Error (GET):', error);
    return NextResponse.json(
      { error: 'GAS APIへの接続中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.sheetUrl || !body.sheetName || !body.scriptUrl || !body.scriptToken)
    return NextResponse.json(
      { error: 'SpreadSheet,GoogleAppsScriptの設定を行ってください。' },
      { status: 400 }
    );

  if (!body.timestamp || !body.jst || !body.name || !body.payment || !body.method)
    return NextResponse.json({ error: '不正なリクエスト形式です。' }, { status: 400 });

  const requestBody = {
    timestamp: body.timestamp,
    jst: body.jst,
    name: body.name,
    payment: body.payment,
    method: body.method,
    sheetUrl: body.sheetUrl,
    sheetName: body.sheetName,
    token: body.scriptToken,
  };

  try {
    const res = await fetch(`${body.scriptUrl}?method=post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // レスポンスのステータスコードをチェック
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: 'GASからのエラーレスポンスを解析できませんでした。' }));
      console.error(`GAS API Error (POST): ${res.status} - ${errorData.message}`);
      return NextResponse.json(
        { error: `GAS APIからのエラー: ${res.status} - ${errorData.message || '不明なエラー'}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // GASはステータスコードを設定できないのでsuccessでエラーハンドリング
    if (!data.success) {
      return NextResponse.json(
        { error: data.message || 'GAS APIからのエラー' },
        { status: data.status || 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    // ネットワークエラーやその他の例外をキャッチ
    console.error('GAS API Fetch Error (POST):', error);
    return NextResponse.json(
      { error: 'GAS APIへの接続中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();

  if (!body.sheetUrl || !body.sheetName || !body.scriptUrl || !body.scriptToken) {
    return NextResponse.json(
      { error: 'SpreadSheet,GoogleAppsScriptの設定を行ってください。' },
      { status: 400 }
    );
  }

  if (!body.name) {
    return NextResponse.json({ error: '不正なリクエスト形式です。' }, { status: 400 });
  }

  try {
    const res = await fetch(`${body.scriptUrl}?method=delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        sheetUrl: body.sheetUrl,
        sheetName: body.sheetName,
        token: body.scriptToken,
      }),
    });

    // レスポンスのステータスコードをチェック
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: 'GASからのエラーレスポンスを解析できませんでした。' }));
      console.error(`GAS API Error (DELETE): ${res.status} - ${errorData.message}`);
    }

    const data = await res.json();
    if (!data.success) {
      return NextResponse.json(
        { error: data.message || 'GAS APIからのエラー' },
        { status: data.status || 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('GAS API Fetch Error (DELETE):', error);
    return NextResponse.json(
      { error: 'GAS APIへの接続中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
