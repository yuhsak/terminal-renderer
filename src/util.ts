import {EOL} from 'os'
import getStringWidth from 'string-width'
import {font} from 'ansi-code'

import type {XY, ANSITextStyle} from './types'
import {splitExceptANSI} from './str'

export const decode = (value: string | Buffer, encoding?: BufferEncoding) => (typeof value === 'string' ? Buffer.from(value, encoding) : value).toString()

export const subtractXY = (a: XY, b: XY) => ({
  x: a.x - b.x,
  y: a.y - b.y
})

export const addXY = (a: XY, b: XY) => ({
  x: a.x + b.x,
  y: a.y + b.y
})

export const maxXY = (xy: XY, limit: XY) => ({
  x: Math.min(xy.x, limit.x),
  y: Math.min(xy.y, limit.y)
})

export const minXY = (xy: XY, limit: XY) => ({
  x: Math.max(xy.x, limit.x),
  y: Math.max(xy.y, limit.y)
})

export const positiveXY = (xy: XY) => minXY(xy, {x: 0, y: 0})

export const positiveMaxXY = (xy: XY, limit: XY) => maxXY(positiveXY(xy), limit)

const substr = (str: string, width: number) => {
  return splitExceptANSI(str).reduce((acc, char) => {
    const length = acc.length + getStringWidth(char)
    return length > width ? acc : {value: acc.value + char, length}
  }, {value: '', length: 0}).value
}

const substrLinesByWidth = (lines: string[], width: number, x: number) => {
  return lines.map((line, i) => substr(line, width - (i === 0 ? x : 0)))
}

const popLinesByHeight = (lines: string[], height: number, y: number) => {
  const _lines = lines.slice()
  let nextY
  while ((nextY = y + _lines.length - 1) + 1 > height) {
    _lines.pop()
  }
  return _lines
}

export const calcPosition = (lines: string[], currentPosition: XY) => {
  const lastLineWidth = getStringWidth(lines.slice(-1)[0])
  const x = (lines.length > 1 ? 0 : currentPosition.x) + lastLineWidth
  const y = currentPosition.y + lines.length - 1
  return {x, y}
}

export const cropLines = (lines: string[], width: number, height: number, x: number, y: number) => {
  const widthAdjusted = substrLinesByWidth(lines, width, x)
  const heightAdjusted = popLinesByHeight(widthAdjusted, height, y)
  return heightAdjusted
}

export const translateTextStyles = (styles: ANSITextStyle[]) => {

  return styles.map(style => {
    if (style === 'bold') {
      return font.style.bold
    }
    if (style === 'italic') {
      return font.style.italic
    }
    if (style === 'underline') {
      return font.style.underline
    }
    if (style === 'black') {
      return font.color.black
    }
    if (style === 'red') {
      return font.color.red
    }
    if (style === 'green') {
      return font.color.green
    }
    if (style === 'yellow') {
      return font.color.yellow
    }
    if (style === 'blue') {
      return font.color.blue
    }
    if (style === 'magenta') {
      return font.color.magenta
    }
    if (style === 'cyan') {
      return font.color.cyan
    }
    if (style === 'white') {
      return font.color.white
    }
    if (style === 'gray') {
      return font.color.gray
    }
    if (style === 'bgRed') {
      return font.bgColor.red
    }
    if (style === 'bgGreen') {
      return font.bgColor.green
    }
    if (style === 'bgYellow') {
      return font.bgColor.yellow
    }
    if (style === 'bgBlue') {
      return font.bgColor.blue
    }
    if (style === 'bgMagenta') {
      return font.bgColor.magenta
    }
    if (style === 'bgCyan') {
      return font.bgColor.cyan
    }
    if (style === 'bgWhite') {
      return font.bgColor.white
    }
    if (typeof style !== 'string') {
      if ('rgb' in style) {
        return font.color.rgb(...style.rgb)
      }
      if ('bgRgb' in style) {
        return font.bgColor.rgb(...style.bgRgb)
      }
    }
    return style
  })

}
