function format(value) {
  if (typeof value === 'string') return value
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return value.toString()
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value)
      if (json !== undefined) return json
    } catch {
      // Fall back to the default string conversion below.
    }
  }
  return String(value)
}

self.onmessage = (event) => {
  const logs = []
  const write = (...args) => {
    logs.push(args.map(format).join(' '))
  }
  const consoleShim = {
    log: write,
    info: write,
    warn: write,
    error: write,
    debug: write,
  }

  try {
    const run = new Function('console', 'print', 'alert', event.data.code)
    run(consoleShim, write, write)
    self.postMessage({ ok: true, output: logs.join('\n') })
  } catch (error) {
    const name = error?.name || 'Error'
    const message = error?.message || String(error)
    if (logs.length) logs.push('')
    logs.push(`${name}: ${message}`)
    self.postMessage({ ok: false, output: logs.join('\n') })
  }
}
