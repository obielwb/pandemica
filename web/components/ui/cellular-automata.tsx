// components/CellularAutomata.tsx
import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { P5CanvasInstance } from '@p5-wrapper/react'

const Sketch = dynamic(() => import('@p5-wrapper/react').then((mod) => mod.ReactP5Wrapper), {
  ssr: false
})

const cellularAutomataSketch = (theme: 'dark' | 'light') => (p5: P5CanvasInstance) => {
  let grid
  let cols
  let rows
  const resolution = 10
  let initialized = false

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    cols = Math.floor(p5.width / resolution)
    rows = Math.floor(p5.height / resolution)
    grid = make2DArray(cols, rows)
    initializeGridWithText('Pandemica')
    setThemeBackground(theme)
  }

  p5.draw = () => {
    if (!initialized) {
      displayText()
      initialized = true
      return
    }

    drawCells()
    updateGrid()
  }

  function initializeGridWithText(text: string) {
    // Implement function to fill grid based on the text "Pandemica"
    // This is a placeholder logic for text rendering
    p5.textSize(64)
    p5.text(text, 50, 100)
    // More sophisticated text-to-grid mapping needed
  }

  function drawCells() {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * resolution
        let y = j * resolution
        if (grid[i][j] === 1) {
          p5.fill(255)
          p5.stroke(0)
          p5.rect(x, y, resolution, resolution)
        }
      }
    }
  }

  function updateGrid() {
    // Cellular automata logic here
  }

  function make2DArray(cols: number, rows: number) {
    let arr = new Array(cols)
    for (let i = 0; i < cols; i++) {
      arr[i] = new Array(rows).fill(0)
    }
    return arr
  }

  function setThemeBackground(currentTheme: 'dark' | 'light') {
    if (currentTheme === 'dark') {
      p5.background(0)
    } else {
      p5.background(255)
    }
  }
}

export default function CellularAutomata() {
  const { theme } = useTheme()
  const [key, setKey] = useState(Math.random())

  useEffect(() => {
    setKey(Math.random()) // regenerate component key to force re-render
  }, [theme])

  if (theme) {
    return <Sketch sketch={cellularAutomataSketch(theme as 'dark' | 'light')} key={key} />
  } else {
    return null
  }
}
