use std::time::{Instant};

#[derive(Clone)]
struct Individual {
    data: i32,
    risk_profile: String,
    interaction: String,
    person_count: i32,
    symptoms_checked: String,
    setting: String,
    distance: String,
    duration: i32,
    their_mask: String,
    your_mask: String,
    voice: String,
}

impl Individual {
    fn update(&mut self, data: i32, risk_profile: String, interaction: String, person_count: i32,
              symptoms_checked: String, setting: String, distance: String, duration: i32,
              their_mask: String, your_mask: String, voice: String) {
        self.data = data;
        self.risk_profile = risk_profile;
        self.interaction = interaction;
        self.person_count = person_count;
        self.symptoms_checked = symptoms_checked;
        self.setting = setting;
        self.distance = distance;
        self.duration = duration;
        self.their_mask = their_mask;
        self.your_mask = your_mask;
        self.voice = voice;
    }

    fn compute_neighbor(&mut self, neighbor_data: i32) {
        if neighbor_data == 0 {
            self.data = 1;
        } else {
            self.data = 0;
        }
    }
}

fn main() {
    let mut instances: Vec<Individual> = vec![Individual {
        data: 0,
        risk_profile: String::new(),
        interaction: String::new(),
        person_count: 0,
        symptoms_checked: String::new(),
        setting: String::new(),
        distance: String::new(),
        duration: 0,
        their_mask: String::new(),
        your_mask: String::new(),
        voice: String::new(),
    }; 1223237];

    let size = std::mem::size_of_val(&instances[0]) * instances.len(); // average: 254433296 bytes - 254 mb

    let start = Instant::now();

    // process each window of three instances
    for i in 1..instances.len() - 1 {
        let (prev_slice, rest) = instances.split_at_mut(i);
        let (current_slice, next_slice) = rest.split_at_mut(2);
        let prev_instance = &mut prev_slice[i - 1];
        let current_instance = &mut current_slice[0];
        current_instance.compute_neighbor(prev_instance.data);
    }

    let end = Instant::now();
    let duration = end - start;

    println!("{} seconds", duration.as_secs_f64()); // average: 0.023 seconds

    println!("{}", size);
}
