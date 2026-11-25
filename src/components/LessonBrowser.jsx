import { useState } from 'react'
import { Badge, Button, Card, EmptyState, cx } from './ui'
import { Icon } from './icons'

export default function LessonBrowser({
  lessons,
  language,
  aside,
  reviewMode = false,
  customizations = {},
  lessonPanel,
  emptyTitle = 'No lessons here yet',
  emptyDescription = '',
  emptyAction,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const lesson = lessons[activeIndex] || lessons[0]
  const lessonAnswers = lesson ? answers[lesson.id] || {} : {}
  const customization = lesson ? customizations[lesson.id] : null

  const chooseAnswer = (questionIndex, optionIndex) => {
    if (reviewMode || lessonAnswers[questionIndex] != null) return
    setAnswers((prev) => ({
      ...prev,
      [lesson.id]: { ...(prev[lesson.id] || {}), [questionIndex]: optionIndex },
    }))
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <Card className="p-3">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Lessons
          </p>
          {lessons.length === 0 ? (
            <p className="px-2 pb-2 text-xs leading-relaxed text-slate-400">
              No sample lessons for this language yet.
            </p>
          ) : (
            <div className="space-y-1">
              {lessons.map((item, index) => {
                const active = item.id === lesson?.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-current={active ? 'true' : undefined}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200',
                      active ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span
                      className={cx(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold',
                        active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.title}</span>
                      <span className={cx('block text-[11px]', active ? 'text-indigo-500' : 'text-slate-400')}>
                        {item.minutes} min · {item.quiz.length} quiz questions
                      </span>
                    </span>
                    {customizations[item.id] && (
                      <span className="shrink-0 text-indigo-500" title="Instructor focus applied">
                        <Icon name="sparkles" className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {aside}
      </aside>

      <div className="space-y-4">
        {!lesson ? (
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        ) : (
          <>
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="indigo">Lesson {activeIndex + 1}</Badge>
                <span className="text-xs text-slate-400">{lesson.minutes} min read</span>
              </div>
              <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">{lesson.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{lesson.summary}</p>

              <div className="mt-4 rounded-xl bg-indigo-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">What you'll learn</p>
                <ul className="mt-2 space-y-1.5">
                  {lesson.objectives.map((objective) => (
                    <li key={objective} className="flex items-start gap-2 text-sm text-indigo-900/80">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              {customization && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-700">
                    <Icon name="sparkles" className="h-3.5 w-3.5" />
                    Instructor focus
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-indigo-900/80">{customization.note}</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {lesson.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2.5">
                  <span className="font-mono text-xs text-slate-400">{lesson.example.file}</span>
                  <span className="rounded-md bg-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    {language}
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-100">
                  <code>{lesson.example.code}</code>
                </pre>
              </div>

              <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
                <span className="font-semibold">Tip:</span> {lesson.tip}
              </p>
            </Card>

            {lessonPanel && lessonPanel(lesson)}

            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {reviewMode ? 'Quiz answer key' : 'Sample quiz'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {reviewMode
                      ? 'Review the questions and correct answers before publishing.'
                      : 'Pick an answer to check yourself. Not graded.'}
                  </p>
                </div>
                <Badge tone="amber">{lesson.quiz.length} questions</Badge>
              </div>

              <div className="mt-4 space-y-4">
                {lesson.quiz.map((item, questionIndex) => {
                  const selected = lessonAnswers[questionIndex]
                  const answered = selected != null
                  const revealed = reviewMode || answered
                  return (
                    <div key={item.question} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {questionIndex + 1}. {item.question}
                      </p>
                      {item.code && (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-[12px] leading-relaxed text-slate-100">
                          <code>{item.code}</code>
                        </pre>
                      )}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {item.options.map((option, optionIndex) => {
                          const isCorrect = item.answer === optionIndex
                          const isSelected = selected === optionIndex
                          const showCorrect = revealed && isCorrect
                          const showWrong = !reviewMode && answered && isSelected && !isCorrect
                          return (
                            <button
                              key={option}
                              type="button"
                              disabled={revealed}
                              onClick={() => chooseAnswer(questionIndex, optionIndex)}
                              className={cx(
                                'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200',
                                !revealed
                                  ? 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60'
                                  : showCorrect
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                    : showWrong
                                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                                      : 'border-slate-200 bg-white text-slate-400',
                              )}
                            >
                              <span
                                className={cx(
                                  'grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold',
                                  !revealed
                                    ? 'bg-slate-100 text-slate-500'
                                    : showCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : showWrong
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-100 text-slate-400',
                                )}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="flex-1">{option}</span>
                              {showCorrect && <Icon name="check" className="h-4 w-4 shrink-0" />}
                              {showWrong && <Icon name="x" className="h-4 w-4 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                      {revealed && (
                        <p
                          className={cx(
                            'mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed',
                            reviewMode || selected === item.answer
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800',
                          )}
                        >
                          <span className="font-semibold">
                            {reviewMode
                              ? 'Answer. '
                              : selected === item.answer
                                ? 'Correct. '
                                : 'Not quite. '}
                          </span>
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                disabled={activeIndex === 0}
              >
                <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveIndex((index) => Math.min(lessons.length - 1, index + 1))}
                disabled={activeIndex === lessons.length - 1}
              >
                Next lesson
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
