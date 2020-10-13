import {Writable, WritableOptions} from 'stream'
import {EOL} from 'os'
import {font, cursor, beep} from 'ansi-code'

import type {XY, ANSITextStyle} from './types'
import {subtractXY, stringToLines, calcPosition, translateTextStyles, decode} from './util'

type WriteCallback = (err?: Error | null) => void
type EndCallback = () => void

export class TerminalRenderer extends Writable {

  public position: XY
  public savedPosition: XY
  public width: number
  public isTTY: boolean

  /**
   *
   * @param {NodeJS.WriteStream | NodeJS.WritableStream} stream - Target writable stream
   * @param {WritableOptions} option
   * @example const renderer = new TerminalRenderer(process.stdout)
   */
  constructor(public stream: NodeJS.WriteStream | NodeJS.WritableStream, option?: WritableOptions) {
    super(option)
    this.position = this.savedPosition = {x: 0, y: 0}
    this.width = this.getWidth()
    this.isTTY = 'isTTY' in this.stream ? (!!this.stream.isTTY) : false
  }

  private setPosition(x: number, y: number) {
    this.position = {x, y}
    return this
  }

  private setPositionRelative(x: number = 0, y: number = 0) {
    this.setPosition(this.position.x + x, this.position.y + y)
    return this
  }

  private setSavedPosition(x: number = 0, y: number = 0) {
    this.savedPosition = {x, y}
    return this
  }

  private updatePosition(lines: string[]) {
    const position = calcPosition(lines, this.position)
    this.setPosition(position.x, position.y)
    return this
  }

  private getOutput(chunk: string | Buffer, encOrCallback?: BufferEncoding | WriteCallback | EndCallback) {
    const encoding = typeof encOrCallback === 'string' ? encOrCallback : 'utf-8'
    const lines = stringToLines(decode(chunk, encoding), this.getWidth())
    this.updatePosition(lines)
    return Buffer.from(lines.join(EOL))
  }

  /**
   * Get current number of columns of the target stream.
   * If the target stream isn't a tty, returns always 80
   */
  public getWidth() {
    this.width = 'columns' in this.stream ? (this.stream.columns || 80) : 80
    return this.width
  }

  /**
   * Get current cursor position relative to origin
   */
  public getPosition() {
    return this.position
  }

  public write(chunk: string | Buffer, encOrCallback?: BufferEncoding | WriteCallback, callback?: WriteCallback): boolean {
    return super.write(this.getOutput(chunk, encOrCallback), callback)
  }

  public end(chunk?: string | Buffer | EndCallback, encOrCallback?: BufferEncoding | EndCallback, callback?: EndCallback): void {
    if (!chunk || typeof chunk === 'function') {
      return super.end(chunk)
    }
    return super.end(this.getOutput(chunk, encOrCallback), callback)
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

  public move(x: number = 0, y: number = 0) {
    this.write(cursor.move(x,y))
    this.setPositionRelative(x, y)
    return this
  }

  public to(x:number, y?:number) {
    const _y = y ?? this.position.y
    const distance = subtractXY({x, y: _y}, this.position)
    this.move(distance.x, distance.y)
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

  public clearLine() {
    this.eraseLine()
    this.to(0)
    return this
  }

  public newLine() {
    this.write(EOL)
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

export const createTerminalRenderer = (stream: NodeJS.WritableStream, option?: WritableOptions) => new TerminalRenderer(stream, option)
