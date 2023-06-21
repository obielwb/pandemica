class Individual {
  data: number;
  risk_profile: string;
  interaction: string;
  person_count: number;
  symptoms_checked: string;
  setting: string;
  distance: string;
  duration: number;
  their_mask: string;
  your_mask: string;
  voice: string;

  constructor() {
    this.data = 0;
    this.risk_profile = "riskprofile";
    this.interaction = "interaction";
    this.person_count = 0;
    this.symptoms_checked = "no";
    this.setting = "setting";
    this.distance = "distance";
    this.duration = 0;
    this.their_mask = "their_mask";
    this.your_mask = "your_mask";
    this.voice = "voice";
  }

  update(
    data: number,
    risk_profile: string,
    interaction: string,
    person_count: number,
    symptoms_checked: string,
    setting: string,
    distance: string,
    duration: number,
    their_mask: string,
    your_mask: string,
    voice: string
  ) {
    this.data = data;
    this.risk_profile = risk_profile;
    this.interaction = interaction;
    this.person_count = person_count;
    this.symptoms_checked = symptoms_checked;
    this.setting = setting;
    this.distance = distance;
    this.duration = duration;
    this.their_mask = their_mask;
    this.your_mask = your_mask;
    this.voice = voice;
  }

  computeNeighbor(neighborData: number): void {
    this.data = neighborData === 0 ? 1 : 0;
  }
}

async function processInstances(instances: Individual[]) {
  const promises = instances.map(async (currentInstance, i) => {
    const prevInstance = i > 0 ? instances[i - 1] : null;

    if (prevInstance) {
      currentInstance.computeNeighbor(prevInstance.data);
    }
  });

  await Promise.all(promises);
}

const instances = Array.from({ length: 1223237 }, () => new Individual());
const size = instances.reduce(
  (acc, instance) => acc + JSON.stringify(instance).length,
  0
); // 280121273 bytes - 280 bytes

const start = Date.now();

processInstances(instances).then(() => {
  const end = Date.now();
  console.log((end - start) / 1000); // average: 0.34 seconds
  console.log(size);
});
