from rtree import index
from rtree.index import Rtree

class Individual:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        # Other attributes and methods as needed

def add_individual(rtree_index, individual):
    rtree_index.insert(id(individual), (individual.x, individual.y, individual.x, individual.y))

def find_individuals_around(rtree_index, x, y, radius):
    bounds = (x - radius, y - radius, x + radius, y + radius)
    result_ids = list(rtree_index.intersection(bounds))
    individuals_around = [ind for ind in rtree_index.get_objects(result_ids)]
    return individuals_around

def main():
    rtree_index = index.Index()

    # Add your million individuals to the R-tree
    # Example with three individuals:
    individual1 = Individual(10.0, 20.0)
    individual2 = Individual(15.0, 25.0)
    individual3 = Individual(5.0, 15.0)

    add_individual(rtree_index, individual1)
    add_individual(rtree_index, individual2)
    add_individual(rtree_index, individual3)

    # Find individuals around a specific location
    target_x = 10.0
    target_y = 20.0
    search_radius = 5.0

    individuals_around_target = find_individuals_around(rtree_index, target_x, target_y, search_radius)
    print(individuals_around_target)

if __name__ == "__main__":
    main()
