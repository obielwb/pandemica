package test.individuals.update_previous_neighbor_data.java.non_optimized;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Main {
  public static void main(String[] args) {
    int instanceCount = 1223237;
    List<Individual> instances = new ArrayList<>();

    for (int i = 0; i < instanceCount; i++) {
      instances.add(new Individual());
    }

    int size = instances.size() * 4; // assuming 32-bit integers, each occupying 4 bytes

    long start = System.currentTimeMillis();

    Iterator<Individual> iterator = instances.iterator();
    Individual prevInstance = null;
    Individual currentInstance = iterator.next();
    Individual nextInstance = iterator.next();

    while (iterator.hasNext()) {
      processWindow(prevInstance, currentInstance, nextInstance);

      prevInstance = currentInstance;
      currentInstance = nextInstance;
      nextInstance = iterator.next();
    }

    long end = System.currentTimeMillis();
    System.out.println((end - start) / 1000.0); // avarage: 0.007 seconds
    System.out.println(size); // avarge: 4892948 bytes - 4.8 mb
  }

  static void processWindow(Individual prevInstance, Individual currentInstance, Individual nextInstance) {
    currentInstance.computeNeighbor(prevInstance != null ? prevInstance.getData() : 0);
  }
}
