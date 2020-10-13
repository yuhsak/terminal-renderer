import {Writable} from 'stream'
import {createTerminalRenderer} from '../src'

describe('TerminalRenderer', () => {

  test('Test Case 1', (done) => {
    let output = ''
    const stream = new Writable({
      write: (chunk, encoding, callback) => {
        output += chunk
        callback()
      }
    })
    const renderer = createTerminalRenderer(stream)
    renderer.write('test')
    setTimeout(() => {
      expect(output).toBe('test')
      done()
    }, 1000)
  })

})
