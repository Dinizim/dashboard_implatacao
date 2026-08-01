# Schema do Banco de Dados — Atenthos

> Gerado automaticamente a partir do banco no Neon.
> 56 tabelas no total.

---

## Implantação (usadas pelo dashboard)

### `cliente`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idcliente` 🔑 | int | ❌ | autoincrement |
| `nomecliente` | varchar(100) | ✅ | — |
| `cnpj` | varchar(14) | ✅ | — |
| `quantidadelicenca` | int | ✅ | — |
| `statuscontrato` | varchar(100) | ✅ | — |
| `diasatraso` | date | ✅ | — |
| `modulo` | varchar(200) | ✅ | — |
| `statusimplantacao` | varchar(100) | ✅ | — |
| `statuscliente` | varchar(100) | ✅ | — |
| `logradouro` | varchar(200) | ✅ | — |
| `numero` | varchar(10) | ✅ | — |
| `complemento` | varchar(50) | ✅ | — |
| `bairro` | varchar(50) | ✅ | — |
| `cidade` | varchar(50) | ✅ | — |
| `uf` | varchar(2) | ✅ | — |
| `cep` | varchar(8) | ✅ | — |
| `ddd` | varchar(2) | ✅ | — |
| `telefone` | varchar(20) | ✅ | — |
| `cpf` | varchar(11) | ✅ | — |
| `tipocliente` | int | ✅ | — |
| `totaldiasatraso` | int | ✅ | — |
| `cliente_revenda` | bool | ✅ | — |
| `observacao` | varchar(5000) | ✅ | — |
| `razao_social` | varchar(254) | ✅ | — |
| `data_nascimento` | date | ✅ | — |
| `rg` | varchar(30) | ✅ | — |
| `ie` | varchar(20) | ✅ | — |
| `revendaid` | int | ✅ | — |
| `revendanome` | varchar(100) | ✅ | — |
| `cpf_responsavel` | varchar(11) | ✅ | — |
| `datacadastro` | date | ✅ | — |
| `etapakickoff` | bool | ✅ | false |
| `etapainstalacao` | bool | ✅ | false |
| `etapacadastro` | bool | ✅ | false |
| `etapavendas` | bool | ✅ | false |
| `etapasuportedefinitivo` | bool | ✅ | false |
| `etapafinanceiro` | bool | ✅ | false |
| `etaparelatorio` | bool | ✅ | false |
| `etapaespeciais` | bool | ✅ | false |
| `idgrupocliente` | int | ✅ | — |
| `dataassinaturacontrato` | date | ✅ | — |
| `clientecancelado` | bool | ✅ | — |
| `congelado` | bool | ✅ | — |
| `bloqueaprazo` | bool | ✅ | — |
| `datasuportedefinitivo` | date | ✅ | — |
| `contratoathos` | bool | ✅ | — |
| `contratoponthos` | bool | ✅ | — |
| `contratosat` | bool | ✅ | — |
| `idclienteflag` | int | ✅ | — |
| `dataterminoflag` | date | ✅ | — |
| `dataetapakickoff` | date | ✅ | — |
| `dataetapainstalacao` | date | ✅ | — |
| `dataetapacadastro` | date | ✅ | — |
| `dataetapavendas` | date | ✅ | — |
| `dataetaparelatorio` | date | ✅ | — |
| `dataetapafinanceiro` | date | ✅ | — |
| `dataetapaespeciais` | date | ✅ | — |
| `contratoathoslite` | bool | ✅ | — |
| `parcelasatraso` | int | ✅ | — |

### `ocorrencia`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idocorrencia` 🔑 | int | ❌ | autoincrement |
| `idtipoatendimento` | int | ✅ | — |
| `iddepartamento` | int | ✅ | — |
| `idmodulosistema` | int | ✅ | — |
| `idstatuschamado` | int | ✅ | — |
| `dataabertura` | date | ✅ | — |
| `horaabertura` | time | ✅ | — |
| `datafechamento` | date | ✅ | — |
| `horafechamento` | time | ✅ | — |
| `dataalteracao` | date | ✅ | — |
| `horaalteracao` | time | ✅ | — |
| `descricao` | text | ✅ | — |
| `id_usuario_abertura` | int | ✅ | — |
| `id_usuario_responsavel` | int | ✅ | — |
| `idcliente` | int | ✅ | — |
| `versao_sistema` | varchar(20) | ✅ | — |
| `contato` | varchar(60) | ✅ | — |
| `problema` | varchar(100) | ✅ | — |
| `lido` | bool | ✅ | — |
| `os_aberta_contrathos` | bool | ✅ | — |
| `chamadoura` | bool | ✅ | — |
| `foivisualizado` | bool | ✅ | — |
| `slafinal` | varchar | ✅ | — |
| `data_previsao_entrega` | date | ✅ | — |
| `id_email_contato_cliente` | int | ✅ | — |
| `ramal` | varchar(50) | ✅ | — |
| `avaliacao` | int | ✅ | — |
| `horachegada` | time | ✅ | — |
| `horasaida` | time | ✅ | — |
| `horainicioatendimento` | time | ✅ | — |
| `tempoatendimento` | time | ✅ | — |
| `iddesenvolvedorresponsavel` | int | ✅ | — |
| `urgente` | bool | ✅ | false |
| `idusuariologadourgente` | int | ✅ | — |
| `avaliacaourl` | int | ✅ | — |
| `notaavaliathos` | int | ✅ | — |
| `localavaliathos` | text | ✅ | — |
| `dataavaliathos` | date | ✅ | — |
| `horaavaliathos` | time | ✅ | — |
| `obsavaliathos` | text | ✅ | — |
| `idrevenda` | int | ✅ | — |
| `datainicioatendimento` | date | ✅ | — |
| `ematendimento` | bool | ✅ | — |
| `localavaliathosentrada` | text | ✅ | — |
| `dataavaliathosentrada` | date | ✅ | — |
| `horaavaliathosentrada` | time | ✅ | — |
| `periodoatendimento` | varchar(50) | ✅ | — |
| `idclienteveiculo` | int | ✅ | — |
| `quilometragem` | int | ✅ | — |
| `datavenda` | date | ✅ | — |
| `datagarantia` | date | ✅ | — |
| `nivelcombustivel` | varchar(10) | ✅ | — |
| `issue_jira` | varchar(20) | ✅ | — |
| `solicita_atuacao` | bool | ✅ | false |

### `descricao_historico`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `iddescricaohistorico` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `idocorrencia` | int | ✅ | — |
| `descricao` | varchar(5000) | ✅ | — |
| `datahistorico` | date | ✅ | — |
| `horahistorico` | time | ✅ | — |
| `solucao` | bool | ✅ | — |
| `slaassentamento` | varchar | ✅ | — |

### `ocorrencia_caracteristicaos`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idocorrencia` | int | ✅ | — |
| `idcaracteristicaos` | int | ✅ | — |

## Clientes

### `cliente_contato`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idclientecontato` 🔑 | int | ❌ | autoincrement |
| `idcliente` | int | ✅ | — |
| `contato` | varchar(250) | ✅ | — |
| `ddd_telefone` | varchar(2) | ✅ | — |
| `telefone` | varchar(20) | ✅ | — |
| `operadora` | varchar(50) | ✅ | — |
| `emailcontato` | varchar(100) | ✅ | — |
| `origem` | varchar(10) | ✅ | — |

### `cliente_contato_tecnico`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idclientecontatotecnico` 🔑 | int | ❌ | autoincrement |
| `idcliente` | int | ✅ | — |
| `contato` | varchar(250) | ✅ | — |
| `ddd_telefone` | varchar(2) | ✅ | — |
| `telefone` | varchar(20) | ✅ | — |
| `operadora` | varchar(50) | ✅ | — |
| `emailcontato` | varchar(100) | ✅ | — |

### `cliente_flag`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idclienteflag` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(100) | ✅ | — |
| `cor` | int | ✅ | — |
| `dias` | int | ✅ | — |

### `cliente_grupo`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idgrupocliente` | int | ❌ | — |
| `descricao` | varchar(100) | ✅ | — |
| `taxa` | numeric | ✅ | — |

### `cliente_veiculo`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idclienteveiculo` 🔑 | int | ❌ | autoincrement |
| `idcliente` | int | ✅ | — |
| `modelo` | varchar(50) | ✅ | — |
| `marca` | varchar(50) | ✅ | — |
| `cor` | varchar(50) | ✅ | — |
| `placa` | varchar(8) | ✅ | — |
| `chassi` | varchar(20) | ✅ | — |
| `renavam` | varchar(12) | ✅ | — |
| `motor` | varchar(20) | ✅ | — |
| `anofabricacao` | int | ✅ | — |
| `anomodelo` | int | ✅ | — |
| `idusuariocadastro` | int | ✅ | — |
| `idusuarioalteracao` | int | ✅ | — |
| `datacadastro` | date | ✅ | — |
| `dataalteracao` | date | ✅ | — |
| `status` | bool | ✅ | — |

## Ocorrências

### `ocorrencia_acompanha`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_ocorrencia_acompanha` 🔑 | int | ❌ | autoincrement |
| `id_ocorrencia` | int | ✅ | — |
| `id_funcionario` | int | ✅ | — |
| `cor_hexadecimal` | varchar(7) | ✅ | — |

### `ocorrencia_anexo`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_ocorrencia_anexo` 🔑 | int | ❌ | autoincrement |
| `idocorrencia` | int | ✅ | — |
| `caminho` | varchar(100) | ✅ | — |
| `data` | date | ✅ | — |
| `hora` | time | ✅ | — |

### `ocorrencia_atuacao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idocorrenciaatuacao` 🔑 | int | ❌ | autoincrement |
| `idocorrencia` | int | ✅ | — |
| `idfuncionario` | int | ✅ | — |
| `datainicio` | date | ✅ | — |
| `horainicio` | time | ✅ | — |
| `datafim` | date | ✅ | — |
| `horafim` | time | ✅ | — |
| `tempoatuacao` | time | ✅ | — |

### `historico_ocorrencia`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `total_dias` | int | ✅ | — |
| `otimo` | int | ✅ | — |
| `bom` | int | ✅ | — |
| `regular` | int | ✅ | — |
| `ruim` | int | ✅ | — |
| `muito_ruim` | int | ✅ | — |
| `emailregular` | text | ✅ | — |
| `emailruim` | text | ✅ | — |
| `emailmuitoruim` | text | ✅ | — |
| `telegramregular` | text | ✅ | — |
| `telegramruim` | text | ✅ | — |
| `telegrammuitoruim` | text | ✅ | — |

### `historico_encaminhamento_os`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idhistorico_encaminhamento` 🔑 | int | ❌ | autoincrement |
| `data` | date | ✅ | now() |
| `idusuario_logado` | int | ✅ | — |
| `idocorrencia` | int | ✅ | — |
| `idusuario_destinatario` | int | ✅ | — |
| `iddepartamento_destinatario` | int | ✅ | — |
| `idstatus` | int | ✅ | — |

### `obs_pausa`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idobspausa` 🔑 | int | ❌ | autoincrement |
| `idocorrencia` | int | ✅ | — |
| `idfuncionario` | int | ✅ | — |
| `descricao` | varchar(100) | ✅ | — |
| `datahistoricoobs` | date | ✅ | — |
| `horahistoricoobs` | time | ✅ | — |

## Configuração e acesso

### `configuracao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `cadastrarcliente` | bool | ❌ | — |
| `usacargadedados` | bool | ✅ | — |
| `sistemacarga` | int | ✅ | — |
| `versaobanco` | int | ✅ | — |
| `quantlicencas` | int | ✅ | — |
| `cadastrarfuncionario` | bool | ✅ | — |
| `host` | varchar(100) | ✅ | — |
| `porta` | varchar(100) | ✅ | — |
| `usuario` | varchar(100) | ✅ | — |
| `senha` | varchar(100) | ✅ | — |
| `caminho` | varchar(100) | ✅ | — |
| `versaosistema` | varchar(20) | ✅ | — |
| `permite_logar_desatualizado` | bool | ✅ | — |
| `data_ultima_sincronizacao` | date | ✅ | — |
| `usaftp` | bool | ✅ | — |
| `host_secundario` | varchar(100) | ✅ | — |
| `porta_secundario` | varchar(100) | ✅ | — |
| `usuario_secundario` | varchar(100) | ✅ | — |
| `senha_secundario` | varchar(100) | ✅ | — |
| `caminho_secundario` | varchar(100) | ✅ | — |
| `mensagem_obs_impresso` | varchar(500) | ✅ | — |
| `qtdabertapendente` | int | ✅ | — |
| `qtdosaberta` | int | ✅ | — |
| `qtdosresponsavel` | int | ✅ | — |
| `enviarhistoricoemail` | bool | ✅ | — |
| `enviarhistoricotelegram` | bool | ✅ | — |

### `configuracao_labels`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_configuracao_labels` 🔑 | int | ❌ | autoincrement |
| `label_versao` | varchar(100) | ✅ | — |
| `label_tipo_atendimento` | varchar(100) | ✅ | — |
| `label_modulo_atendimento` | varchar(100) | ✅ | — |
| `label_problema` | varchar(100) | ✅ | — |
| `label_data_previsao` | varchar(100) | ✅ | — |
| `utiliza_padrao` | bool | ✅ | — |

### `configuracao_terminal`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_configuracao_terminal` 🔑 | int | ❌ | autoincrement |
| `nome_terminal` | varchar(60) | ✅ | — |
| `ramal` | varchar(50) | ✅ | — |

### `config_email`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `servidorsmtp` | varchar(50) | ✅ | — |
| `porta` | varchar(50) | ✅ | — |
| `usuario` | varchar(60) | ✅ | — |
| `senha` | varchar(60) | ✅ | — |
| `conexaosmtpsegura` | bool | ✅ | — |

### `empresa`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idempresa` 🔑 | int | ❌ | autoincrement |
| `razaosocial` | varchar(100) | ✅ | — |
| `nomefantasia` | varchar(100) | ✅ | — |
| `ie` | varchar(30) | ✅ | — |
| `cnpj` | varchar(14) | ✅ | — |
| `logoempresa` | int | ✅ | — |
| `enderecocep` | varchar(8) | ✅ | — |
| `enderecologradouro` | varchar(200) | ✅ | — |
| `endereconumero` | varchar(10) | ✅ | — |
| `enderecocomplemento` | varchar(50) | ✅ | — |
| `enderecobairro` | varchar(50) | ✅ | — |
| `enderecocidade` | varchar(50) | ✅ | — |
| `enderecouf` | character | ✅ | — |
| `fone1ddd` | varchar(2) | ✅ | — |
| `telefone1` | varchar(10) | ✅ | — |
| `fone2ddd` | varchar(2) | ✅ | — |
| `telefone2` | varchar(10) | ✅ | — |
| `fax` | varchar(10) | ✅ | — |
| `email` | varchar(50) | ✅ | — |
| `responsavelnome` | varchar(100) | ✅ | — |
| `responsavelcpf` | varchar(11) | ✅ | — |
| `responsavelrg` | varchar(30) | ✅ | — |
| `responsavelcelular` | varchar(10) | ✅ | — |
| `responsavel2nome` | varchar(100) | ✅ | — |
| `responsavel2cpf` | varchar(11) | ✅ | — |
| `responsavel2rg` | varchar(30) | ✅ | — |
| `responsavel2celular` | varchar(10) | ✅ | — |
| `site` | varchar(50) | ✅ | — |
| `assinatura` | int | ✅ | — |
| `im` | varchar(30) | ✅ | — |
| `idcnae` | int | ✅ | — |
| `suframa` | varchar(50) | ✅ | — |
| `faxddd` | varchar(2) | ✅ | — |
| `fone1operadora` | varchar(50) | ✅ | — |
| `foneoperadora2` | varchar(50) | ✅ | — |
| `faxoperadora` | varchar(50) | ✅ | — |
| `dddresponsavel1` | varchar(50) | ✅ | — |
| `operadoraresponsavel1` | varchar(50) | ✅ | — |
| `dddresponsavel2` | varchar(2) | ✅ | — |
| `operadoraresponsavel2` | varchar(50) | ✅ | — |
| `img_empresa` | bytea | ✅ | — |

## Funcionários e permissões

### `funcionario`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idfuncionario` 🔑 | int | ❌ | autoincrement |
| `iddepartamento` | int | ✅ | — |
| `nome` | varchar(100) | ✅ | — |
| `nascimento` | date | ✅ | — |
| `cpf` | varchar(11) | ✅ | — |
| `rg` | varchar(30) | ✅ | — |
| `dataadmissao` | date | ✅ | — |
| `salario` | numeric | ✅ | — |
| `telefone` | varchar(10) | ✅ | — |
| `celular` | varchar(10) | ✅ | — |
| `foto` | int | ✅ | — |
| `statusfuncionario` | bool | ✅ | — |
| `enderecocep` | varchar(8) | ✅ | — |
| `enderecologradouro` | varchar(200) | ✅ | — |
| `endereconumero` | varchar(10) | ✅ | — |
| `enderecocomplmento` | varchar(50) | ✅ | — |
| `enderecobairro` | varchar(50) | ✅ | — |
| `enderecocidade` | varchar(50) | ✅ | — |
| `enderecouf` | varchar(2) | ✅ | — |
| `observacao` | varchar(100) | ✅ | — |
| `email` | varchar(100) | ✅ | — |
| `datacriacao` | date | ✅ | — |
| `horacriacao` | time | ✅ | — |
| `dataalteracao` | date | ✅ | — |
| `horaalteracao` | time | ✅ | — |
| `dddtelefone` | varchar(2) | ✅ | — |
| `operadoratelefone` | varchar(50) | ✅ | — |
| `operadoracelular` | varchar(50) | ✅ | — |
| `dddcelular` | varchar(2) | ✅ | — |
| `login` | varchar(20) | ✅ | — |
| `senha` | varchar(100) | ✅ | — |
| `nao_recebe_email` | bool | ✅ | — |
| `idhorasuteis` | int | ✅ | — |
| `trello` | varchar(100) | ✅ | — |
| `resposta_automatica` | bool | ✅ | — |
| `mensagem_automatica` | varchar(500) | ✅ | — |
| `utilizaavaliathos` | bool | ✅ | false |
| `idprime` | bigint | ✅ | — |

### `acesso_cliente`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_cliente` 🔑 | int | ❌ | autoincrement |
| `id_funcionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_consultar` | bool | ✅ | — |
| `btn_importar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

### `acesso_configuracao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_configuracao` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao_acesso` | bool | ✅ | — |

### `acesso_departamento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_departamento` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_excluir` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

### `acesso_duracao_atendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_empresa`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_empresa` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

### `acesso_etapaatendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_etapaatendimento` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_excluir` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

### `acesso_funcionario`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_funcioanario` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_consultar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |
| `permitir_alterar_caracteristica` | bool | ✅ | false |

### `acesso_grafico_atendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_horas_uteis`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idfuncionario` 🔑 | int | ❌ | autoincrement |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |
| `btn_excluir` | bool | ✅ | — |
| `btn_novo` | bool | ✅ | — |

### `acesso_media_satisfacao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_media_satisfacao_detalhada`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_moduloatendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_moduloatendimento` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_excluir` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

### `acesso_os`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_os` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_atender` | bool | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_encerrar` | bool | ✅ | — |
| `btn_definir_etapa` | bool | ✅ | — |
| `btn_imprimir` | bool | ✅ | — |
| `btn_encaminha_dpto` | bool | ✅ | — |
| `btn_ecaminha_usu` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |
| `permite_altera_previsao_entrega` | bool | ✅ | — |
| `permite_desmarcar_etapa` | bool | ✅ | false |
| `finaliza_os_varios_dep` | bool | ✅ | false |
| `liberar_excesso_os` | bool | ✅ | false |
| `btn_enviar_jira` | bool | ✅ | false |

### `acesso_relatorio_caracteristicaos`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_relatorio_chamados_resolvidos_dentro_prazo`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_relatorio_cliente`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_relatorio_departamento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_relatorio_gerenciamento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idfuncionario` 🔑 | int | ❌ | autoincrement |
| `permissao` | bool | ✅ | — |
| `idacesso` 🔑 | int | ❌ | autoincrement |

### `acesso_relatorio_historico_encaminhamentoos`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_relatorio_usuario`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idacesso` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `permissao` | bool | ✅ | — |

### `acesso_tipoatendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_tipoatendimento` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_excluir` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

### `acesso_usuario_departamento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_usuario_departamento` 🔑 | int | ❌ | autoincrement |
| `idfuncionario` | int | ✅ | — |
| `iddepartamento` | int | ✅ | — |
| `nao_permite_encaminhar_os` | bool | ✅ | — |

### `acesso_usuario_os`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_usuario_os` 🔑 | int | ❌ | autoincrement |
| `idfuncionario_de` | int | ✅ | — |
| `idfuncionario_para` | int | ✅ | — |
| `nao_permite_encaminhar_os` | bool | ✅ | — |

### `acesso_versao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_acesso_versao` 🔑 | int | ❌ | autoincrement |
| `id_funcionario` | int | ✅ | — |
| `btn_novo` | bool | ✅ | — |
| `btn_alterar` | bool | ✅ | — |
| `btn_gravar` | bool | ✅ | — |

## Suporte e atendimento

### `departamento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `iddepartamento` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(50) | ✅ | — |
| `padrao` | bool | ✅ | — |
| `email` | varchar(50) | ✅ | — |
| `status` | bool | ✅ | — |
| `mensagem` | varchar(1000) | ✅ | — |
| `congelado` | bool | ✅ | — |

### `etapa_atendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idetapaatendimento` 🔑 | int | ❌ | autoincrement |
| `idstatuschamado` | int | ✅ | — |
| `descricao` | varchar(60) | ✅ | — |

### `status_chamado`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idstatuschamado` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(100) | ✅ | — |

### `tipo_atendimento`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idtipoatendimento` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(50) | ✅ | — |
| `status` | bool | ✅ | — |
| `sla` | time | ✅ | — |

### `caracteristicaos`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idcaracteristicaos` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(250) | ✅ | — |
| `status` | bool | ✅ | — |
| `idresponsavelsugestao` | int | ✅ | — |

### `modulo_sistema`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idmodulosistema` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(50) | ✅ | — |
| `idtipoatendimento` | int | ✅ | — |
| `sla` | int | ✅ | — |
| `ativo` | bool | ✅ | — |

### `horas_uteis`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_horas_uteis` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(200) | ✅ | — |
| `seg_entrada1` | time | ✅ | — |
| `seg_saida1` | time | ✅ | — |
| `seg_entrada2` | time | ✅ | — |
| `seg_saida2` | time | ✅ | — |
| `ter_entrada1` | time | ✅ | — |
| `ter_saida1` | time | ✅ | — |
| `ter_entrada2` | time | ✅ | — |
| `ter_saida2` | time | ✅ | — |
| `qua_entrada1` | time | ✅ | — |
| `qua_saida1` | time | ✅ | — |
| `qua_entrada2` | time | ✅ | — |
| `qua_saida2` | time | ✅ | — |
| `qui_entrada1` | time | ✅ | — |
| `qui_saida1` | time | ✅ | — |
| `qui_entrada2` | time | ✅ | — |
| `qui_saida2` | time | ✅ | — |
| `sex_entrada1` | time | ✅ | — |
| `sex_saida1` | time | ✅ | — |
| `sex_entrada2` | time | ✅ | — |
| `sex_saida2` | time | ✅ | — |
| `sab_entrada1` | time | ✅ | — |
| `sab_saida1` | time | ✅ | — |
| `sab_entrada2` | time | ✅ | — |
| `sab_saida2` | time | ✅ | — |
| `dom_entrada1` | time | ✅ | — |
| `dom_saida1` | time | ✅ | — |
| `dom_entrada2` | time | ✅ | — |
| `dom_saida2` | time | ✅ | — |

## Sistema

### `versao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_versao` 🔑 | int | ❌ | autoincrement |
| `descricao` | varchar(50) | ✅ | — |
| `status` | bool | ✅ | — |

### `log`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idlog` 🔑 | int | ❌ | autoincrement |
| `idfuncionariousuario` | int | ✅ | — |
| `mensagem` | varchar(500) | ✅ | — |
| `data` | date | ✅ | — |
| `hora` | time | ✅ | — |

### `comite_atenthos`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `idcomiteatenthos` 🔑 | int | ❌ | autoincrement |
| `idusuario` | int | ✅ | — |
| `idos` | int | ✅ | — |
| `nota` | int | ✅ | — |
| `status` | bool | ✅ | — |

### `jira_integracao`

| Coluna | Tipo | Nulo | Padrão |
|--------|------|------|--------|
| `id_jira_integracao` 🔑 | int | ❌ | autoincrement |
| `projeto_key` | varchar(64) | ❌ | — |
| `jira_server` | varchar(255) | ❌ | — |
| `jira_email` | varchar(255) | ❌ | — |
| `jira_api_token` | text | ❌ | — |
| `jira_webhook_secret` | text | ✅ | — |
| `ativo` | bool | ❌ | true |
| `jira_issue_type_id` | varchar(50) | ✅ | — |
| `jira_issue_type_name` | varchar(100) | ✅ | — |
| `jira_ocorrencia_field_id` | varchar(60) | ✅ | — |
| `jira_ocorrencia_field_name` | varchar(150) | ✅ | — |
| `jira_acompanhamento_fields_json` | text | ✅ | — |

