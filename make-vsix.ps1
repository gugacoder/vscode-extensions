#
# Para criar projetos de extensão do VSCode:
# 1.  Instale o Yeoman e o gerador de extensão do VSCode:
#     npm install -g yo generator-code
# 2.  Crie o projeto usando o Yeoman e siga as instruções:
#     yo code
#
# Para compilar o pacote vsix:
# 1.  Instale o vsce:
#     npm install -g vsce
# 2.  Execute o comando:
#     vsce package
#

npm run build
vsce package --allow-missing-repository
