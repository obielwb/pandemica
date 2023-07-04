package test.individuals.city_behavior.java;


import com.github.davidmoten.rtree.RTree;
import com.github.davidmoten.rtree.geometry.Geometries;
import com.github.davidmoten.rtree.geometry.Point;
import rx.Observable;

import java.util.List;

public class RTreeExample {
    private RTree<Individual, Point> rTree = RTree.create();

    // Add method to add individuals to the R-tree
    public void addIndividual(Individual individual) {
        Point point = Geometries.point(individual.getX(), individual.getY());
        rTree = rTree.add(individual, point);
    }

    // Method to find individuals around a specific location
    public List<Individual> findIndividualsAround(double x, double y, double radius) {
        Point point = Geometries.point(x, y);
        List<Individual> individualsAround = rTree.search(point, radius).map(entry -> entry.value()).toList().toBlocking().single();
        return individualsAround;
    }
}
