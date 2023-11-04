// typescript/unoptimized/main.ts
var Individual = class {
  data;
  riskProfile;
  interaction;
  personCount;
  symptomsChecked;
  setting;
  distance;
  duration;
  theirMask;
  yourMask;
  voice;
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
  update(data, riskProfile, interaction, personCount, symptomsChecked, setting, distance, duration, theirMask, yourMask, voice) {
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
  computeNeighbor(neighborData) {
    if (neighborData === 0) {
      this.data = 1;
    } else {
      this.data = 0;
    }
  }
};
var instances = Array.from(
  { length: 1223237 },
  () => new Individual()
);
var size = instances.reduce(
  (acc, instance) => acc + JSON.stringify(instance).length,
  0
);
var start = Date.now();
for (let i = 0; i < instances.length; i++) {
  const prevInstance = i > 0 ? instances[i - 1] : null;
  const currentInstance = instances[i];
  const nextInstance = i < instances.length - 1 ? instances[i + 1] : null;
  if (prevInstance) {
    currentInstance.computeNeighbor(prevInstance.data);
  }
}
var end = Date.now();
console.log(`${size},${(end - start) / 1e3}`);
