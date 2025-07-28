import { getIrRate } from "./IrService";
import { differenceInBusinessDays } from 'date-fns';

export interface Rendimento {
  diasUteis: number;
  rendimentoBruto: number;
  valorTotalBruto: number;
  imposto: number;
  rendimentoLiquido: number;
  valorTotalLiquido: number;
}

export function calcularRendimento(
  valorInvestido: number,
  percentualDiario: number,
  dataCompra: Date,
  aplicaImposto: boolean
): Rendimento {
  const hoje = new Date();
  const diasUteis = differenceInBusinessDays(hoje, dataCompra);
  const bruto = valorInvestido * (Math.pow(1 + percentualDiario, diasUteis) - 1);
  let imposto = 0;
  if (aplicaImposto) {
    const aliquota = getIrRate(diasUteis);
    imposto = bruto * aliquota;
  }
  const liquido = bruto - imposto;

  return {
    diasUteis,
    rendimentoBruto: Number(bruto.toFixed(2)),
    valorTotalBruto: Number((valorInvestido + bruto).toFixed(2)),
    imposto: Number(imposto.toFixed(2)),
    rendimentoLiquido: Number(liquido.toFixed(2)),
    valorTotalLiquido: Number((valorInvestido + liquido).toFixed(2))
  };
}
