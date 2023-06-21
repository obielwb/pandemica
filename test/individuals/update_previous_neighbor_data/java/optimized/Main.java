package test.individuals.update_previous_neighbor_data.java.optimized;

import java.util.ArrayList;
import java.util.List;

import test.individuals.update_previous_neighbor_data.java.Individual;

public class Main {
  public static void main(String[] args) {
    int instanceCount = 1223237;
    List<Individual> instances = new ArrayList<>();

    for (int i = 0; i < instanceCount; i++) {
      instances.add(new Individual());
    }

    int size = instances.size() * 4; // assuming 32-bit integers, each occupying 4 bytes

    long start = System.currentTimeMillis();

    Individual prevInstance = null;
    Individual currentInstance = instances.get(0);
    Individual nextInstance = instances.get(1);

    for (int i = 1; i < instanceCount - 1; i++) {
      processWindow(prevInstance, currentInstance, nextInstance);

      prevInstance = currentInstance;
      currentInstance = nextInstance;
      nextInstance = instances.get(i + 1);
    }

    long end = System.currentTimeMillis();
    System.out.println((end - start) / 1000.0); // average: 0.01 seconds
    System.out.println(size); // average: 4892948 bytes - 4.8 mb
  }

  static void processWindow(Individual prevInstance, Individual currentInstance, Individual nextInstance) {
    currentInstance.computeNeighbor(prevInstance != null ? prevInstance.getData() : 0);
  }
}
