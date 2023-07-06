package test.individuals.city_behavior.search.java.phtree;
import ch.ethz.globis.phtree.*;
import ch.ethz.globis.phtree.util.PhTreeStats;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class PHTree {
    private PhTree<Individual> phTree;

    public PHTree() {
        phTree = PhTree.create(2); // Specify the number of dimensions (2 for 2D)
    }

    public int getDim() {
        return phTree.getDim();
    }

    public void addIndividual(Individual individual) {
        phTree.put(new long[] {individual.getX(), individual.getY()}, individual);
    }

    public List<Individual> findIndividualsAround(long x, long y, long radius) {
        PhTree.PhQuery<Individual> query = phTree.query(new long[] {x - radius, y - radius}, new long[] {x + radius, y + radius});
        //query.reset();
        List<Individual> individuals = new ArrayList<>();
        while (query.hasNext()) {
            individuals.add(query.nextValue());
        }
        return individuals;
    }

    public void printTreeStats() {
        PhTreeStats stats = phTree.getStats();
        System.out.println("Tree statistics:");
        System.out.println("  Number of entries: " + stats.toString());
        System.out.println("  Tree depth: " + stats.getBitDepth());
    }

    public PhKnnQueryF<T> nearestNeighbour(int nMin, double... key) {
        long[] lKey = new long[key.length];
        pre.pre(key, lKey);
        PhKnnQuery<T> iter = pht.nearestNeighbour(nMin, PhDistanceF.THIS, null, lKey);
        return new PhKnnQueryF<>(iter, pht.getDim(), pre);
    }
    // Other methods and logic as needed
}
