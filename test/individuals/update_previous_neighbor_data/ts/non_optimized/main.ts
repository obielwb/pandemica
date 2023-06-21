class Individual {
  data: number;
  riskProfile: string;
  interaction: string;
  personCount: number;
  symptomsChecked: string;
  setting: string;
  distance: string;
  duration: number;
  theirMask: string;
  yourMask: string;
  voice: string;

  constructor() {
    this.data = 0;
    this.riskProfile = "risk_profile";
    this.interaction = "interaction";
    this.personCount = 0;
    this.symptomsChecked = "no";
    this.setting = "setting";
    this.distance = "distance";
    this.duration = 0;
    this.theirMask = "their_mask";
    this.yourMask = "your_mask";
    this.voice = "voice";
  }

  update(
    data: number,
    riskProfile: string,
    interaction: string,
    personCount: number,
    symptomsChecked: string,
    setting: string,
    distance: string,
    duration: number,
    theirMask: string,
    yourMask: string,
    voice: string
  ): void {
    this.data = data;
    this.riskProfile = riskProfile;
    this.interaction = interaction;
    this.personCount = personCount;
    this.symptomsChecked = symptomsChecked;
    this.setting = setting;
    this.distance = distance;
    this.duration = duration;
    this.theirMask = theirMask;
    this.yourMask = yourMask;
    this.voice = voice;
  }

  computeNeighbor(neighborData: number): void {
    if (neighborData === 0) {
      this.data = 1;
    } else {
      this.data = 0;
    }
  }
}

const instances: Individual[] = Array.from(
  { length: 1223237 },
  () => new Individual()
);
const size = instances.reduce(
  (acc, instance) => acc + JSON.stringify(instance).length,
  0
); // 280121273 bytes - 280 mb

const start = Date.now();

for (let i = 0; i < instances.length; i++) {
  const prevInstance = i > 0 ? instances[i - 1] : null;
  const currentInstance = instances[i];
  const nextInstance = i < instances.length - 1 ? instances[i + 1] : null;

  if (prevInstance) {
    currentInstance.computeNeighbor(prevInstance.data);
  }
}

const end = Date.now();
console.log((end - start) / 1000); // average: 0.22 seconds
console.log(size);
