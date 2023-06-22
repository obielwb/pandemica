using Distributed

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
  individual.data = neighbor_data == 0 ? 1 : 0
end

function process_window!(window)
  prev_instance, current_instance, next_instance = window[1], window[2], window[3]
  compute_neighbor!(current_instance, prev_instance === nothing ? 0 : prev_instance.data)
end

instances = [Individual() for _ in 1:1223237]

# determine the number of threads to use for parallel execution
threads = Threads.nthreads()

# split the instances into chunks for parallel processing
chunk_size = div(length(instances), threads)
chunks = [instances[(i-1)*chunk_size+1:i*chunk_size] for i in 1:threads]
if length(instances) % threads != 0
  push!(chunks, instances[end-(length(instances) % threads - 1):end])
end

start = time()

@distributed for chunk in chunks
  windows = [chunk[i:i+2] for i in 1:length(chunk)-2]
  for window in windows
      process_window!(window)
  end
end

# collect and concatenate the processed chunks
instances = vcat(chunks...)

stop = time()
println(stop - start) # average: 0.06 seconds

size = sizeof(instances)

println(size) # average: 9785896 bytes - 9.7 mb
