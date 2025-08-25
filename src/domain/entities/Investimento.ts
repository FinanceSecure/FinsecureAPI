import { TipoInvestimento } from "./TipoInvestimento";
import { AplicacaoInvestimento } from "./AplicacaoInvestimento";

export class Investimento {
  public aplicacoes: AplicacaoInvestimento[] = [];
  public tipoInvestimento!: TipoInvestimento;

  constructor(
    public id: string,
    public usuarioId: string,
    public tipoInvestimentoId: string,
    public dataCompra: Date,
    public dataAtualizacao?: Date,
    public resgatado: boolean = false,
    public rendimentoAcumulado: number = 0,
    tipoInvestimento?: TipoInvestimento,
    aplicacoes?: AplicacaoInvestimento[]
  ) {
    if (tipoInvestimento) this.tipoInvestimento = tipoInvestimento;
    if (aplicacoes) this.aplicacoes = aplicacoes;
  }

  atualizarRendimento(valor: number) {
    this.rendimentoAcumulado = valor;
    this.dataAtualizacao = new Date();
  }

  marcadoComoResgatado() {
    this.resgatado = true;
    this.dataAtualizacao = new Date();
  }
}
