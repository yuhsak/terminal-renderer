export type XY = {
  x: number
  y: number
}

export type ANSITextStyle =
  'bold' |
  'italic' |
  'underline' |
  'black' |
  'red' |
  'green' |
  'yellow' |
  'blue' |
  'magenta' |
  'cyan' |
  'white' |
  'gray' |
  'brightRed' |
  'brightGreen' |
  'brightYellow' |
  'brightBlue' |
  'brightMagenta' |
  'brightCyan' |
  'brightWhite' |
  'bgRed' |
  'bgGreen' |
  'bgYellow' |
  'bgBlue' |
  'bgMagenta' |
  'bgCyan' |
  'bgWhite' |
  'bgGray' |
  'bgBrightRed' |
  'bgBrightGreen' |
  'bgBrightYellow' |
  'bgBrightBlue' |
  'bgBrightMagenta' |
  'bgBrightCyan' |
  'bgBrightWhite' |
  {rgb: [number, number, number]} |
  {bgRgb: [number, number, number]}
