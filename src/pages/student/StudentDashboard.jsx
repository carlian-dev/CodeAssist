import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useStore } from '../../store/store'
import { activitiesForSection, sectionById, studentSummary, subjectById, subjectProgress, submissionFor } from '../../lib/selectors'
import { dueLabel, isOverdue } from '../../lib/format'
import { Badge, Blink, EmptyState, ProgressBar, Stat, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'graded', label: 'Graded' },
]

function statusFor(submission) {
  if (!submission) return { label: 'To do', tone: 'slate' }
  if (submission.status === 'graded') {
    return { label: submission.grade != null ? `Graded ${submission.grade}` : 'Graded', tone: 'emerald' }
  }
  return { label: 'Submitted', tone: 'sky' }
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { db } = useStore()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('all')

  const activeSubject = params.get('subject')
  const section = user.sectionId ? sectionById(db, user.sectionId) : null
  const summary = studentSummary(db, user)
  const activities = user.sectionId ? activitiesForSection(db, user.sectionId) : []

  const rows = activities
    .filter((activity) => !activeSubject || activity.subjectId === activeSubject)
    .map((activity) => ({ activity, submission: submissionFor(db, activity.id, user.id) }))

  const visible = rows
    .filter(({ submission }) => {
      if (filter === 'todo') return !submission
      if (filter === 'submitted') return submission?.status === 'submitted'
      if (filter === 'graded') return submission?.status === 'graded'
      return true
    })
    .sort((a, b) => {
      const aDone = a.submission ? 1 : 0
      const bDone = b.submission ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      return new Date(a.activity.dueDate) - new Date(b.activity.dueDate)
    })

  const toggleSubject = (id) => {
    if (activeSubject === id) setParams({})
    else setParams({ subject: id })
  }

  const firstName = user.name.split(' ')[0]

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {section ? `${section.code} · ${section.name}` : 'Awaiting Section Invitation'}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Hi, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {section
              ? 'Here is what is on your plate today.'
              : 'Your instructor will invite you to your class section soon.'}
          </p>
        </div>
        {section ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">
              <Icon name="calendar" className="h-3.5 w-3.5" />
              {section.schedule}
            </Badge>
            <Badge tone="slate">{section.room}</Badge>
          </div>
        ) : (
          <Badge tone="amber">Pending invitation</Badge>
        )}
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="To do"
          value={summary.toDo}
          hint="Activities not submitted yet"
          tone="amber"
          icon={<Icon name="clipboard" className="h-5 w-5" />}
        />
        <Stat
          label="Submitted"
          value={summary.submitted}
          hint="Waiting for your instructor"
          tone="sky"
          icon={<Icon name="send" className="h-5 w-5" />}
        />
        <Stat
          label="Graded"
          value={summary.graded}
          hint="Returned with feedback"
          tone="emerald"
          icon={<Icon name="check" className="h-5 w-5" />}
        />
        <Stat
          label="Average"
          value={summary.average != null ? `${summary.average}%` : '—'}
          hint={summary.graded ? `Across ${summary.graded} graded activities` : 'No grades yet'}
          tone="indigo"
          icon={<Icon name="star" className="h-5 w-5" />}
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Subjects</h2>
          {activeSubject && (
            <button
              type="button"
              onClick={() => setParams({})}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {db.subjects.map((subject) => {
            const progress = subjectProgress(db, user, subject.id)
            const active = activeSubject === subject.id
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className={cx(
                  'rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                  active ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">{subject.code}</span>
                    <p className="text-sm font-semibold text-slate-800">{subject.name}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-400">
                    {progress.done}/{progress.total}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{subject.blurb}</p>
                <ProgressBar
                  className="mt-3"
                  value={progress.percent}
                  tone={progress.total && progress.percent === 100 ? 'emerald' : 'indigo'}
                />
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Activities</h2>
            <p className="text-sm text-slate-500">
              {activeSubject ? subjectById(db, activeSubject)?.name : 'All subjects in your section'}
            </p>
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={cx(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  filter === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {!section ? (
            <EmptyState
              title="No section assigned yet"
              description="Your instructor will invite you to your section. When added, your activities, schedule, and grades will appear here."
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title={filter === 'todo' ? 'Nothing left to do' : 'No activities here yet'}
              description={
                filter === 'todo'
                  ? 'You have submitted everything for this filter. Nice work.'
                  : 'Your instructor has not posted an activity for this filter yet.'
              }
            />
          ) : (
            visible.map(({ activity, submission }) => {
              const subject = subjectById(db, activity.subjectId)
              const status = statusFor(submission)
              const overdue = !submission && isOverdue(activity.dueDate)
              return (
                <Link
                  key={activity.id}
                  to={`/student/activity/${activity.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-50 text-[10px] font-bold text-slate-500">
                    {subject?.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-indigo-700">
                      {activity.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className={cx('inline-flex items-center gap-1', overdue && 'font-semibold text-rose-600')}>
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        {submission ? 'Submitted' : dueLabel(activity.dueDate)}
                      </span>
                      <span>{activity.points} pts</span>
                      <span
                        className={cx(
                          'inline-flex items-center gap-1.5',
                          activity.allowBlink ? 'text-indigo-600' : 'text-slate-400',
                        )}
                      >
                        {activity.allowBlink ? (
                          <Blink variant="face" size={14} animated={false} className="inline-block" />
                        ) : (
                          <Icon name="sparkles" className="h-3.5 w-3.5" />
                        )}
                        {activity.allowBlink ? 'BLINK on' : 'BLINK off'}
                      </span>
                    </div>
                  </div>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <Icon name="chevronRight" className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
                </Link>
              )
            })
          )}
        </div>
      </section>

      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/60 p-4 shadow-sm">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 shadow-md">
          <Blink variant="face" size={34} animated />
        </span>
        <div>
          <p className="text-sm font-semibold text-indigo-900">BLINK is your after-submission study buddy</p>
          <p className="mt-0.5 text-xs leading-relaxed text-indigo-700/80">
            Finish an activity, then open it again to ask BLINK where you went wrong and what to review next. Some
            activities have BLINK turned off by your instructor.
          </p>
        </div>
      </div>
    </div>
  )
}
