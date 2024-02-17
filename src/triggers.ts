import { Individual, Mask, Vaccine } from './individual'

/*
- Escolas ficam online
- De acordo com o artigo da Secretaria do Estado de São Paulo (https://www.saopaulo.sp.gov.br/spnoticias/veja-quais-servicos-podem-funcionar-em-sp-durante-a-quarentena/)
  Só permancem em aberto durante a pandemia serviços de:
    Saúde, Alimentação (Supermercados, açougues e padarias apenas), Construção Civíl e Indústria

-> Não temos a quantidade de lojas, mercados, hospitais e farmácias exatos
     apenas industrias e comércio

Definir uma porcentagem das industrias que permaneceram funcionando
Não há embasamento para essa porcentagem, definir arbitrariamente

*/

function selectRandomPercentage<T>(arr: T[], percentage: number) {
  const quantity = Math.round(percentage * arr.length)
  const shuffled = arr.slice().sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, quantity)

  return selected
}

export function implementLockdown(totalPopulation: Individual[], percentage: number = 1) {
  const targetPopulation = selectRandomPercentage(totalPopulation, percentage)
}

export function takeVaccines(
  totalPopulation: Individual[],
  percentage: number = 1,
  type: Vaccine,
  age: number[]
) {}

export function implementMask(type: Mask) {}
