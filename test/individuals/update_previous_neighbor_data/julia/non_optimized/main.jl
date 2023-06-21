mutable struct Individual
  data::Int64
  riskProfile::String
  interaction::String
  personCount::Int64
  symptomsChecked::String
  setting::String
  distance::String
  duration::Int64
  theirMask::String
  yourMask::String
  voice::String
end

function Individual()
  return Individual(0, "riskprofile", "interaction", 0, "no", "setting", "distance", 0, "theirmask", "yourmask", "voice")
end

function update!(individual::Individual, a, b, c, d, e, f, g, h, i, j)
  individual.data += a
  individual.riskProfile = b
  individual.interaction = c
  individual.personCount = d
  individual.symptomsChecked = e
  individual.setting = f
  individual.distance = g
  individual.duration = 0
  individual.theirMask = h
  individual.yourMask = i
  individual.voice = j
end

function compute_neighbor!(individual::Individual, neighbor_data)
  if neighbor_data == 0
      individual.data = 1
  else
      individual.data = 0
  end
end

instances = [Individual() for _ in 1:1223237]
size = sizeof(instances)

# create a sliding window of size 3 over the instances
windows = [instances[i:i+2] for i in 1:length(instances)-2]

start = time()
# process each window of three instances
for window in windows
  prev_instance, current_instance, next_instance = window[1], window[2], window[3]
  compute_neighbor!(current_instance, prev_instance === nothing ? 0 : prev_instance.data)
end

stop = time()
println(stop - start) # average: 0.23 seconds

println(size) # average: 9785896 bytes - 9.7 mb
