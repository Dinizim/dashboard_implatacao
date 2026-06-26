export type Semana = {
  numero: number;
  label: string;
  dataContato: string;
  observacao: string;
};

export type Cliente = {
  codigo: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;

  dataCad: string;
  dataApro: string;
  dataAss: string;
  data1Mensalidade: string;
  kickoff: string;
  dataInst: string;
  treinamentoCadastro: string;
  treinamentoVendas: string;
  supDef: string;

  diasImplantacao: number;
  dentroDoProazo: "DENTRO" | "FORA";
  etapaAtual: string;

  semanas: Semana[];
};