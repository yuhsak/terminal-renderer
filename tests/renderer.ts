import {Writable} from 'stream'
import {createTerminalRenderer} from '../src'

const createWritable = () => {
  const state = {output: ''}
  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      state.output += chunk
      callback()
    }
  })
  return {state, stream}
}

describe('TerminalRenderer', () => {

  test('Test Case 1', (done) => {
    const {stream, state} = createWritable()
    const renderer = createTerminalRenderer(stream)
    renderer.write('test')
    setTimeout(() => {
      expect(state.output).toBe('test')
      done()
    }, 100)
  })

  test('position', () => {
    const {stream, state} = createWritable()
    const renderer = createTerminalRenderer(stream, {width: 80, height: 20})

    // Can't move over edge
    renderer.move(100, 100)
    expect(renderer.position).toStrictEqual({x: 79, y: 19})
    renderer.move(-100, -100)
    expect(renderer.position).toStrictEqual({x: 0, y: 0})

    // Can't write over edge
    renderer.text('a'.repeat(100))
    expect(renderer.position.x).toBe(80)
    renderer.text('a')
    expect(renderer.position.x).toBe(80)
    renderer.newLine(100)
    expect(renderer.position).toStrictEqual({x: 0, y: 20})
    renderer.text('a')
    expect(renderer.position).toStrictEqual({x: 0, y: 20})
    renderer.move(0, -1)
    expect(renderer.position).toStrictEqual({x: 0, y: 19})
    renderer.text('abc')
    expect(renderer.position.x).toBe(3)
    renderer.newLine()
    expect(renderer.position).toStrictEqual({x: 3, y: 20})
  })

})
