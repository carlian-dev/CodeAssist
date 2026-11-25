const JS_TIMEOUT_MS = 3000
const PREVIEW_DELAY_MS = 260
const MAX_STEPS = 4000
const MAX_DEPTH = 60

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class PreviewError extends Error {
  constructor(message, line) {
    super(line ? `Line ${line}: ${message}` : message)
    this.name = 'PreviewError'
  }
}

function createRuntime() {
  return { stdout: '', steps: 0, depth: 0 }
}

function displayString(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') return value
  return String(value)
}

function pythonString(value) {
  if (value === null || value === undefined) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'string') return value
  return String(value)
}

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') return value
  return String(value)
}

function decodeEscape(text) {
  switch (text[0]) {
    case 'n':
      return '\n'
    case 't':
      return '\t'
    case 'r':
      return '\r'
    case 'b':
      return '\b'
    case 'f':
      return '\f'
    case 'v':
      return '\v'
    case '0':
      return '\0'
    case '\\':
      return '\\'
    case "'":
      return "'"
    case '"':
      return '"'
    case 'x': {
      const code = Number.parseInt(text.slice(1, 3), 16)
      return Number.isNaN(code) ? text : String.fromCharCode(code)
    }
    case 'u': {
      const code = Number.parseInt(text.slice(1, 5), 16)
      return Number.isNaN(code) ? text : String.fromCharCode(code)
    }
    default:
      return text
  }
}

function decodeEscapes(raw) {
  let result = ''
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index]
    if (char !== '\\' || index === raw.length - 1) {
      result += char
      continue
    }
    const next = raw[index + 1]
    const length = 'xu'.includes(next) ? (next === 'x' ? 3 : 5) : 1
    result += decodeEscape(raw.slice(index + 1, index + 1 + length))
    index += length
  }
  return result
}

function countIndent(line) {
  let width = 0
  for (const char of line) {
    if (char === ' ') width++
    else if (char === '\t') width += 4
    else break
  }
  return width
}

function stripPythonComment(line) {
  let quote = null
  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
      continue
    }
    if (char === '#') return line.slice(0, index)
    if (char === '"' || char === "'") quote = char
  }
  return line
}

function stripCLikeComments(source) {
  let result = ''
  let quote = null
  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      result += char
      if (char === '\\') {
        index++
        result += source[index] || ''
      } else if (char === quote) {
        quote = null
      }
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      result += char
      continue
    }
    if (char === '/' && source[index + 1] === '/') {
      while (index < source.length && source[index] !== '\n') index++
      result += '\n'
      continue
    }
    if (char === '/' && source[index + 1] === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index++
      index++
      continue
    }
    result += char
  }
  return result
}

function stripSqlComments(source) {
  let result = ''
  let quote = null
  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      result += char
      if (char === "'" && source[index + 1] === "'") {
        result += "'"
        index++
      } else if (char === "'") {
        quote = null
      }
      continue
    }
    if (char === "'") {
      quote = char
      result += char
      continue
    }
    if (char === '-' && source[index + 1] === '-') {
      while (index < source.length && source[index] !== '\n') index++
      result += '\n'
      continue
    }
    if (char === '/' && source[index + 1] === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index++
      index++
      continue
    }
    result += char
  }
  return result
}

function lineAt(source, offset) {
  return source.slice(0, offset).split('\n').length
}

function splitTopLevel(source, delimiter) {
  const parts = []
  let depth = 0
  let quote = null
  let start = 0
  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if ('([{'.includes(char)) depth++
    else if (')]}'.includes(char)) depth--
    else if (depth === 0 && source.startsWith(delimiter, index)) {
      parts.push(source.slice(start, index))
      index += delimiter.length - 1
      start = index + 1
    }
  }
  parts.push(source.slice(start))
  return parts
}

function findMatching(source, openIndex) {
  const open = source[openIndex]
  const close = open === '(' ? ')' : open === '{' ? '}' : ']'
  let depth = 0
  let quote = null
  for (let index = openIndex; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === open) depth++
    else if (char === close) {
      depth--
      if (depth === 0) return index
    }
  }
  return -1
}

function findTopLevelKeyword(source, keyword) {
  let depth = 0
  let quote = null
  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if ('([{'.includes(char)) depth++
    else if (')]}'.includes(char)) depth--
    else if (depth === 0 && /[A-Za-z]/.test(char)) {
      const slice = source.slice(index, index + keyword.length)
      const before = source[index - 1] || ''
      const after = source[index + keyword.length] || ''
      if (slice.toUpperCase() === keyword && !/\w/.test(before) && !/\w/.test(after)) return index
    }
  }
  return -1
}

function applyBinary(operator, left, right, parser) {
  if (operator === '+') {
    if (typeof left === 'string' || typeof right === 'string') {
      return displayString(left) + displayString(right)
    }
    return ensureNumber(left, parser) + ensureNumber(right, parser)
  }
  const a = ensureNumber(left, parser)
  const b = ensureNumber(right, parser)
  switch (operator) {
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      if (b === 0) throw parser.error('Division by zero.')
      return a / b
    case '//':
      if (b === 0) throw parser.error('Division by zero.')
      return Math.floor(a / b)
    case '%':
      if (b === 0) throw parser.error('Division by zero.')
      return a % b
    default:
      throw parser.error(`The "${operator}" operator is not supported.`)
  }
}

function ensureNumber(value, parser) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
  throw parser.error(`Expected a number, received ${pythonString(value)}.`)
}

function splitConversion(expression) {
  let depth = 0
  let quote = null
  for (let index = 0; index < expression.length; index++) {
    const char = expression[index]
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if ('([{'.includes(char)) depth++
    else if (')]}'.includes(char)) depth--
    else if (depth === 0 && (char === ':' || (char === '!' && expression[index + 1] !== '='))) {
      const rest = expression.slice(index + 1)
      if (char === '!') {
        const colon = rest.indexOf(':')
        return colon === -1
          ? { expression: expression.slice(0, index), spec: '' }
          : { expression: expression.slice(0, index), spec: rest.slice(colon + 1) }
      }
      return { expression: expression.slice(0, index), spec: rest }
    }
  }
  return { expression, spec: '' }
}

function formatWithSpec(value, spec) {
  const trimmed = spec.trim()
  const fixed = trimmed.match(/^\.(\d+)f$/)
  if (fixed && typeof value === 'number') return value.toFixed(Number(fixed[1]))
  if (trimmed === 'd' && typeof value === 'number') return String(Math.trunc(value))
  return pythonString(value)
}

function renderFString(raw, scope, runtime, line) {
  let result = ''
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index]
    if (char === '\\' && index < raw.length - 1) {
      const next = raw[index + 1]
      const length = 'xu'.includes(next) ? (next === 'x' ? 3 : 5) : 1
      result += decodeEscape(raw.slice(index + 1, index + 1 + length))
      index += length
      continue
    }
    if (char === '{') {
      if (raw[index + 1] === '{') {
        result += '{'
        index++
        continue
      }
      let depth = 1
      let quote = null
      let end = index + 1
      for (; end < raw.length; end++) {
        const inner = raw[end]
        if (quote) {
          if (inner === '\\') end++
          else if (inner === quote) quote = null
          continue
        }
        if (inner === '"' || inner === "'") quote = inner
        else if (inner === '{') depth++
        else if (inner === '}') {
          depth--
          if (depth === 0) break
        }
      }
      if (depth !== 0) throw new PreviewError('Unclosed "{" in f-string.', line)
      const { expression, spec } = splitConversion(raw.slice(index + 1, end))
      const value = new ExpressionParser(expression, scope, runtime, line).parse()
      result += formatWithSpec(value, spec)
      index = end
      continue
    }
    if (char === '}' && raw[index + 1] === '}') {
      result += '}'
      index++
      continue
    }
    result += char
  }
  return result
}

class ExpressionParser {
  constructor(source, scope, runtime, line) {
    this.source = source
    this.scope = scope
    this.runtime = runtime
    this.line = line
    this.index = 0
  }

  error(message) {
    return new PreviewError(message, this.line)
  }

  peek(offset = 0) {
    return this.source[this.index + offset]
  }

  skip() {
    while (this.index < this.source.length && /\s/.test(this.source[this.index])) this.index++
  }

  parse() {
    this.skip()
    if (this.index >= this.source.length) return null
    const value = this.sum()
    this.skip()
    if (this.index < this.source.length) {
      throw this.error(`I could not understand "${this.source.slice(this.index).trim()}".`)
    }
    return value
  }

  sum() {
    let value = this.product()
    for (;;) {
      this.skip()
      const operator = this.peek()
      if (operator !== '+' && operator !== '-') return value
      this.index++
      value = applyBinary(operator, value, this.product(), this)
    }
  }

  product() {
    let value = this.unary()
    for (;;) {
      this.skip()
      let operator = this.peek()
      if (this.source.startsWith('//', this.index)) operator = '//'
      else if (operator === undefined || !'*/%'.includes(operator)) return value
      this.index += operator === '//' ? 2 : 1
      value = applyBinary(operator, value, this.unary(), this)
    }
  }

  unary() {
    this.skip()
    const operator = this.peek()
    if (operator === '-' || operator === '+') {
      this.index++
      const value = this.unary()
      return operator === '-' ? -ensureNumber(value, this) : value
    }
    return this.postfix(this.primary())
  }

  primary() {
    this.skip()
    const char = this.peek()
    if (char === undefined) throw this.error('The expression is incomplete.')
    if (char === '"' || char === "'") return this.stringLiteral('')
    if (/[fFrRbBuU]/.test(char) && /['"]/.test(this.peek(1) || '')) {
      const prefix = char.toLowerCase()
      this.index++
      return this.stringLiteral(prefix)
    }
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.peek(1) || ''))) {
      this.skip()
      const match = this.source.slice(this.index).match(/^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/)
      if (match) {
        this.index += match[0].length
        return Number(match[0])
      }
    }
    if (/[A-Za-z_]/.test(char)) {
      const name = this.name()
      this.skip()
      if (this.peek() === '(') return this.call(name)
      return this.lookup(name)
    }
    if (char === '(') {
      this.index++
      const value = this.sum()
      this.skip()
      if (this.peek() !== ')') throw this.error('Missing a closing ")".')
      this.index++
      return value
    }
    throw this.error(`Unexpected "${char}".`)
  }

  name() {
    const match = this.source.slice(this.index).match(/^[A-Za-z_]\w*/)
    if (!match) throw this.error('Expected a name.')
    this.index += match[0].length
    return match[0]
  }

  lookup(name) {
    if (name === 'True' || name === 'true') return true
    if (name === 'False' || name === 'false') return false
    if (name === 'None' || name === 'null') return null
    if (name in this.scope) return this.scope[name]
    throw this.error(`name '${name}' is not defined.`)
  }

  stringLiteral(prefix) {
    const quote = this.peek()
    const triple = this.peek(1) === quote && this.peek(2) === quote
    this.index += triple ? 3 : 1
    let raw = ''
    while (this.index < this.source.length) {
      const char = this.source[this.index]
      if (char === '\\') {
        raw += char
        this.index++
        raw += this.source[this.index] || ''
        this.index++
        continue
      }
      if (triple) {
        if (this.source.startsWith(quote.repeat(3), this.index)) {
          this.index += 3
          return this.finishString(raw, prefix)
        }
      } else if (char === quote) {
        this.index++
        return this.finishString(raw, prefix)
      }
      raw += char
      this.index++
    }
    throw this.error('Unterminated string.')
  }

  finishString(raw, prefix) {
    if (prefix.includes('f')) return renderFString(raw, this.scope, this.runtime, this.line)
    if (prefix.includes('r')) return raw
    return decodeEscapes(raw)
  }

  callArgs() {
    this.index++
    const args = []
    const kwargs = {}
    this.skip()
    if (this.peek() === ')') {
      this.index++
      return { args, kwargs }
    }
    for (;;) {
      this.skip()
      const keyword = this.source.slice(this.index).match(/^([A-Za-z_]\w*)\s*=(?!=)/)
      if (keyword) {
        this.index += keyword[0].length
        kwargs[keyword[1]] = this.sum()
      } else {
        args.push(this.sum())
      }
      this.skip()
      const char = this.peek()
      if (char === ',') {
        this.index++
        this.skip()
        if (this.peek() === ')') {
          this.index++
          return { args, kwargs }
        }
        continue
      }
      if (char === ')') {
        this.index++
        return { args, kwargs }
      }
      throw this.error('Expected "," or ")" in the argument list.')
    }
  }

  call(name) {
    const { args, kwargs } = this.callArgs()
    if (name in this.scope) {
      const fn = this.scope[name]
      if (!fn || fn.kind !== 'function') throw this.error(`'${name}' is not callable.`)
      if (args.length !== fn.params.length) {
        throw this.error(`${name}() expects ${fn.params.length} argument${fn.params.length === 1 ? '' : 's'} but received ${args.length}.`)
      }
      if (this.runtime.depth >= MAX_DEPTH) throw this.error('The preview stopped because the function calls went too deep.')
      this.runtime.steps++
      if (this.runtime.steps > MAX_STEPS) throw this.error('The preview stopped because it ran for too many steps.')
      const local = Object.create(fn.closure)
      fn.params.forEach((param, index) => {
        local[param] = args[index]
      })
      this.runtime.depth++
      const result = executePython(fn.body, local, this.runtime)
      this.runtime.depth--
      return result.returned ? result.value : null
    }
    switch (name) {
      case 'print': {
        const separator = 'sep' in kwargs ? pythonString(kwargs.sep) : ' '
        const ending = 'end' in kwargs ? pythonString(kwargs.end) : '\n'
        this.runtime.stdout += args.map(pythonString).join(separator) + ending
        return null
      }
      case 'len': {
        const value = args[0]
        if (typeof value === 'string' || Array.isArray(value)) return value.length
        throw this.error('len() expects a string in this preview.')
      }
      case 'str':
        return pythonString(args[0])
      case 'int': {
        const value = Number.parseInt(String(args[0]), 10)
        if (Number.isNaN(value)) throw this.error(`int() could not convert ${pythonString(args[0])} to a number.`)
        return value
      }
      case 'float': {
        const value = Number.parseFloat(String(args[0]))
        if (Number.isNaN(value)) throw this.error(`float() could not convert ${pythonString(args[0])} to a number.`)
        return value
      }
      case 'abs':
        return Math.abs(ensureNumber(args[0], this))
      case 'round': {
        const digits = args.length > 1 ? Number(args[1]) : 0
        const factor = 10 ** digits
        return Math.round(ensureNumber(args[0], this) * factor) / factor
      }
      case 'min':
        return Math.min(...args.map((value) => ensureNumber(value, this)))
      case 'max':
        return Math.max(...args.map((value) => ensureNumber(value, this)))
      case 'input':
        throw this.error('input() is not supported in this browser preview. Assign a value in the code instead.')
      default:
        throw this.error(`name '${name}' is not defined.`)
    }
  }

  postfix(value) {
    for (;;) {
      this.skip()
      if (this.peek() !== '.') return value
      this.index++
      this.skip()
      const name = this.name()
      this.skip()
      if (this.peek() !== '(') throw this.error(`Expected "(" after .${name}.`)
      const { args } = this.callArgs()
      value = callMethod(value, name, args, this)
    }
  }
}

function callMethod(value, name, args, parser) {
  if (typeof value !== 'string') throw parser.error(`.${name}() is not supported in this preview.`)
  switch (name) {
    case 'upper':
      return value.toUpperCase()
    case 'lower':
      return value.toLowerCase()
    case 'strip':
      return value.trim()
    case 'title':
      return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    case 'capitalize':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    case 'replace':
      return value.split(String(args[0])).join(String(args[1]))
    case 'startswith':
      return value.startsWith(String(args[0]))
    case 'endswith':
      return value.endsWith(String(args[0]))
    default:
      throw parser.error(`.${name}() is not supported in this preview.`)
  }
}

function evaluateExpression(source, scope, runtime, line) {
  return new ExpressionParser(source, scope, runtime, line).parse()
}

function executePython(statements, scope, runtime) {
  for (const statement of statements) {
    runtime.steps++
    if (runtime.steps > MAX_STEPS) {
      throw new PreviewError('The preview stopped because it ran for too many steps.', statement.line)
    }
    if (statement.type === 'define') {
      scope[statement.name] = {
        kind: 'function',
        params: statement.params,
        body: statement.body,
        closure: scope,
      }
    } else if (statement.type === 'assign') {
      scope[statement.name] = evaluateExpression(statement.expr, scope, runtime, statement.line)
    } else if (statement.type === 'return') {
      return {
        returned: true,
        value: statement.expr ? evaluateExpression(statement.expr, scope, runtime, statement.line) : null,
      }
    } else if (statement.type === 'expression') {
      evaluateExpression(statement.expr, scope, runtime, statement.line)
    }
  }
  return { returned: false, value: null }
}

function parsePythonBlock(lines, start, indent) {
  const statements = []
  let index = start
  while (index < lines.length) {
    const raw = lines[index]
    const line = index + 1
    if (!raw.trim()) {
      index++
      continue
    }
    if (!stripPythonComment(raw).trim()) {
      index++
      continue
    }
    const level = countIndent(raw)
    if (level < indent) break
    if (level > indent) throw new PreviewError('Unexpected indent.', line)
    const text = stripPythonComment(raw.slice(level)).trim()
    if (!text) {
      index++
      continue
    }
    const definition = text.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*$/)
    if (definition) {
      const params = definition[2]
        .split(',')
        .map((param) => param.trim().split('=')[0].trim())
        .filter(Boolean)
      let bodyStart = index + 1
      while (bodyStart < lines.length && !lines[bodyStart].trim()) bodyStart++
      let body = []
      if (bodyStart < lines.length && countIndent(lines[bodyStart]) > level) {
        const parsed = parsePythonBlock(lines, index + 1, countIndent(lines[bodyStart]))
        body = parsed.statements
        index = parsed.next
      } else {
        index++
      }
      statements.push({ type: 'define', name: definition[1], params, body, line })
      continue
    }
    if (/^(if|elif|else|for|while|class|import|from|try|except|finally|with|match|case|lambda|global|nonlocal)\b/.test(text)) {
      const keyword = text.split(/\s/)[0]
      throw new PreviewError(`"${keyword}" blocks are not supported in this browser preview yet.`, line)
    }
    const assignment = text.match(/^([A-Za-z_]\w*)\s*=(?!=)\s*(.+)$/)
    if (assignment) {
      statements.push({ type: 'assign', name: assignment[1], expr: assignment[2], line })
      index++
      continue
    }
    const returnStatement = text.match(/^return(?:\s+(.+))?$/)
    if (returnStatement) {
      statements.push({ type: 'return', expr: returnStatement[1] || null, line })
      index++
      continue
    }
    if (text === 'pass') {
      index++
      continue
    }
    statements.push({ type: 'expression', expr: text, line })
    index++
  }
  return { statements, next: index }
}

function runPython(code) {
  const lines = code.replace(/\r\n?/g, '\n').split('\n')
  const firstLine = lines.find((line) => stripPythonComment(line).trim())
  const rootIndent = firstLine ? countIndent(firstLine) : 0
  const { statements } = parsePythonBlock(lines, 0, rootIndent)
  const scope = Object.create(null)
  const runtime = createRuntime()
  executePython(statements, scope, runtime)
  return runtime.stdout
}

function evaluateAssignments(source, types, scope, runtime) {
  const pattern = new RegExp(
    `\\b(?:${types.join('|')})\\s+([A-Za-z_]\\w*)\\s*=\\s*([^;]+);`,
    'g',
  )
  for (const match of source.matchAll(pattern)) {
    try {
      scope[match[1]] = evaluateExpression(match[2], scope, runtime, lineAt(source, match.index))
    } catch {
      // Leave the name unset; a later output statement will report a useful error.
    }
  }
}

function runJava(code) {
  const source = stripCLikeComments(code)
  const runtime = createRuntime()
  const scope = Object.create(null)
  evaluateAssignments(source, ['String', 'int', 'double', 'float', 'long', 'boolean', 'char', 'var'], scope, runtime)

  const pattern = /System\s*\.\s*out\s*\.\s*(print|println|printf)\s*\(/g
  let match = pattern.exec(source)
  while (match) {
    const open = match.index + match[0].length - 1
    const close = findMatching(source, open)
    if (close === -1) throw new PreviewError('Missing a closing ")" in System.out.', lineAt(source, match.index))
    const line = lineAt(source, match.index)
    const args = splitTopLevel(source.slice(open + 1, close), ',').map((part) => part.trim())
    if (match[1] === 'printf') {
      runtime.stdout += formatPrintf(args, scope, runtime, line)
    } else {
      const value = args[0] && args[0] !== '' ? evaluateExpression(args[0], scope, runtime, line) : ''
      runtime.stdout += displayString(value) + (match[1] === 'println' ? '\n' : '')
    }
    pattern.lastIndex = close + 1
    match = pattern.exec(source)
  }
  return runtime.stdout
}

function formatPrintf(args, scope, runtime, line) {
  if (!args.length) return ''
  const format = String(evaluateExpression(args[0], scope, runtime, line))
  let index = 1
  return format.replace(/%([0-9]*\.?[0-9]*)?([sdfn])/g, (whole, width, type) => {
    if (type === 'n') return '\n'
    if (type === 's') return displayString(evaluateExpression(args[index++] || '""', scope, runtime, line))
    const value = ensureNumber(evaluateExpression(args[index++] || '0', scope, runtime, line), {
      error: (message) => new PreviewError(message, line),
    })
    const decimals = width && width.includes('.') ? Number(width.split('.')[1]) : 0
    return type === 'd' ? String(Math.trunc(value)) : value.toFixed(decimals)
  })
}

function runCpp(code) {
  const source = stripCLikeComments(code)
  const runtime = createRuntime()
  const scope = Object.create(null)
  evaluateAssignments(
    source,
    ['auto', 'int', 'double', 'float', 'long', 'char', 'bool', 'string', 'std\\s*::\\s*string'],
    scope,
    runtime,
  )

  const pattern = /(?:std\s*::\s*)?cout\s*<</g
  let match = pattern.exec(source)
  while (match) {
    const start = match.index + match[0].length
    let end = start
    let quote = null
    let depth = 0
    for (; end < source.length; end++) {
      const char = source[end]
      if (quote) {
        if (char === '\\') end++
        else if (char === quote) quote = null
        continue
      }
      if (char === '"' || char === "'") quote = char
      else if ('([{'.includes(char)) depth++
      else if (')]}'.includes(char)) depth--
      else if (char === ';' && depth === 0) break
    }
    if (end >= source.length) throw new PreviewError('Missing a ";" after cout.', lineAt(source, match.index))
    const line = lineAt(source, match.index)
    const parts = splitTopLevel(source.slice(start, end), '<<').map((part) => part.trim())
    for (const part of parts) {
      if (!part) continue
      if (['endl', 'std::endl', 'flush', 'std::flush'].includes(part)) {
        if (part.includes('endl')) runtime.stdout += '\n'
        continue
      }
      runtime.stdout += displayString(evaluateExpression(part, scope, runtime, line))
    }
    match.lastIndex = end + 1
    match = pattern.exec(source)
  }
  return runtime.stdout
}

function evaluateSqlValue(source, runtime, line) {
  const text = source.trim()
  if (!text) throw new PreviewError('The SELECT list contains an empty expression.', line)
  if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replace(/''/g, "'")
  if (/^null$/i.test(text)) return null
  if (/^true$/i.test(text)) return true
  if (/^false$/i.test(text)) return false
  return evaluateExpression(text, Object.create(null), runtime, line)
}

function renderTable(columns, values) {
  const widths = columns.map((column, index) =>
    Math.max(column.length, sqlString(values[index]).length),
  )
  const header = columns.map((column, index) => column.padEnd(widths[index])).join(' | ')
  const divider = widths.map((width) => '-'.repeat(width)).join('-+-')
  const row = values.map((value, index) => sqlString(value).padEnd(widths[index])).join(' | ')
  return `${header}\n${divider}\n${row}`
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
}

function runSql(code) {
  const source = stripSqlComments(code)
  const runtime = createRuntime()
  const statements = splitTopLevel(source, ';')
    .map((statement) => statement.trim())
    .filter(Boolean)
  if (!statements.length) return ''
  const tables = []
  for (const statement of statements) {
    const line = lineAt(source, source.indexOf(statement))
    if (!/^select\b/i.test(statement)) {
      throw new PreviewError('Only SELECT statements can be previewed here.', line)
    }
    const select = statement.replace(/^select\s+/i, '')
    if (findTopLevelKeyword(select, 'FROM') !== -1) {
      throw new PreviewError('This preview can only run SELECT statements without a FROM clause.', line)
    }
    const items = splitTopLevel(select, ',').map((item) => item.trim())
    const columns = []
    const values = []
    for (const item of items) {
      const alias = item.match(/^(.*?)\s+as\s+("?[\w]+"?)$/i)
      const expression = alias ? alias[1].trim() : item
      const name = alias ? alias[2].replace(/"/g, '') : '?column?'
      columns.push(name)
      values.push(evaluateSqlValue(expression, runtime, line))
    }
    tables.push(renderTable(columns, values))
  }
  return tables.join('\n\n')
}

function runJavaScript(code) {
  return new Promise((resolve) => {
    const started = performance.now()
    const worker = new Worker(new URL('./playgroundWorker.js', import.meta.url), { type: 'module' })
    let settled = false

    const finish = (status, output) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      worker.terminate()
      resolve({
        status,
        output,
        simulated: false,
        durationMs: performance.now() - started,
      })
    }

    const timeout = setTimeout(() => {
      finish('error', 'Execution stopped after 3 seconds. Check for an infinite loop.')
    }, JS_TIMEOUT_MS)

    worker.onmessage = (event) => {
      finish(event.data.ok ? 'success' : 'error', event.data.output)
    }
    worker.onerror = (event) => {
      finish('error', event.message || 'The JavaScript worker could not start.')
    }
    worker.postMessage({ code })
  })
}

export async function runPlayground({ languageId, code }) {
  const trimmed = (code || '').trim()
  if (!trimmed) {
    return {
      status: 'error',
      output: 'Nothing to run yet — write a line of code first.',
      simulated: false,
      durationMs: 0,
    }
  }

  if (languageId === 'javascript') return runJavaScript(code)

  const runners = {
    python: runPython,
    java: runJava,
    cpp: runCpp,
    sql: runSql,
  }
  const runner = runners[languageId]
  if (!runner) {
    return {
      status: 'error',
      output: 'This language is not supported yet.',
      simulated: true,
      durationMs: 0,
    }
  }

  const started = performance.now()
  await wait(PREVIEW_DELAY_MS)
  try {
    return {
      status: 'success',
      output: runner(code),
      simulated: true,
      durationMs: performance.now() - started,
    }
  } catch (error) {
    return {
      status: 'error',
      output: error instanceof Error ? error.message : 'The preview could not run this code.',
      simulated: true,
      durationMs: performance.now() - started,
    }
  }
}
