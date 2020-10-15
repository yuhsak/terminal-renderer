import {EOL} from 'os'

export const ansiRegExp = ({onlyFirst = false} = {}) => (
  new RegExp([
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
  ].join('|'), onlyFirst ? void(0) : 'g')
)

export const extractANSI = (str: string) => str.match(ansiRegExp())?.join('') || ''

export const extractEOL = (str: string) => str.match(new RegExp(EOL, 'g'))?.join('') || ''

export const matchAll = (str: string, reg: RegExp) => {
  const _reg = new RegExp(reg)
  const res = []
  let match
  while ((match = _reg.exec(str)) !== null) {
    res.push(match)
  }
  return res
}

export const split = (str: string, keep: RegExp[] = []) => {
  const arr = str.split('')
  const matches = keep.map(reg => matchAll(str, reg))
    .reduce((a, b) => [...a, ...b], [])
    .sort((a, b) => {
      const d = b.index - a.index
      if (d !== 0) return d
      return b[0].length - a[0].length
    })
  matches.forEach(m => {
    const t = arr.slice(m.index, m.index + m[0].length).join('')
    if (t !== m[0]) return
    arr.splice(m.index, m[0].length, m[0])
  })
  return arr
}

export const splitExceptANSI = (str: string) => split(str, [ansiRegExp()])
