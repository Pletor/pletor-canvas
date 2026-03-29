import * as vscode from 'vscode'

export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    enableScripts: true,
    localResourceRoots: [
      vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist'),
      vscode.Uri.joinPath(extensionUri, 'resources'),
    ],
  }
}

export function buildWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  initialData: unknown,
): string {
  const distUri = vscode.Uri.joinPath(extensionUri, 'webview-ui', 'dist')

  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distUri, 'assets', 'index.js'))
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(distUri, 'assets', 'index.css'))
  const nonce = getNonce()

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}; img-src ${webview.cspSource} data:;">
  <link rel="stylesheet" href="${styleUri}">
  <title>Pletor</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">
    window.__PLETOR_INITIAL_DATA__ = ${JSON.stringify(initialData)};
    window.__PLETOR_VSCODE__ = true;
  </script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`
}

function getNonce(): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
