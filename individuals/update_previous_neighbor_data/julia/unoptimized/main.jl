using Printf

mutable struct Individual
  data::Int64
  risk_profile::String
  interaction::String
  person_count::Int64
  symptoms_checked::String
  setting::String
  distance::String
  duration::Int64
  their_mask::String
  your_mask::String
  voice::String
end

function Individual()
  return Individual(0, "riskprofile", "interaction", 0, "no", "setting", "distance", 0, "their_mask", "your_mask", "voice")
end

function update!(individual::Individual, data, risk_profile, interaction, person_count, symptoms_checked, setting, distance, their_mask, your_mask, voice)
  individual.data += data
  individual.risk_profile = risk_profile
  individual.interaction = interaction
  individual.person_count = person_count
  individual.symptoms_checked = symptoms_checked
  individual.setting = setting
  individual.distance = distance
  individual.duration = 0
  individual.their_mask = their_mask
  individual.your_mask = your_mask
  individual.voice = voice
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
@printf("%d,%f", size, stop - start)
