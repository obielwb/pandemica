import { defineConfig } from 'tsup'

export default defineConfig({
  tsconfig: './tsconfig.json',
  entry: ['./src', './data/census/index.ts', './data/covid19/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'es2022'
})
