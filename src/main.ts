import { run } from "./runner";

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    step: 30,
    ignoreStep: false,
    startDate: new Date('2020-01-01'),
    endDate: new Date('2023-01-01')
  };

  args.forEach((arg) => {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--step':
        params.step = parseInt(value, 10);
        break;
      case '--ignoreStep':
        params.ignoreStep = value === 'true';
        break;
      case '--startDate':
        params.startDate = new Date(value);
        break;
      case '--endDate':
        params.endDate = new Date(value);
        break;
    }
  });

  return params;
}

function main() {
  const { step, ignoreStep, startDate, endDate } = parseArgs();
  run(step, ignoreStep, startDate, endDate);
}

main();
