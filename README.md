# Pandemica
This repository contains every piece of code related to our final thesis at the Colégio Técnico de Campinas - Unicamp, entitled _Pandemica: Agent-Based Pandemic Simulation for Optimal Public Health Crisis Management Using Adaptive Demographic Modeling with AI_.

The goal of Pandemica is:
```
Create an effective pandemic simulation model that is capable of minimizing the impact of possible
future pandemics by creating different scenarios that act as awareness raisers for competent entities
and for the population to act preventively in the midst of a potential pandemic.
```

To achieve the objective, the project was divided into three large parts: the simulation of individuals, the city and the spread of the virus. Below is a diagram simplifying the execution of the program, for more information on technical and methodological details see the [White Paper](https://pandemica.com.br/paper). <br/> <br/>
![Diagram](https://github.com/obielwb/pandemica/assets/69120228/f5290b41-871e-4dc1-965c-b1f8bbc1945f)

### Run
```bash
git clone https://github.com/obielwb/pandemica

cd pandemica

git submodule update --init --recursive

cd model

pnpm i

pnpm build

pnpm start
```

----
