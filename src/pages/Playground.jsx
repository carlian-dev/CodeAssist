import { useRef, useState } from 'react'
import { Badge, Button, cx } from '../components/ui'
import { Icon } from '../components/icons'
import { runPlayground } from '../lib/playground'

const LANGUAGES = [
  {
    id: 'python',
    label: 'Python',
    file: 'playground.py',
    starter: `# Free space — write anything you like
def greet(name):
    return f"Hello, {name}!"

print(greet("world"))
`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    file: 'playground.js',
    starter: `// Free space — write anything you like
function greet(name) {
  return \`Hello, \${name}!\`
}

console.log(greet('world'))
`,
  },
  {
    id: 'java',
    label: 'Java',
    file: 'Playground.java',
    starter: `// Free space — write anything you like
public class Playground {
  public static void main(String[] args) {
    System.out.println("Hello, world!");
  }
}
`,
  },
  {
    id: 'cpp',
    label: 'C++',
    file: 'playground.cpp',
    starter: `// Free space — write anything you like
#include <iostream>

int main() {
  std::cout << "Hello, world!" << '\\n';
  return 0;
}
`,
  },
  {
    id: 'sql',
    label: 'SQL',
    file: 'playground.sql',
    starter: `-- Free space — write anything you like
SELECT 'Hello, world!' AS greeting;
`,
  },
]

const starterDrafts = () =>
  Object.fromEntries(LANGUAGES.map((language) => [language.id, language.starter]))

function formatDuration(ms) {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

const STATUS_COPY = {
  success: 'Success',
  error: 'Error',
}

export default function Playground() {
  const [languageId, setLanguageId] = useState(LANGUAGES[0].id)
  const [drafts, setDrafts] = useState(starterDrafts)
  const [result, setResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const runId = useRef(0)

  const language = LANGUAGES.find((item) => item.id === languageId) || LANGUAGES[0]
  const code = drafts[language.id]
  const lineCount = code.split('\n').length
  const isStale = result && result.code !== code

  const updateCode = (value) => {
    setDrafts((current) => ({ ...current, [language.id]: value }))
  }

  const resetCode = () => {
    updateCode(language.starter)
  }

  const selectLanguage = (id) => {
    if (id === language.id) return
    runId.current += 1
    setIsRunning(false)
    setResult(null)
    setLanguageId(id)
  }

  const runCode = async () => {
    if (isRunning) return
    const id = ++runId.current
    const snapshot = { code }
    setIsRunning(true)
    let next
    try {
      next = await runPlayground({ languageId: language.id, code })
    } catch (error) {
      next = {
        status: 'error',
        output: error instanceof Error ? error.message : 'The code could not run.',
        simulated: false,
        durationMs: 0,
      }
    }
    if (id !== runId.current) return
    setIsRunning(false)
    setResult({ ...next, ...snapshot })
  }

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      runCode()
    }
  }

  const status = isRunning ? 'running' : result ? result.status : 'idle'

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Playground</p>
          <Badge tone="indigo">No rules</Badge>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Free code playground</h1>
        <p className="mt-1 text-sm text-slate-500">
          A scratchpad to experiment in any language. Nothing here is graded or submitted, so write whatever you
          want.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
        <div className="flex flex-col gap-2.5 border-b border-slate-700 bg-slate-800 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-xs text-slate-400">{language.file}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {LANGUAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLanguage(item.id)}
                aria-pressed={item.id === language.id}
                className={cx(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                  item.id === language.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={code}
          onChange={(event) => updateCode(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={`${language.label} playground code`}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          placeholder={`Write some ${language.label} here...`}
          className="block min-h-[320px] w-full resize-y bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none placeholder:text-slate-500 sm:min-h-[360px] lg:min-h-[400px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 bg-slate-800 px-4 py-3">
          <span className="text-xs text-slate-400">{lineCount} lines</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={resetCode}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 underline-offset-2 transition hover:text-indigo-300 hover:underline"
            >
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Reset starter
            </button>
            <Button
              type="button"
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              title="Run code (Ctrl+Enter)"
              aria-keyshortcuts="Control+Enter Meta+Enter"
            >
              <Icon
                name={isRunning ? 'refresh' : 'play'}
                className={cx('h-3.5 w-3.5', isRunning && 'animate-spin')}
              />
              {isRunning ? 'Running…' : 'Run'}
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-700">
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 px-4 py-2.5">
            <Icon name="terminal" className="h-4 w-4 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Output</span>
            <span
              className={cx(
                'h-1.5 w-1.5 rounded-full',
                status === 'running' && 'animate-pulse bg-sky-400',
                status === 'success' && 'bg-emerald-400',
                status === 'error' && 'bg-rose-400',
                status === 'idle' && 'bg-slate-600',
              )}
            />
            <span className="text-[11px] font-medium text-slate-400">
              {status === 'running'
                ? 'Running'
                : status === 'idle'
                  ? 'Ready'
                  : STATUS_COPY[status]}
            </span>
            {result?.simulated && (
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300 ring-1 ring-inset ring-amber-400/30">
                Preview
              </span>
            )}
            <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
              {isStale && <span className="text-amber-400">Edited since run</span>}
              {result && (
                <span>
                  {language.label} · {formatDuration(result.durationMs)}
                </span>
              )}
              {result && (
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="font-semibold text-slate-400 underline-offset-2 transition hover:text-slate-200 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <pre
            aria-live="polite"
            aria-atomic="true"
            className={cx(
              'min-h-[96px] max-h-[320px] overflow-auto whitespace-pre-wrap break-words bg-slate-950 p-4 font-mono text-[13px] leading-relaxed',
              result?.status === 'error' ? 'text-rose-300' : 'text-slate-100',
            )}
          >
            {isRunning ? (
              <span className="text-slate-500">Running {language.file}…</span>
            ) : result ? (
              result.output ? (
                result.output
              ) : (
                <span className="text-slate-500">Program finished without printing anything.</span>
              )
            ) : (
              <span className="text-slate-500">Press Run to see the output here.</span>
            )}
          </pre>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        Each language keeps its own draft while you are on this page. JavaScript runs in a sandboxed worker;
        Python, Java, C++, and SQL show a local preview of their output. Press Ctrl+Enter to run.
      </p>
    </div>
  )
}
