import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/store'
import {
  activityCounts,
  sectionById,
  studentsInSection,
  subjectById,
  submissionsForActivity,
  userById,
} from '../../lib/selectors'
import { dueLabel, formatDateTime, isOverdue, timeAgo } from '../../lib/format'
import { instructorFeedback, analyzeSubmissions } from '../../lib/blink'
import { runTestCases } from '../../lib/judge'
import { Avatar, Badge, Blink, Button, Card, EmptyState, Field, Input, ProgressBar, Stat, Textarea, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

function SubmissionCard({ submission, student, activity, onGrade }) {
  const [grade, setGrade] = useState(submission.grade ?? '')
  const [feedback, setFeedback] = useState(submission.feedback || '')
  const [suggesting, setSuggesting] = useState(false)
  const [saved, setSaved] = useState(false)

  const lineCount = submission.code.split('\n').length
  const graded = submission.status === 'graded'
  const testResults = runTestCases(activity.testCases, submission.code)
  const passedCount = testResults.filter((result) => result.passed).length

  const handleSave = () => {
    onGrade({ submissionId: submission.id, grade, feedback })
    setSaved(true)
  }

  const handleSuggest = async () => {
    setSuggesting(true)
    const suggestion = await instructorFeedback({
      activity,
      submission: { ...submission, grade: grade === '' ? null : Number(grade) },
    })
    setFeedback(suggestion)
    setSaved(false)
    setSuggesting(false)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Avatar name={student.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
          <p className="text-xs text-slate-500">
            Submitted {timeAgo(submission.submittedAt)} · {formatDateTime(submission.submittedAt)}
          </p>
        </div>
        <Badge tone={graded ? 'emerald' : 'sky'}>
          {graded ? `Graded${submission.grade != null ? ` · ${submission.grade}` : ''}` : 'To grade'}
        </Badge>
      </div>

      <div className="space-y-3 p-4">
        <div className="overflow-hidden rounded-xl bg-slate-900">
          <div className="flex items-center justify-between px-3 pt-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{activity.language}</span>
            <span className="text-[10px] text-slate-500">{lineCount} lines</span>
          </div>
          <pre className="scrollbar-thin max-h-64 overflow-auto px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-slate-100">
            {submission.code}
          </pre>
        </div>

        {testResults.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Test cases</p>
              <Badge
                tone={
                  passedCount === testResults.length ? 'emerald' : passedCount === 0 ? 'rose' : 'amber'
                }
              >
                {passedCount}/{testResults.length} passed
              </Badge>
            </div>
            <ul className="divide-y divide-slate-100">
              {testResults.map((result, index) => (
                <li key={index} className="px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Test {index + 1}
                      {result.type === 'code' ? ` · ${result.label}` : ''}
                    </span>
                    <Badge tone={result.passed ? 'emerald' : 'rose'}>
                      <Icon name={result.passed ? 'check' : 'x'} className="h-3 w-3" />
                      {result.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                  {result.type === 'code' ? (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Checks the structure of the submitted code.
                    </p>
                  ) : (
                    <div className="mt-1.5 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <p className="font-semibold text-slate-500">Input</p>
                        <pre className="scrollbar-thin mt-0.5 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 px-2 py-1 font-mono text-[11.5px] text-slate-600">
                          {result.input || '(no input)'}
                        </pre>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-500">Expected output</p>
                        <pre className="scrollbar-thin mt-0.5 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 px-2 py-1 font-mono text-[11.5px] text-slate-600">
                          {result.expectedOutput || '(empty)'}
                        </pre>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
          <Field label="Grade" htmlFor={`grade-${submission.id}`}>
            <Input
              id={`grade-${submission.id}`}
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value)
                setSaved(false)
              }}
              placeholder="0–100"
            />
          </Field>
          <Field label="Feedback" htmlFor={`feedback-${submission.id}`}>
            <Textarea
              id={`feedback-${submission.id}`}
              rows={3}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value)
                setSaved(false)
              }}
              placeholder="Leave notes for the student..."
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" size="sm" onClick={handleSuggest} disabled={suggesting}>
            {suggesting ? (
              <Blink variant="face" size={16} mood="thinking" animated className="mr-0.5" />
            ) : (
              <Blink variant="face" size={16} animated={false} className="mr-0.5" />
            )}
            {suggesting ? 'Asking BLINK...' : 'BLINK suggestion'}
          </Button>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Icon name="check" className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
            <Button size="sm" onClick={handleSave} disabled={grade === ''}>
              Save grade
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function ActivityReview() {
  const { activityId } = useParams()
  const { db, gradeSubmission } = useStore()
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const activity = db.activities.find((a) => a.id === activityId)
  if (!activity) {
    return (
      <EmptyState
        title="Activity not found"
        description="This activity may have been removed."
        action={
          <Link to="/instructor" className="text-sm font-semibold text-indigo-600">
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const subject = subjectById(db, activity.subjectId)
  const section = sectionById(db, activity.sectionId)
  const submissions = submissionsForActivity(db, activity.id)
  const students = studentsInSection(db, activity.sectionId)
  const stats = activityCounts(db, activity)
  const missing = students.filter((s) => !submissions.some((sub) => sub.studentId === s.id))
  const overdue = isOverdue(activity.dueDate)

  const handleAnalyze = async () => {
    if (analyzing || submissions.length === 0) return
    setAnalyzing(true)
    const result = await analyzeSubmissions({ activity, submissions })
    setAnalysis(result)
    setAnalyzing(false)
  }

  return (
    <div>
      <Link
        to={`/instructor/section/${activity.sectionId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        Back to {section?.code}
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="indigo">{subject?.code}</Badge>
          <Badge tone="slate">{section?.code}</Badge>
          {activity.allowBlink ? (
            <Badge tone="indigo">
              <Blink variant="face" size={13} animated={false} className="mr-0.5 inline-block" />
              BLINK allowed
            </Badge>
          ) : (
            <Badge tone="slate">BLINK off</Badge>
          )}
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
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Submitted" value={stats.submissions} tone="sky" icon={<Icon name="send" className="h-5 w-5" />} />
        <Stat label="To grade" value={stats.pending} tone="amber" icon={<Icon name="clipboard" className="h-5 w-5" />} />
        <Stat label="Graded" value={stats.graded} tone="emerald" icon={<Icon name="check" className="h-5 w-5" />} />
        <Stat label="Not submitted" value={stats.missing} tone="rose" icon={<Icon name="user" className="h-5 w-5" />} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Icon name="book" className="h-4 w-4 text-slate-400" />
              Problem statement
            </span>
            <Icon
              name="chevronRight"
              className="h-4 w-4 text-slate-400 transition group-open:rotate-90"
            />
          </summary>
          <div className="space-y-3 border-t border-slate-100 px-4 py-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{activity.description}</p>
            <div className="rounded-xl bg-slate-50 p-3.5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Instructions</p>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {activity.instructions}
              </p>
            </div>
            {activity.starterCode && (
              <div className="overflow-hidden rounded-xl bg-slate-900 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Starter code</p>
                <pre className="scrollbar-thin mt-1.5 overflow-x-auto font-mono text-[12.5px] leading-relaxed text-slate-100">
                  {activity.starterCode}
                </pre>
              </div>
            )}
            {activity.testCases?.length > 0 && (
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Test cases</p>
                <ul className="mt-2 space-y-2">
                  {activity.testCases.map((testCase, index) =>
                    testCase.type === 'code' ? (
                      <li key={index} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-500">Test {index + 1} · Code check</span>
                        <span className="text-slate-700">{testCase.label}</span>
                      </li>
                    ) : (
                      <li key={index} className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-slate-500">Input</p>
                          <pre className="mt-0.5 whitespace-pre-wrap break-words font-mono text-[11.5px] text-slate-700">
                            {testCase.input || '(no input)'}
                          </pre>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500">Expected output</p>
                          <pre className="mt-0.5 whitespace-pre-wrap break-words font-mono text-[11.5px] text-slate-700">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </details>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Submissions</h2>
            <div className="flex items-center gap-2">
              <Badge tone="slate">{submissions.length}</Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAnalyze}
                disabled={analyzing || submissions.length === 0}
              >
                <Blink
                  variant="face"
                  size={16}
                  mood={analyzing ? 'thinking' : 'happy'}
                  animated={analyzing}
                  className="mr-0.5"
                />
                {analyzing ? 'BLINK is checking...' : 'BLINK check'}
              </Button>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Output-test results are simulated; code checks use pattern matching.
          </p>

          {analysis && (
            <Card className="mt-3 p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900">
                  <Blink variant="face" size={22} animated={false} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Student error analysis</p>
                  <p className="text-[11px] text-slate-500">
                    {analysis.analyzed} submission{analysis.analyzed === 1 ? '' : 's'} checked
                  </p>
                </div>
              </div>

              {analysis.categories.length > 0 && (
                <div className="mt-4 space-y-3">
                  {analysis.categories.map((category) => (
                    <div key={category.label}>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-700">{category.label}</span>
                        <span className="text-slate-500">
                          {category.count} occurrence{category.count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <ProgressBar value={category.percent} className="mt-1.5 h-2" />
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-[10px] text-slate-400">
                Illustrative prototype data, not actual assessment results.
              </p>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  AI-generated observation
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{analysis.observation}</p>
              </div>
            </Card>
          )}

          <div className="mt-3 space-y-3">
            {submissions.length === 0 ? (
              <EmptyState
                title="No submissions yet"
                description="Students in this section have not submitted this activity."
              />
            ) : (
              submissions.map((submission) => {
                const student = userById(db, submission.studentId)
                if (!student) return null
                return (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    student={student}
                    activity={activity}
                    onGrade={gradeSubmission}
                  />
                )
              })
            )}
          </div>
        </div>

        <div>
          <Card className="p-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Not submitted yet</p>
              <Badge tone={missing.length ? 'amber' : 'emerald'}>{missing.length}</Badge>
            </div>
            {missing.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Everyone in this section has submitted.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {missing.map((student) => (
                  <li key={student.id} className="flex items-center gap-2.5">
                    <Avatar name={student.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
                      <p className="text-[11px] text-slate-400">No submission yet</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
