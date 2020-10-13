import {EOL} from 'os'
import getStringWidth from 'string-width'
import {font} from 'ansi-code'

import type {XY, ANSITextStyle} from './types'

export const subtractXY = (a: XY, b: XY) => ({
  x: a.x - b.x,
  y: a.y - b.y
})

const subtractByWidth = (str: string, width: number) => {
  return str.split('').reduce((acc, char) => {
    const length = acc.length + getStringWidth(char)
    return length > width ? acc : {value: acc.value + char, length}
  }, {value: '', length: 0}).value
}

export const stringToLines = (str: string, maxLineWidth: number) => {
  return str.split(EOL).map(line => subtractByWidth(line, maxLineWidth))
}

export const calcPosition = (lines: string[], currentPosition: XY) => {
  const lastLineWidth = getStringWidth(lines.slice(-1)[0])
  const x = (lines.length > 1 ? 0 : currentPosition.x) + lastLineWidth
  const y = currentPosition.y + lines.length - 1
  return {x, y}
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

export const decode = (value: string | Buffer, encoding?: BufferEncoding) => (typeof value === 'string' ? Buffer.from(value, encoding) : value).toString()

export type AsyncQueue = {
  push: <T>(fn: () => Promise<T> | T) => Promise<T>
}

export const createAsyncQueue = (): AsyncQueue => {

  const queue = [Promise.resolve()] as Promise<any>[]

  const push = <T>(fn: () => Promise<T> | T): Promise<T> => {
    const p = queue.slice(-1)[0].then(fn)
    queue.push(p)
    return p
  }

  return {
    push,
  }

}
