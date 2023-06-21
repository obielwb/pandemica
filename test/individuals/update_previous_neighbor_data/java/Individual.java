package test.individuals.update_previous_neighbor_data.java;

public class Individual {
  private int data;
  private String riskProfile;
  private String interaction;
  private int personCount;
  private String symptomsChecked;
  private String setting;
  private String distance;
  private int duration;
  private String theirMask;
  private String yourMask;
  private String voice;

  public int getData() {
    return data;
  }

  public void setData(int data) {
    this.data = data;
  }

  public String getRiskProfile() {
    return riskProfile;
  }

  public void setRiskProfile(String riskProfile) {
    this.riskProfile = riskProfile;
  }

  public String getInteraction() {
    return interaction;
  }

  public void setInteraction(String interaction) {
    this.interaction = interaction;
  }

  public int getPersonCount() {
    return personCount;
  }

  public void setPersonCount(int personCount) {
    this.personCount = personCount;
  }

  public String getSymptomsChecked() {
    return symptomsChecked;
  }

  public void setSymptomsChecked(String symptomsChecked) {
    this.symptomsChecked = symptomsChecked;
  }

  public String getSetting() {
    return setting;
  }

  public void setSetting(String setting) {
    this.setting = setting;
  }

  public String getDistance() {
    return distance;
  }

  public void setDistance(String distance) {
    this.distance = distance;
  }

  public int getDuration() {
    return duration;
  }

  public void setDuration(int duration) {
    this.duration = duration;
  }

  public String getTheirMask() {
    return theirMask;
  }

  public void setTheirMask(String theirMask) {
    this.theirMask = theirMask;
  }

  public String getYourMask() {
    return yourMask;
  }

  public void setYourMask(String yourMask) {
    this.yourMask = yourMask;
  }

  public String getVoice() {
    return voice;
  }

  public void setVoice(String voice) {
    this.voice = voice;
  }

  public Individual() {
    setData(0);
    setRiskProfile("riskprofile");
    setRiskProfile("riskprofile");
    setInteraction("interaction");
    setPersonCount(0);
    setSymptomsChecked("no");
    setSetting("setting");
    setDistance("distance");
    setDistance("distance");
    setDuration(0);
    setTheirMask("theirmask");
    setYourMask("yourmask");
    setYourMask("yourmask");
  }

  void update(int data, String riskProfile, String interaction, int personCount, String symptomsChecked, String setting,
      String distance, String theirMask,
      String yourMask,
      String voice) {
    setData(getData() + data);
    setRiskProfile(riskProfile);
    setInteraction(interaction);
    setPersonCount(personCount);
    setSymptomsChecked(symptomsChecked);
    setSetting(setting);
    setDistance(distance);
    setDuration(0);
    setTheirMask(theirMask);
    setYourMask(yourMask);
    setVoice(voice);
  }

  public void computeNeighbor(int neighborData) {
    if (neighborData == 0) {
      this.data = 1;
    } else {
      this.data = 0;
    }
  }
}
