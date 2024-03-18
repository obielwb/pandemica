# Pandemica
This repository contains every piece of code related to our final thesis at the Technical High School of Campinas - Unicamp, entitled _Virtual Simulation of the COVID-19 Pandemic in Campinas Using Cellular Automata: Multi-agent Systems in Spatio-Temporal Environments_.

The goal of Pandemica is:
```
Create an effective pandemic simulation model that is capable of minimizing the impact of possible
future pandemics by creating different scenarios that act as awareness raisers for competent entities
and for the population to act preventively in the midst of a potential pandemic.
```

To achieve the objective, the project was divided into three large parts: the simulation of individuals, the city and the spread of the virus. Below is a diagram simplifying the execution of the program, for more information on technical and methodological details see the [White Paper](https://pandemica.com.br/paper.pdf). <br/> <br/>
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

The project was developed with _TypeScript_ to create simulation logic and _Python_ for data analysis. To decide the main language, several performance tests were carried out using the following languages: <br/> <br/>
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Julia](https://img.shields.io/badge/-Julia-9558B2?style=for-the-badge&logo=julia&logoColor=white)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)
![Scala](https://img.shields.io/badge/scala-%23DC322F.svg?style=for-the-badge&logo=scala&logoColor=white)
![Fortran](https://img.shields.io/badge/Fortran-%23734F96.svg?style=for-the-badge&logo=fortran&logoColor=white)
![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white)
