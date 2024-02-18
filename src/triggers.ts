import { ages, fiveToNineYears, sixtyToSixtyfourYears, zeroToFourYears } from '../data/census'
import {
  collegeStudyFromHome,
  highSchoolStudyFromHome,
  middleSchoolStudyFromHome,
  preschoolStudyFromHome
} from './activities'
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

  for (const individual of targetPopulation) {
    if (individual.occupationType?.includes('study')) {
      for (let i = 0; i < individual.routine.length; i++) {
        for (let j = 0; j < individual.routine[i].length; j++) {
          if (individual.routine[i][j].category === 'study') {
            switch (individual.routine[i][j].label) {
              case 'study.preschool':
                individual.routine[i][j] = preschoolStudyFromHome
                break
              case 'study.middle_school':
                individual.routine[i][j] = middleSchoolStudyFromHome
                break
              case 'study.high_school':
                individual.routine[i][j] = highSchoolStudyFromHome
                break
              case 'study.college':
                individual.routine[i][j] = collegeStudyFromHome
                break
            }
          }
        }
      }
    }

    if (individual.occupationType?.includes('work')) {
    }
  }
}

export function takeVaccines(
  totalPopulation: Individual[],
  percentage: number = 1,
  type: Vaccine,
  age: number[]
) {}

export function implementMask(type: Mask) {}
