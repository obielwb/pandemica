using Distributed

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
  individual.data = neighbor_data == 0 ? 1 : 0
end

function process_window!(window)
  prev_instance, current_instance, next_instance = window[1], window[2], window[3]
  compute_neighbor!(current_instance, prev_instance === nothing ? 0 : prev_instance.data)
end

instances = [Individual() for _ in 1:1223237]

# Determine the number of threads to use for parallel execution
threads = Threads.nthreads()

# Split the instances into chunks for parallel processing
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

# cCollect and concatenate the processed chunks
instances = vcat(chunks...)

stop = time()
println(stop - start) # average: 0.06 seconds

size = sizeof(instances)

println(size) # average: 9785896 bytes - 9.7 mb
