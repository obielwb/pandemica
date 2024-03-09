import { readPandemicData } from '../data/covid19'
import { run } from './runner'

function parseArgs() {
  const args = process.argv.slice(2)
  const params = {
    startDate: new Date('2020-01-01'),
    endDate: new Date('2022-01-01')
  }

  args.forEach((arg) => {
    const [key, value] = arg.split('=')
    switch (key) {
      case '--startDate':
        params.startDate = new Date(value)
        break
      case '--endDate':
        params.endDate = new Date(value)
        break
    }
  })

  return params
}

function main() {
  const { startDate, endDate } = parseArgs()

  const pandemicRegisters = readPandemicData([2020, 2021])

  // this only accounts for the validation scneario, where we get the 20% according to Hold-Out Validation
  const initalScenario = pandemicRegisters.slice(0, Math.ceil(pandemicRegisters.length * 0.2))

  run(startDate, endDate, initalScenario)
}

main()
