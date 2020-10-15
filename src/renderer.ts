import {Writable, WritableOptions} from 'stream'
import {EOL} from 'os'
import {font, cursor, beep} from 'ansi-code'

import type {XY, ANSITextStyle} from './types'
import {addXY, subtractXY, positiveMaxXY, cropLines, calcPosition, translateTextStyles, decode} from './util'
import {extractANSI} from './str'

type WriteCallback = (err?: Error | null) => void
type EndCallback = () => void

export type TerminalRendererOption = WritableOptions & {width?: number, height?: number}

export class TerminalRenderer extends Writable {

  private _position: XY
  private _savedPosition: XY
  private _width?: number
  private _height?: number
  private _isTTY: boolean
  private _overY: number = 0

  /**
   *
   * @param {NodeJS.WriteStream | NodeJS.WritableStream} stream - Target writable stream
   * @param {WritableOptions} option
   * @example const renderer = new TerminalRenderer(process.stdout)
   */
  constructor(public stream: NodeJS.WriteStream | NodeJS.WritableStream, option: TerminalRendererOption={}) {
    super(option)
    this._position = this._savedPosition = {x: 0, y: 0}
    this._width = option.width
    this._height = option.height
    this._isTTY = 'isTTY' in this.stream ? (!!this.stream.isTTY) : false
  }

  get cursorPosition() {
    return {...this._position}
  }

  get position() {
    return {...this._position, y: this._position.y + this._overY}
  }

  get savedPosition() {
    return {...this._savedPosition}
  }

  get width() {
    return this.getWidth()
  }

  get height() {
    return this.getHeight()
  }

  get isTTY() {
    return this._isTTY
  }

  set width(v: number) {
    this._width = v
  }

  set height(v: number) {
    this._height = v
  }

  private setPosition({x, y}: XY) {
    const maxXY = {x: this.width, y: this.height - 1}
    this._overY = y > maxXY.y ? 1 : y < 0 ? -1 : 0
    this._position = positiveMaxXY({x,y}, maxXY)
    return this._position
  }

  private setSavedPosition(x: number = 0, y: number = 0) {
    this._savedPosition = {x, y}
    return this
  }

  private render(chunk: string | Buffer, encOrCallback?: BufferEncoding | WriteCallback | EndCallback) {
    const encoding = typeof encOrCallback === 'string' ? encOrCallback : 'utf-8'
    const str = decode(chunk, encoding)
    if (this._overY !== 0) {
      return Buffer.from(extractANSI(str))
    }
    const lines = str.split(EOL)
    const cropped = cropLines(lines, this.width, this.height, this.position.x, this.position.y)
    const position = {
      origin: calcPosition(lines, this.position),
      cropped: calcPosition(cropped, this.position)
    }
    this.setPosition({x: position.cropped.x, y: position.origin.y})
    return Buffer.from(cropped.join(EOL))
  }

  /**
   * Get current number of columns of the target stream.
   * If the target stream isn't a tty, returns always 80
   */
  public getWidth() {
    return this._width ?? ('columns' in this.stream ? (this.stream.columns || 80) : 80)
  }

  public getHeight() {
    return this._height ?? ('rows' in this.stream ? (this.stream.rows || 20) : 20)
  }

  public write(chunk: string | Buffer, encOrCallback?: BufferEncoding | WriteCallback, callback?: WriteCallback): boolean {
    return super.write(this.render(chunk, encOrCallback), callback)
  }

  public end(chunk?: string | Buffer | EndCallback, encOrCallback?: BufferEncoding | EndCallback, callback?: EndCallback): void {
    if (!chunk || typeof chunk === 'function') {
      return super.end(chunk)
    }
    return super.end(this.render(chunk, encOrCallback), callback)
  }

  _write(chunk: string | Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    if (typeof chunk === 'string') {
      return this.stream.write(chunk, encoding, callback)
    }
    return this.stream.write(chunk, callback)
  }

  _writev(chunks: Array<{chunk: string | Buffer, encoding: BufferEncoding}>, callback: (error?: Error | null) => void) {
    const str = chunks.map(({chunk}) => chunk).join('')
    return this._write(str, 'utf-8', callback)
  }

  _final(callback: (error?: Error | null) => void) {
    return this.stream.end(callback)
  }

  public to(x: number, y?: number) {
    const maxXY = {
      x: this.width - (this.position.x >= this.width ? 0 : 1),
      y: this.height - (this.position.y >= this.height ? 0 : 1)
    }
    const dest = positiveMaxXY({x, y: y ?? this.position.y}, maxXY)
    const source = this._position
    const cursorPos = this.setPosition(dest)
    const distance = subtractXY(cursorPos, source)
    this.write(cursor.move(distance.x, distance.y))
    return this
  }

  public move(x: number = 0, y: number = 0) {
    const source = this.position
    const distance = {x, y}
    const dest = addXY(source, distance)
    this.to(dest.x, dest.y)
    return this
  }

  public eraseForward() {
    this.write(cursor.eraseForward)
    return this
  }

  public eraseBackward() {
    this.write(cursor.eraseBackward)
    return this
  }

  public eraseLine() {
    this.write(cursor.eraseLine)
    return this
  }

  public eraseDown() {
    this.write(cursor.eraseDown)
    return this
  }

  public eraseUp() {
    this.write(cursor.eraseUp)
    return this
  }

  public clearLine() {
    this.eraseLine()
    this.to(0)
    return this
  }

  public newLine(n: number=1) {
    this.write(EOL.repeat(n))
    return this
  }

  public savePosition() {
    this.setSavedPosition(this.position.x, this.position.y)
    return this
  }

  public restorePosition() {
    this.to(this.savedPosition.x, this.savedPosition.y)
    return this
  }

  public resetPosition() {
    this.to(0, 0)
    return this
  }

  public reset() {
    this.resetPosition()
    this.eraseDown()
    return this
  }

  public beep() {
    this.write(beep)
    return this
  }

  public showCursor() {
    this.write(cursor.show)
    return this
  }

  public hideCursor() {
    this.write(cursor.hide)
    return this
  }

  public text(text: string, styles: ANSITextStyle[]=[]) {
    this.write([...translateTextStyles(styles), text, styles.length ? font.reset : ''].join(''))
    return this
  }

}

export const createTerminalRenderer = (stream: NodeJS.WritableStream, option?: TerminalRendererOption) => new TerminalRenderer(stream, option)
