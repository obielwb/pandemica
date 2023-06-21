// optimized/main.ts
var Individual = class {
  data;
  risk_profile;
  interaction;
  person_count;
  symptoms_checked;
  setting;
  distance;
  duration;
  their_mask;
  your_mask;
  voice;
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
  update(data, risk_profile, interaction, person_count, symptoms_checked, setting, distance, duration, their_mask, your_mask, voice) {
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
  computeNeighbor(neighborData) {
    this.data = neighborData === 0 ? 1 : 0;
  }
};
async function processInstances(instances2) {
  const promises = instances2.map(async (currentInstance, i) => {
    const prevInstance = i > 0 ? instances2[i - 1] : null;
    if (prevInstance) {
      currentInstance.computeNeighbor(prevInstance.data);
    }
  });
  await Promise.all(promises);
}
var instances = Array.from({ length: 1223237 }, () => new Individual());
var size = instances.reduce(
  (acc, instance) => acc + JSON.stringify(instance).length,
  0
);
var start = Date.now();
processInstances(instances).then(() => {
  const end = Date.now();
  console.log((end - start) / 1e3);
  console.log(size);
});
