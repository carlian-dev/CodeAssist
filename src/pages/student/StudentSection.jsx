import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useStore } from '../../store/store'
import {
  activitiesForSection,
  sectionById,
  studentsInSection,
  subjectById,
  submissionFor,
} from '../../lib/selectors'
import { dueLabel, isOverdue } from '../../lib/format'
import { Avatar, Badge, Blink, Card, EmptyState, ProgressBar, cx } from '../../components/ui'
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

export default function StudentSection() {
  const { sectionId } = useParams()
  const { user } = useAuth()
  const { db } = useStore()
  const [filter, setFilter] = useState('all')

  const section = sectionById(db, sectionId)

  if (!section || section.id !== user.sectionId) {
    return (
      <EmptyState
        title="Section not accessible"
        description={
          section
            ? 'You are not enrolled in this section.'
            : 'The requested section does not exist.'
        }
        action={
          <Link to="/student" className="text-sm font-semibold text-indigo-600">
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const subject = subjectById(db, section.subjectId)
  const instructor = db.users.find((u) => u.role === 'instructor')
  const classmates = studentsInSection(db, section.id)
  const activities = activitiesForSection(db, section.id)

  const rows = activities.map((activity) => ({
    activity,
    submission: submissionFor(db, activity.id, user.id),
  }))

  const completedCount = rows.filter((r) => Boolean(r.submission)).length
  const progressPercent = activities.length ? Math.round((completedCount / activities.length) * 100) : 0

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

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/student" className="font-medium hover:text-indigo-600 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{section.code}</span>
      </div>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-14 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
              {section.code}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {section.name}
              </p>
              {subject && (
                <p className="text-sm font-semibold text-slate-700">
                  {subject.code} · {subject.name}
                </p>
              )}
            </div>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {subject?.name || section.name}
          </h1>
          {subject?.blurb && (
            <p className="mt-1 text-sm text-slate-500">{subject.blurb}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="indigo">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            {section.schedule}
          </Badge>
          <Badge tone="slate">
            <Icon name="home" className="h-3.5 w-3.5" />
            {section.room}
          </Badge>
          {instructor && (
            <Badge tone="sky">
              <Icon name="user" className="h-3.5 w-3.5" />
              {instructor.name}
            </Badge>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main: Section Activities */}
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your section progress</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {completedCount} of {activities.length} activities completed ({progressPercent}%)
                </p>
              </div>
              <div className="w-36">
                <ProgressBar value={progressPercent} tone="indigo" />
              </div>
            </div>
          </Card>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Section Activities</h2>
                <p className="text-xs text-slate-500">
                  All assignments and practice problems assigned to {section.code}
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
                      filter === option.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {visible.length === 0 ? (
                <EmptyState
                  title={filter === 'todo' ? 'Nothing left to do' : 'No activities here'}
                  description={
                    filter === 'todo'
                      ? 'You have submitted all activities in this section!'
                      : 'No activities found matching this filter.'
                  }
                />
              ) : (
                visible.map(({ activity, submission }) => {
                  const status = statusFor(submission)
                  const overdue = !submission && isOverdue(activity.dueDate)
                  return (
                    <Link
                      key={activity.id}
                      to={`/student/activity/${activity.id}`}
                      className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {activity.language}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-indigo-700">
                          {activity.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className={cx('inline-flex items-center gap-1', overdue && 'font-semibold text-rose-600')}>
                            <Icon name="clock" className="h-3.5 w-3.5" />
                            {submission ? 'Turned in' : dueLabel(activity.dueDate)}
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
        </div>

        {/* Sidebar: Classmates & Section Details */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Class Details</p>
              <Badge tone="indigo">{section.code}</Badge>
            </div>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Course</dt>
                <dd className="font-medium text-slate-800">{subject?.name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Schedule</dt>
                <dd className="font-medium text-slate-800">{section.schedule}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Room</dt>
                <dd className="font-medium text-slate-800">{section.room}</dd>
              </div>
              {instructor && (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Instructor</dt>
                  <dd className="font-medium text-slate-800">{instructor.name}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Total Enrolled</dt>
                <dd className="font-medium text-slate-800">{classmates.length} students</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Classmates</p>
                <p className="text-xs text-slate-400">{classmates.length} enrolled in this section</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                {classmates.length}
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {instructor && (
                <div className="flex items-center gap-3 py-2.5">
                  <Avatar name={instructor.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">{instructor.name}</p>
                    <p className="text-[11px] text-indigo-600 font-medium">Instructor</p>
                  </div>
                </div>
              )}
              {classmates.map((student) => {
                const isMe = student.id === user.id
                return (
                  <div key={student.id} className="flex items-center gap-3 py-2.5">
                    <Avatar name={student.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {student.name} {isMe && <span className="font-normal text-indigo-600">(You)</span>}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">{student.email}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
