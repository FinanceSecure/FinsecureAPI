# LGPD

Este documento e uma base inicial para orientar cuidados com a LGPD na FinanceSecure API. Ele nao substitui revisao juridica.

## Dados tratados

A API pode tratar dados pessoais e financeiros informados pelo usuario, incluindo:

- nome;
- e-mail;
- senha em formato de hash;
- transacoes financeiras;
- investimentos;
- saldos e historicos relacionados.

## Finalidade

Os dados sao usados para:

- autenticar o usuario;
- manter a conta;
- registrar transacoes;
- calcular e consultar informacoes financeiras;
- permitir funcionalidades administrativas restritas.

## Principios aplicados

- coletar apenas dados necessarios para a funcionalidade;
- restringir acesso por autenticacao e autorizacao;
- armazenar senhas somente com hash seguro;
- evitar dados sensiveis em logs;
- permitir exclusao de conta quando aplicavel;
- documentar backup, retencao e restauracao.

## Direitos do titular

O usuario deve poder solicitar:

- confirmacao de tratamento de dados;
- acesso aos dados;
- correcao de dados incompletos ou incorretos;
- exclusao da conta e dos dados associados, respeitando obrigacoes legais;
- informacoes sobre compartilhamento, se houver.

## Backups e retencao

Para producao, a estrategia minima recomendada e usar backups automaticos do MongoDB Atlas, definir uma politica de retencao compativel com a fase do projeto e testar restauracao antes de receber dados reais.

Restauracoes devem ser validadas primeiro em ambiente separado quando possivel, conferindo login, transacoes, investimentos e saldos. Dumps ou copias de banco nao devem ser publicados no repositorio nem enviados por canais sem criptografia.

Copias usadas em teste devem remover ou anonimizar dados pessoais. O processo de exclusao de conta deve considerar o prazo em que dados ainda podem permanecer em backups.

## Pendencias antes de uso real

- definir controlador ou responsavel pelo tratamento dos dados;
- definir canal de contato para solicitacoes LGPD;
- revisar politica de retencao;
- revisar tratamento de dados em backups;
- validar se ha obrigacao legal de manter registros financeiros por prazo especifico;
- submeter a politica de privacidade a revisao juridica.
