package main

import (
	"fmt"

	"github.com/dhconnelly/rtreego"
)

var tol = 0.01

type Somewhere struct {
  location rtreego.Point
  name string
  wormhole chan int
}

func (d *Somewhere) Bounds() *rtreego.Rect {
  return d.location.ToRect(0.01)
}

func main() {
	// Create an R-tree instance
	rt := rtreego.NewTree(2, 25, 50)

  rt.Insert(&Somewhere{rtreego.Point{0, 0}, "Someplace", nil})
  rt.Insert(&Somewhere{rtreego.Point{10.2, 0}, "Someplace", nil})
  rt.Insert(&Somewhere{rtreego.Point{10, 0}, "Someplace", nil})
  rt.Insert(&Somewhere{rtreego.Point{02, 0}, "Someplace", nil})
  rt.Insert(&Somewhere{rtreego.Point{03, 0}, "Someplace", nil})
  rt.Insert(&Somewhere{rtreego.Point{04, 0}, "Someplace", nil})
  rt.Insert(&Somewhere{rtreego.Point{05, 0}, "Someplace", nil})


	// Find individuals around a specific location
	targetX := 0.0
	targetY := 0.0
	searchRadius := 5.0

	searchRect, _ := rtreego.NewRect(
		rtreego.Point{targetX - searchRadius, targetY - searchRadius},
		[]float64{searchRadius, searchRadius},
	)

	results := rt.SearchIntersect(searchRect)
  cnt := 0
	// Print the individuals found around the target location
	fmt.Println("Individuals around target location:")
	for _, obj := range results {
    fmt.Print(cnt)
    cnt++
    fmt.Print(obj.Bounds().String())
	}
}
