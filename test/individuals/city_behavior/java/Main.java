import rx.Observable;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Main {
    public static void main( String[] args )
    {
        RTreeExample rTreeExample = new RTreeExample();

        // Add your million individuals to the R-tree
        // Example with three individuals:
        List<Individual> individuals = generateRandomIndividuals(1223237, 0, 100, 0, 100);

        for (Individual individual :
             individuals ) {
            rTreeExample.addIndividual(individual);
        }
        // Find individuals around a specific location
        double targetX = 20.0;
        double targetY = 20.0;
        double searchRadius = 0.202;
        System.out.println("Linear search");
        long startLinear = System.currentTimeMillis();
        List<Individual> linearSearchResult = new ArrayList<>();
        for (Individual individual : individuals) {
            if (individual.getX() > (targetX - searchRadius) && individual.getX() < (targetX + searchRadius)) {
                if (individual.getY() > (targetY - searchRadius) && individual.getY() < (targetY + searchRadius)) {
                    linearSearchResult.add(individual);
                }
            }
        }
        long endLinear = System.currentTimeMillis();
        System.out.println("%f".formatted((endLinear - startLinear) / 1000.0));

        System.out.println("Rtree implementation:");
        long start = System.currentTimeMillis();
        List<Individual> individualsAroundTarget = rTreeExample.findIndividualsAround(targetX, targetY, searchRadius);
        //System.out.println(individualsAroundTarget.toList());
        // Print the individuals found around the target location
        long end = System.currentTimeMillis();
        System.out.println("%f".formatted((end - start) / 1000.0));
        System.out.println("Individuals around target location:");
       for (Individual individual : individualsAroundTarget) {
           System.out.println("X: " + individual.getX() + ", Y: " + individual.getY());
       }
    }

    public static List<Individual> generateRandomIndividuals(int numIndividuals, double minX, double maxX, double minY, double maxY) {
        List<Individual> individuals = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < numIndividuals; i++) {
            double x = minX + (maxX - minX) * random.nextDouble();
            double y = minY + (maxY - minY) * random.nextDouble();
            Individual individual = new Individual(x, y);
            individuals.add(individual);
        }

        return individuals;
    }
}
