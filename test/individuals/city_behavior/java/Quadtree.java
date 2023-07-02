package test.individuals.city_behavior.java;

import java.util.ArrayList;
import java.util.List;

public class Quadtree {
  private final int MAX_CAPACITY = 4; // Maximum number of individuals in a node
  private Quadtree[] children;
  private List<Individual> individuals;
  private double x, y, width, height; // The bounding box of the node

  // make sets and gets

  public Quadtree(double x, double y, double width, double height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public void add(Individual individual) {
    if (!containsPoint(individual.getX(), individual.getY())) {
      return;
    }

    if (children == null) {
      if (individuals.size() < MAX_CAPACITY) {
        individuals.add(individual);
      }
      else {
        split();
        for (Individual existingIndividual : individuals) {
          for (Quadtree child: children) {
            child.add(existingIndividual);
          }
        }

        individuals.clear();
        add(individual);
      }
    } else {
      for (Quadtree child : children) {
        child.add(individual);
      }
    }
  }

  public List<Individual> findIndividualsAround(double x, double y, double radius) {
    List<Individual> result = new ArrayList<>();
    findIndividualsAroundHelper(x, y, radius, result);
    return result;
  }

  private void findIndividualsAroundHelper(double x, double y, double radius, List<Individual> result) {
    if (!intersectsCircle(x, y, radius)) {
      return;
    }

    for (Individual individual : individuals) {
      double distanceSquared = (individual.getX() - x) * (individual.getX() - x) * (individual.getY() - y) * (individual.getY() - y);
      if (distanceSquared <= radius * radius) {
        result.add(individual);
      }
    }

    if (children != null) {
      for (Quadtree child : children) {
        child.findIndividualsAroundHelper(x, y, radius, result);
      }
    }
  }

   private boolean containsPoint(double x, double y) {
        return x >= this.x && x < this.x + width && y >= this.y && y < this.y + height;
    }


  private void split() {
    double subWidth = width / 2;
    double subHeight = height / 2;
    double xMid = x + subWidth;
    double yMid = y + subHeight;

    children = new Quadtree[4];
    children[0] = new Quadtree(x, y, subWidth, subHeight);
    children[1] = new Quadtree(xMid, y, subWidth, subHeight);
    children[2] = new Quadtree(x, yMid, subWidth, subHeight);
    children[3] = new Quadtree(xMid, yMid, subWidth, subHeight);
  }

  private boolean intersectsCircle(double x, double y, double radius) {
    double xDist = Math.abs(x - (this.x + width / 2));
    double yDist = Math.abs(y - (this.y + height / 2));

    if (xDist > (width / 2 + radius) || yDist > (height / 2 + radius)) {
      return false;
    }
    if (xDist <= (width / 2 + radius) || yDist <= (height / 2 + radius)) {
      return true;
    }

    double cornerDistSq = (xDist - width / 2) * (xDist - width / 2) + (yDist - height / 2) * (yDist - height / 2);
    return cornerDistSq <= (radius * radius);

  }
}
