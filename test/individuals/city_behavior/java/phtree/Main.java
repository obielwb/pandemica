package test.individuals.city_behavior.java.phtree;

public import rx.Observable;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Main {
    public static void main( String[] args )
    {
        PHTree phTreeExample = new PHTree();

        Individual individual1 = new Individual((long) 10.0, (long)20.0);
        Individual individual2 = new Individual((long)15.0, (long)25.0);
        Individual individual3 = new Individual((long)2.0, (long)12.0);
        List<Individual> individuals = generateRandomIndividuals(1223237, 0, 100, 0, 100);
        for (Individual individual : individuals) {

            phTreeExample.addIndividual(individual);
        }

        phTreeExample.printTreeStats();
        phTreeExample.addIndividual(individual1);
        phTreeExample.addIndividual(individual2);
        phTreeExample.addIndividual(individual3);

        long targetX = (long) 0.0;
        long targetY = (long) 0.0;
        long searchRadius = (long) 100.0;
        long startLinear = System.currentTimeMillis();

        List<Individual> individualsAroundTarget = phTreeExample.findIndividualsAround(targetX, targetY, searchRadius);
        long endLinear = System.currentTimeMillis();
        System.out.println("%f".formatted((endLinear - startLinear) / 1000.0));
        System.out.println(phTreeExample.getDim());
        System.out.println("Individuals around target location:");
        for (Individual individual : individualsAroundTarget) {
            System.out.println("X: " + individual.getX() + ", Y: " + individual.getY());
        }

        phTreeExample.printTreeStats();
    }

    public static List<Individual> generateRandomIndividuals(int numIndividuals, long minX, long maxX, long minY, long maxY) {
        List<Individual> individuals = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < numIndividuals; i++) {
            long x = minX + (maxX - minX) * random.nextLong();
            long y = minY + (maxY - minY) * random.nextLong();
            Individual individual = new Individual((long)x, (long)y);
            individuals.add(individual);
        }

        return individuals;
    }
}
 {

}
