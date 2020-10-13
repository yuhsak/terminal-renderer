# terminal-renderer

Low level renderer for ANSI terminals written in TypeScript

## Install

```sh
npm install terminal-renderer
```

## Usage

```ts
import {createTerminalRenderer} from 'terminal-renderer'

const renderer = createTerminalRenderer(process.stdout)

renderer
  .text('This is a text')
  .newLine()
  .move(10, -1)
  .text('edited text', ['blue'])
  .newLine()

// The result output:
// This is a edited text
```
