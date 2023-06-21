import sys
import itertools
import time


class Individual:
    def __init__(self):
        self.data = 0
        self.risk_profile = "riskprofile"
        self.interaction = "interaction"
        self.person_count = 0
        self.symptoms_checked = "no"

        self.setting = "setting"
        self.distance = "distance"
        self.duration = 0
        self.their_mask = "their_mask"
        self.your_mask = "your_mask"
        self.voice = "voice"

    def update(self, data, risk_profile, interaction, person_count,
               symptoms_checked, setting, distance, duration, their_mask, your_mask, voice):
        self.data = data
        self.risk_profile = risk_profile
        self.interaction = interaction
        self.person_count = person_count
        self.symptoms_checked = symptoms_checked

        self.setting = setting
        self.distance = distance
        self.duration = duration
        self.their_mask = their_mask
        self.your_mask = your_mask
        self.voice = voice

    def compute_neighbor(self, neighbor_data):
        if neighbor_data == 0:
            self.data = 1
        else:
            self.data = 0


instances = [Individual() for _ in range(1223237)]
size = sys.getsizeof(instances)  # average: 10692984 bytes - 10 mb

# create a sliding window of size 3 over the instances
windows = itertools.islice(
    zip([None] + instances, instances, instances[1:] + [None]), 1, None)

start = time.time()
# process each window of three instances
for prev_instance, current_instance, next_instance in windows:
    current_instance.compute_neighbor(
        prev_instance.data if prev_instance else 0)

end = time.time()
print(end - start)  # average: 0.22 seconds

print(size)
