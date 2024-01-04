# Suporte à Linguagem XSLT em SQL para Visual Studio Code

Esta extensão fornece suporte para a edição e visualização de XSLT em arquivos SQL no Visual Studio Code. Ela inclui realce de sintaxe e suporte a folding para trechos XML dentro de arquivos SQL, melhorando a experiência de escrita e leitura de XSLT embutido em SQL.

## Características

- Realce de sintaxe para XML/XSLT dentro de arquivos `.xslt.sql`.
- Folding (recolhimento) de código XML para melhorar a visibilidade e organização do código.
- Integração com a funcionalidade de SQL do Visual Studio Code para uma experiência unificada de edição.

## Instalação

Para instalar manualmente a extensão "XSLT em SQL", siga estes passos:

1. Obtenha uma cópia do arquivo `xslt-sql-*.vsix`.
2. Abra o Visual Studio Code.
3. Acesse a aba de Extensões (`Ctrl+Shift+X` ou `Cmd+Shift+X` no macOS).
4. Clique no ícone de três pontos (...) no canto superior direito da aba de Extensões.
5. Escolha "Install from VSIX..." e selecione o arquivo `xslt-sql-*.vsix` baixado.
6. Siga as instruções na tela para concluir a instalação.

## Uso

- Abra qualquer arquivo com a extensão `.xslt.sql` com o Visual Studio Code.
- Escreva ou edite seu XSLT dentro do SQL e aproveite o realce de sintaxe e o folding de código.
- Para executar uma consulta SQL, use o atalho de teclado `F5` ou pressione `Ctrl+P`, digite `>XSLT em SQL: Executar SQL` e selecione o comando.

My apologies for the confusion. Here's the revised section:

## Exemplo de Arquivo .xslt.sql

Aqui está um exemplo de um arquivo `.xslt.sql` que demonstra o uso de XSLT embutido em SQL:

```sql
-- Exemplo de arquivo .xslt.sql
DECLARE @xmlData XML = '<root><item>Exemplo</item></root>';
DECLARE @xsltTemplate NVARCHAR(MAX) = '
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/root">
    <html>
      <body>
        <h1><xsl:value-of select="item"/></h1>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>';

-- Aplicar a transformação XSLT ao XML
SELECT @xmlData.query('sql:variable("@xsltTemplate")');
```

Este é um exemplo simples de como incorporar XSLT em um arquivo `.xslt.sql` para transformar XML usando uma folha de estilo XSLT.

## Contribuindo

Contribuições são bem-vindas! Se você deseja melhorar a extensão, sinta-se à vontade para forkar o repositório e enviar suas pull requests.

## Licença

Esta extensão está sob a licença [LGPLv3](https://www.gnu.org/licenses/lgpl-3.0.html).
