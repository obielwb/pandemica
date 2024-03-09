import { readPandemicData } from '../data/covid19'
import { run } from './runner'
import { calculateModelAccuracy } from './validation'

function parseArgs() {
  const args = process.argv.slice(2)
  const params = {
    step: 30,
    ignoreStep: false,
    startDate: new Date('2020-01-01'),
    endDate: new Date('2023-01-01'),
    showAccuracy: false
  }

  args.forEach((arg) => {
    const [key, value] = arg.split('=')
    switch (key) {
      case '--step':
        params.step = parseInt(value, 10)
        break
      case '--ignoreStep':
        params.ignoreStep = value === 'true'
        break
      case '--startDate':
        params.startDate = new Date(value)
        break
      case '--endDate':
        params.endDate = new Date(value)
        break
      case '--showAccuracy':
        params.showAccuracy = value === 'true'
    }
  })

  return params
}

/**
 * Todo
 * definir pandemic register
 * definir método que lê os primeiros 20% dos casos reais da pandemia e passar para o runner
 * criar o método que vai validar e retornar a acurácia do modelo
 */

function main() {
  const { step, ignoreStep, startDate, endDate, showAccuracy } = parseArgs()

  const pandemicRegisters = readPandemicData()

  // this only accounts for the validation scneario, where we get the 20% according to Hold-Out Validation
  const initalScenario = pandemicRegisters.slice(0, pandemicRegisters.length * 0.2)

  const simulatedPandmicRegisters = run(step, ignoreStep, startDate, endDate, initalScenario)

  if (showAccuracy) calculateModelAccuracy(pandemicRegisters, simulatedPandmicRegisters)
}

main()
