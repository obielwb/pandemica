import { defineConfig } from 'tsup'

export default defineConfig({
  tsconfig: './tsconfig.json',
  entry: ['./src'],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2022'
})
