import sys
import itertools
import time 

class Individual:
  def __init__(self):
    self.data = 0  
    self.riskProfile = "riskprofile"
    self.interaction = "interaction"
    self.personCount = 0
    self.symptomsChecked = "no"

    self.setting = "setting"
    self.distance = "distance"
    self.duration = 0
    self.theirMask = "theirmask"
    self.yourMask = "yourmask"
    self.voice = "voice"

  def update(self, a, b, c, d, e, f, g, h, i, j):
    self.data += a
    self.riskProfile = b
    self.interaction = c
    self.personCount = d
    self.symptomsChecked = e

    self.setting = f
    self.distance = g
    self.duration = 0
    self.theirMask = h
    self.yourMask = i
    self.voice = j

  def neighbor(self, neighbor_data):
    if neighbor_data == 0: 
      self.data = 1
    else: 
      self.data = 0
  

instances = [Individual() for _ in range(1223237)]
size = sys.getsizeof(instances) # average: 10692984

# Create a sliding window of size 3 over the instances
windows = itertools.islice(zip([None] + instances, instances, instances[1:] + [None]), 1, None)

start = time.time()
# Process each window of three instances
for prev_instance, current_instance, next_instance in windows:
    current_instance.neighbor(prev_instance.data if prev_instance else 0)
    
end = time.time()
print(end - start) # average: 0.22687172889709473

print(size)