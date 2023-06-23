#include <iostream>
#include <vector>
#include <chrono>

using namespace std;
using namespace chrono;

class Individual
{
public:
  int data;
  string risk_profile;
  string interaction;
  int person_count;
  string symptoms_checked;
  string setting;
  string distance;
  int duration;
  string their_mask;
  string your_mask;
  string voice;

  void update(int dataclass, string riskprofile, string interaction, int personcount,
              string symptomschecked, string setting, string distance, int duration,
              string theirmask, string yourmask, string voice)
  {
    data = dataclass;
    risk_profile = riskprofile;
    interaction = interaction;
    person_count = personcount;
    symptoms_checked = symptomschecked;
    setting = setting;
    distance = distance;
    duration = duration;
    their_mask = theirmask;
    your_mask = yourmask;
    voice = voice;
  }

  void compute_neighbor(int neighbor_data)
  {
    if (neighbor_data == 0)
    {
      data = 1;
    }
    else
    {
      data = 0;
    }
  }
};

int main()
{
  vector<Individual> instances(1223237);
  size_t size = sizeof(instances[0]) * instances.size(); // average: 342506360 bytes - 342 mb

  time_point start = high_resolution_clock::now();

  // process each window of three instances
  for (size_t i = 1; i < instances.size() - 1; i++)
  {
    Individual &prev_instance = instances[i - 1];
    Individual &current_instance = instances[i];
    Individual &next_instance = instances[i + 1];
    current_instance.compute_neighbor(prev_instance.data);
  }

  time_point end = high_resolution_clock::now();
  seconds duration = duration_cast<seconds>(end - start);

  cout << size << "," << duration.count() << endl;

  return 0;
}
