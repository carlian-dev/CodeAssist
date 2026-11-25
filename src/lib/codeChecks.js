function usesRecursion(code) {
  const match =
    code.match(/\bdef\s+(\w+)\s*\([^)]*\)\s*:/) || code.match(/\bfunction\s+(\w+)\s*\(/)
  if (!match) return false
  const rest = code.slice(code.indexOf(match[0]) + match[0].length)
  return new RegExp(`\\b${match[1]}\\s*\\(`).test(rest)
}

export const CODE_CHECKS = {
  loop: { label: 'Uses a for/while loop', test: (code) => /\b(for|while)\b/.test(code) },
  forLoop: { label: 'Uses a for loop', test: (code) => /\bfor\b/.test(code) },
  whileLoop: { label: 'Uses a while loop', test: (code) => /\bwhile\b/.test(code) },
  nestedLoop: {
    label: 'Uses nested loops',
    test: (code) => (code.match(/\b(for|while)\b/g) || []).length > 1,
  },
  noLoop: { label: 'Avoids loops', test: (code) => !/\b(for|while)\b/.test(code) },
  conditional: {
    label: 'Uses if / else',
    test: (code) => /\bif\b/.test(code) && /\b(else|elif)\b/.test(code),
  },
  function: { label: 'Defines a function', test: (code) => /\b(def|function)\s+\w+\s*\(/.test(code) },
  recursion: { label: 'Uses recursion', test: usesRecursion },
  class: { label: 'Defines a class', test: (code) => /\bclass\s+\w+/.test(code) },
  init: { label: 'Defines __init__', test: (code) => /\bdef\s+__init__\s*\(/.test(code) },
  dictionary: {
    label: 'Uses a dictionary / map',
    test: (code) => /\{[^}]*:|dict\s*\(|new Map|\{\s*\}/.test(code),
  },
  noSort: { label: 'Avoids built-in sort()', test: (code) => !/\.sort\s*\(|\bsorted\s*\(/.test(code) },
  noSum: { label: 'Avoids built-in sum()', test: (code) => !/\bsum\s*\(/.test(code) },
  noMax: { label: 'Avoids built-in max()', test: (code) => !/\bmax\s*\(/.test(code) },
  output: {
    label: 'Prints output',
    test: (code) => /\bprint\s*\(|console\.log|cout|System\.out/.test(code),
  },
}

export const CODE_CHECK_OPTIONS = Object.entries(CODE_CHECKS).map(([value, check]) => ({
  value,
  label: check.label,
}))

export function runCodeCheck(check, code) {
  const entry = CODE_CHECKS[check]
  return entry ? entry.test(code || '') : false
}
