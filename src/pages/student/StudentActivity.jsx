import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useStore } from '../../store/store'
import { sectionById, subjectById, submissionFor } from '../../lib/selectors'
import { dueLabel, formatDateTime, isOverdue, timeAgo } from '../../lib/format'
import { studentBlinkReply } from '../../lib/blink'
import { Badge, Blink, Button, Card, EmptyState, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

const SUGGESTIONS = ['Where did I go wrong?', 'What should I review next?', 'How can I improve my code?']

function BlinkBubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={cx('flex gap-2.5', isUser ? 'justify-end' : 'justify-start items-start')}>
      {!isUser && (
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-900 shadow-xs">
          <Blink variant="face" size={22} animated={false} />
        </span>
      )}
      <div
        className={cx(
          'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
          isUser
            ? 'rounded-br-md bg-indigo-600 text-white'
            : 'rounded-bl-md bg-slate-100 text-slate-700',
        )}
      >
        {text}
      </div>
    </div>
  )
}

export default function StudentActivity() {
  const { activityId } = useParams()
  const { user } = useAuth()
  const { db, submitActivity } = useStore()

  const activity = db.activities.find((a) => a.id === activityId)
  const submission = activity ? submissionFor(db, activity.id, user.id) : null
  const subject = activity ? subjectById(db, activity.subjectId) : null
  const section = activity ? sectionById(db, activity.sectionId) : null
  const firstName = user.name.split(' ')[0]

  const greeting = `Hi ${firstName}! I'm BLINK, your study buddy. You've submitted "${activity?.title || 'this activity'}", so let's review it together. Ask me where you went wrong or what to study next.`

  const [code, setCode] = useState(() => submission?.code || activity?.starterCode || '')
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [messages, setMessages] = useState(() => [{ role: 'assistant', text: greeting }])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    const current = submissionFor(db, activityId, user.id)
    const found = db.activities.find((a) => a.id === activityId)
    setCode(current?.code || found?.starterCode || '')
    setJustSubmitted(false)
    setMessages([
      {
        role: 'assistant',
        text: `Hi ${user.name.split(' ')[0]}! I'm BLINK, your study buddy. You've submitted "${found?.title || 'this activity'}", so let's review it together. Ask me where you went wrong or what to study next.`,
      },
    ])
    setDraft('')
    setThinking(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId])

  if (!activity || activity.sectionId !== user.sectionId) {
    return (
      <EmptyState
        title="Activity not found"
        description="This activity does not exist or is not part of your section."
        action={
          <Link to="/student" className="text-sm font-semibold text-indigo-600">
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const unlocked = Boolean(submission)
  const canUseBlink = unlocked && activity.allowBlink
  const overdue = !submission && isOverdue(activity.dueDate)
  const lineCount = code.split('\n').length

  const handleSubmit = () => {
    if (!code.trim()) return
    submitActivity({ activityId: activity.id, studentId: user.id, code })
    setJustSubmitted(true)
  }

  const askBlink = async (question) => {
    const q = (question ?? draft).trim()
    if (!q || thinking) return
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setDraft('')
    setThinking(true)
    const reply = await studentBlinkReply({
      activity,
      code: submission?.code ?? code,
      question: q,
      subject: subject?.name,
    })
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    setThinking(false)
  }

  const statusBadge = submission
    ? submission.status === 'graded'
      ? { label: submission.grade != null ? `Graded ${submission.grade}` : 'Graded', tone: 'emerald' }
      : { label: 'Submitted', tone: 'sky' }
    : { label: 'To do', tone: 'slate' }

  return (
    <div>
      <Link
        to="/student"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        Back to dashboard
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="indigo">{subject?.code}</Badge>
          <Badge tone="slate">{section?.code}</Badge>
          <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{activity.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className={cx('inline-flex items-center gap-1.5', overdue && 'font-semibold text-rose-600')}>
            <Icon name="calendar" className="h-4 w-4" />
            {dueLabel(activity.dueDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="star" className="h-4 w-4" />
            {activity.points} points
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="code" className="h-4 w-4" />
            {activity.language}
          </span>
          <span
            className={cx(
              'inline-flex items-center gap-1.5',
              activity.allowBlink ? 'text-indigo-600' : 'text-slate-400',
            )}
          >
            {activity.allowBlink ? (
              <Blink variant="face" size={14} animated={false} className="inline-block" />
            ) : (
              <Icon name="sparkles" className="h-4 w-4" />
            )}
            {activity.allowBlink ? 'BLINK allowed' : 'BLINK disabled'}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {justSubmitted && (
            <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="shrink-0">
                <Blink mood="celebrate" size={54} animated />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-900">Submission received! Great job!</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  {activity.allowBlink
                    ? 'BLINK is now unlocked. Ask for guidance on what to review.'
                    : 'Your instructor has BLINK turned off for this activity, so AI help stays locked.'}
                </p>
              </div>
            </div>
          )}

          {submission?.status === 'graded' && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Icon name="clipboard" className="h-4 w-4 text-slate-400" />
                  Instructor feedback
                </p>
                <span className="text-lg font-bold text-emerald-600">{submission.grade ?? '—'}</span>
              </div>
              <p className="whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-slate-600">
                {submission.feedback || 'No written feedback was provided.'}
              </p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">The problem</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{activity.description}</p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Instructions</p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {activity.instructions}
              </p>
            </div>
          </Card>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-xs text-slate-400">solution.py</span>
              </div>
              <span className="rounded-md bg-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                {activity.language}
              </span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="block min-h-[320px] w-full resize-y bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Write your solution here..."
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{lineCount} lines</span>
                <button
                  type="button"
                  onClick={() => setCode(activity.starterCode)}
                  className="font-semibold text-slate-400 underline-offset-2 transition hover:text-indigo-300 hover:underline"
                >
                  Reset to starter
                </button>
              </div>
              <div className="flex items-center gap-3">
                {submission && (
                  <span className="hidden text-[11px] text-slate-400 sm:block">Resubmitting replaces your previous work</span>
                )}
                <Button onClick={handleSubmit} disabled={!code.trim()}>
                  <Icon name="send" className="h-4 w-4" />
                  {submission ? 'Resubmit code' : 'Submit solution'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Activity details</p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Due</dt>
                <dd className={cx('font-medium', overdue ? 'text-rose-600' : 'text-slate-700')}>
                  {formatDateTime(activity.dueDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Points</dt>
                <dd className="font-medium text-slate-700">{activity.points}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">BLINK</dt>
                <dd>
                  <Badge tone={activity.allowBlink ? 'indigo' : 'slate'}>
                    {activity.allowBlink ? 'Allowed' : 'Disabled'}
                  </Badge>
                </dd>
              </div>
              {submission && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <dt className="text-slate-500">Submitted</dt>
                  <dd className="font-medium text-slate-700">{timeAgo(submission.submittedAt)}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-sky-50 px-4 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 shadow-sm">
                <Blink variant="face" size={24} animated />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">BLINK</p>
                <p className="text-[11px] text-slate-500">AI study buddy</p>
              </div>
              <Badge tone={canUseBlink ? 'emerald' : 'slate'}>
                {canUseBlink ? 'Unlocked' : 'Locked'}
              </Badge>
            </div>

            {!unlocked && (
              <div className="p-5 text-center">
                <div className="mx-auto mb-2 flex justify-center">
                  <Blink mood="happy" size={72} animated={false} className="opacity-75" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Submit first to unlock BLINK</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Finish and submit this activity, then BLINK can help you reflect on your solution.
                </p>
              </div>
            )}

            {unlocked && !activity.allowBlink && (
              <div className="p-5 text-center">
                <div className="mx-auto mb-2 flex justify-center">
                  <Blink mood="oops" size={72} animated={false} className="opacity-75" />
                </div>
                <p className="text-sm font-semibold text-slate-700">BLINK is turned off for this activity</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Your instructor disabled AI assistance on this problem. You can still review your submission and
                  feedback.
                </p>
              </div>
            )}

            {canUseBlink && (
              <div>
                <div className="scrollbar-thin max-h-80 space-y-2.5 overflow-y-auto p-3.5">
                  {messages.map((message, index) => (
                    <BlinkBubble key={index} role={message.role} text={message.text} />
                  ))}
                  {thinking && (
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-900 shadow-xs">
                        <Blink variant="face" mood="thinking" size={22} animated />
                      </span>
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500">
                        <span>Blink is thinking</span>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>

                {messages.length <= 1 && (
                  <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => askBlink(suggestion)}
                        className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    askBlink()
                  }}
                  className="flex items-center gap-2 border-t border-slate-100 p-2.5"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ask BLINK about your solution..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <Button type="submit" size="sm" disabled={!draft.trim() || thinking} className="shrink-0 px-3 py-2">
                    <Icon name="send" className="h-4 w-4" />
                  </Button>
                </form>
                <p className="px-3.5 pb-3 text-[10px] leading-relaxed text-slate-400">
                  BLINK gives hints and review topics — not full solutions.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
