const vscode = require('vscode');
const sql = require('mssql');

async function escolherPerfil() {
  const opcoes = [];

  const connections = vscode.workspace.getConfiguration().get('xsltSql.connections') || [];

  connections.forEach(cn => {
    const nome = `${cn.server} - ${cn.database}`;
    opcoes.push({ nome, config: cn });
  });

  const opcoesOrdenadas = opcoes.map(op => op.nome).sort();
  opcoesOrdenadas.push('➕ Criar Novo Perfil');

  const opcao = await vscode.window.showQuickPick(opcoesOrdenadas, { placeHolder: 'Escolha um perfil de conexão' });
  if (!opcao) {
    return;
  }

  if (opcao === '➕ Criar Novo Perfil') {
    const novoConfig = await criarNovoPerfil();
    console.log(novoConfig);

    if (!novoConfig?.database) {
      return;
    }

    // Salvar no cache
    async function saveConfigToConnections(novoConfig) {
      const connections = vscode.workspace.getConfiguration().get('xsltSql.connections') || [];

      const index = connections.findIndex(cn => cn.server === novoConfig.server && cn.database === novoConfig.database);

      if (index !== -1) {
        // Update existing connection
        connections[index] = novoConfig;
      } else {
        // Insert new connection
        connections.push(novoConfig);
      }

      await vscode.workspace.getConfiguration().update('xsltSql.connections', connections, vscode.ConfigurationTarget.Global);
    }

    await saveConfigToConnections(novoConfig);
  }

  const opcaoEscolhida = opcoes.find(op => op.nome === opcao);
  const config = opcaoEscolhida ? opcaoEscolhida.config : null;
  console.log({ opcao, opcaoEscolhida, config, opcoes });
  return config;
}

async function criarNovoPerfil() {
  const connections = vscode.workspace.getConfiguration().get('xsltSql.connections') || [];
  const servers = connections.map(cn => cn.server);
  const distinctServers = servers.filter((server, index, self) => self.indexOf(server) === index);

  const server = await vscode.window.showQuickPick(distinctServers, {
    placeHolder: 'Escolha um servidor ou digite um novo',
    canPickMany: false,
    ignoreFocusOut: true
  });

  if (!server) {
    return;
  }

  const user = await vscode.window.showInputBox({ prompt: 'Usuário' });
  if (!user) {
    return;
  }

  const password = await vscode.window.showInputBox({ prompt: 'Senha', password: true });
  if (!password) {
    return;
  }

  let databaseSelection; // Variável para armazenar a seleção de base de dados

  const config = {
    server,
    user,
    password,
    options: {
      trustServerCertificate: true,
      requestTimeout: 60000, // 1 minuto
      applicationName: vscode.env.appName
    }
  };

  const pool = new sql.ConnectionPool(config);

  try {
    const progressOptions = { location: vscode.ProgressLocation.Notification, title: 'Obtendo dados de conexão...' };
    await vscode.window.withProgress(progressOptions, async (progress) => {
      progress.report({ increment: 0 });

      await pool.connect();
      progress.report({ increment: 50 });

      const result = await pool.query('SELECT name FROM sys.databases ORDER BY name'); // Ordenar por nome
      progress.report({ increment: 100 });

      const databases = result.recordset.map(record => record.name);
      databaseSelection = await vscode.window.showQuickPick(databases, { placeHolder: 'Escolha uma base de dados' });
    });
  } catch (err) {
    vscode.window.showErrorMessage('Erro ao conectar: ' + err.message);
  } finally {
    pool.close();
  }

  if (!databaseSelection) {
    return;
  }

  return { server, database: databaseSelection, user, password };
}

async function executarSQL() {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('XSLT em SQL: Nenhum editor ativo!');
      return;
    }

    const sqlQuery = editor.document.getText(editor.selection);
    const config = await escolherPerfil();
    if (!config) {
      vscode.window.showWarningMessage('XSLT em SQL: Nenhum perfil escolhido!');
      return;
    }

    config.options = {
      ...config.options,
      requestTimeout: 60000, // 1 minuto
      trustServerCertificate: true,
      applicationName: vscode.env.appName
    };

    const pool = new sql.ConnectionPool(config);

    try {
      await pool.connect();
      const result = await pool.request().query(sqlQuery);
      vscode.window.showInformationMessage('XSLT em SQL: Query executada com sucesso!');
    } catch (err) {
      vscode.window.showErrorMessage('XSLT em SQL: Erro ao executar query: ' + err);
    } finally {
      pool.close();
    }
  } catch (err) {
    vscode.window.showErrorMessage('XSLT em SQL: Erro ao executar query: ' + err);
  }
}

function activate(context) {
  let disposable = vscode.commands.registerCommand('xsltSql.executarSQL', executarSQL);
  context.subscriptions.push(disposable);

  let codeLensProvider = {
    provideCodeLenses(document, token) {
      const topOfDocument = new vscode.Range(0, 0, 0, 0);
      const runCommandLens = new vscode.CodeLens(topOfDocument, {
        title: "$(play) Executar SQL", // O texto que será exibido
        command: "xsltSql.executarSQL" // O comando a ser executado
      });

      return [runCommandLens];
    }
  };

  let providerDisposable = vscode.languages.registerCodeLensProvider({ language: 'xslt-sql' }, codeLensProvider);
  context.subscriptions.push(providerDisposable);
}

exports.activate = activate;
