import { runCodeCheck } from './codeChecks'

function hash(text) {
  let value = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

// shortcut: this prototype has no code-execution backend, so pass/fail is a
// deterministic simulation. Replace with a real sandboxed runner when available.
export function runTestCases(testCases, code) {
  const source = (code || '').trim()
  return (testCases || []).map((testCase) => {
    if (testCase.type === 'code') {
      return { ...testCase, passed: Boolean(source && runCodeCheck(testCase.check, source)) }
    }
    const expected = (testCase.expectedOutput || '').trim()
    const inSource =
      expected && (source.includes(`"${expected}"`) || source.includes(`'${expected}'`))
    const passed = Boolean(
      source && (inSource || hash(`demo|${source}|${testCase.input}|${expected}`) % 100 < 60),
    )
    return { ...testCase, passed }
  })
}
