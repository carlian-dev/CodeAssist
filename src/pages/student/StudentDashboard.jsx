import { Link } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useStore } from '../../store/store'
import {
  activitiesForSection,
  sectionById,
  studentSummary,
  subjectById,
  submissionFor,
} from '../../lib/selectors'
import { dueLabel, formatDateTime, isOverdue, timeAgo } from '../../lib/format'
import { Badge, Blink, Card, EmptyState, ProgressBar, Stat, buttonStyles, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

function statusFor(submission) {
  if (!submission) return { label: 'To do', tone: 'slate' }
  if (submission.status === 'graded') {
    return { label: submission.grade != null ? `Graded ${submission.grade}` : 'Graded', tone: 'emerald' }
  }
  return { label: 'Turned in', tone: 'sky' }
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { db } = useStore()

  const section = user.sectionId ? sectionById(db, user.sectionId) : null
  const subject = section ? subjectById(db, section.subjectId) : null
  const summary = studentSummary(db, user)
  const activities = user.sectionId ? activitiesForSection(db, user.sectionId) : []

  const rows = activities.map((activity) => ({
    activity,
    submission: submissionFor(db, activity.id, user.id),
  }))

  const todoList = rows
    .filter(({ submission }) => !submission)
    .sort((a, b) => new Date(a.activity.dueDate) - new Date(b.activity.dueDate))

  const submittedList = rows
    .filter(({ submission }) => Boolean(submission))
    .sort((a, b) => new Date(b.submission.submittedAt) - new Date(a.submission.submittedAt))

  const completedCount = submittedList.length
  const progressPercent = activities.length ? Math.round((completedCount / activities.length) * 100) : 0
  const firstName = user.name.split(' ')[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Student Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {section
              ? 'Here is an overview of your coursework, deadlines, and grades.'
              : 'Your instructor will invite you to your class section soon.'}
          </p>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="To do"
          value={summary.toDo}
          hint="Activities waiting for submission"
          tone="amber"
          icon={<Icon name="clipboard" className="h-5 w-5" />}
        />
        <Stat
          label="Turned in"
          value={summary.submitted}
          hint="Waiting for grading"
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

      {/* Enrolled Section Card */}
      {section ? (
        <Card className="relative overflow-hidden p-5 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="grid h-12 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
                {section.code}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Enrolled Class Section
                  </span>
                  <Badge tone="indigo">{section.room}</Badge>
                </div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  {section.name} · {subject?.code} ({subject?.name})
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Schedule: <span className="font-medium text-slate-700">{section.schedule}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold text-slate-800">
                  {completedCount} / {activities.length} completed
                </p>
                <div className="mt-1.5 w-28">
                  <ProgressBar value={progressPercent} tone="indigo" />
                </div>
              </div>
              <Link
                to={`/student/section/${section.id}`}
                className={buttonStyles('primary', 'sm')}
              >
                View Section & Classmates
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="Awaiting Section Invitation"
          description="Your instructor will assign you to your class section. Once added, your activities and section materials will appear here."
        />
      )}

      {/* Main Grid: Pending To-Do and Recent Submissions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Activities / To Do */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">Upcoming Activities</h2>
              <p className="text-xs text-slate-500">Assignments waiting to be turned in</p>
            </div>
            {section && todoList.length > 0 && (
              <Link
                to={`/student/section/${section.id}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all ({activities.length}) →
              </Link>
            )}
          </div>

          <div className="space-y-2.5">
            {!section ? (
              <Card className="p-6 text-center text-xs text-slate-400">
                No section enrolled yet.
              </Card>
            ) : todoList.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <Icon name="check" className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800">All caught up!</p>
                <p className="mt-1 text-xs text-slate-500">
                  You have submitted all currently assigned activities for your section.
                </p>
              </Card>
            ) : (
              todoList.map(({ activity }) => {
                const overdue = isOverdue(activity.dueDate)
                return (
                  <Link
                    key={activity.id}
                    to={`/student/activity/${activity.id}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {activity.language}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-indigo-700">
                          {activity.title}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className={cx(overdue && 'font-semibold text-rose-600')}>
                          {dueLabel(activity.dueDate)}
                        </span>
                        <span>·</span>
                        <span>{activity.points} pts</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                      Start <Icon name="arrowRight" className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                )
              })
            )}
          </div>
        </section>

        {/* Recent Submissions & Feedback */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">Recent Submissions</h2>
              <p className="text-xs text-slate-500">Turned-in work and instructor grades</p>
            </div>
            {section && submittedList.length > 0 && (
              <Link
                to={`/student/section/${section.id}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Section list →
              </Link>
            )}
          </div>

          <div className="space-y-2.5">
            {!section ? (
              <Card className="p-6 text-center text-xs text-slate-400">
                No submissions yet.
              </Card>
            ) : submittedList.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <Icon name="clipboard" className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-slate-800">No submissions yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  When you turn in an activity, your submission and instructor grade will show here.
                </p>
              </Card>
            ) : (
              submittedList.slice(0, 4).map(({ activity, submission }) => {
                const status = statusFor(submission)
                return (
                  <Link
                    key={activity.id}
                    to={`/student/activity/${activity.id}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-indigo-700">
                        {activity.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>Turned in {timeAgo(submission.submittedAt)}</span>
                        {submission.status === 'graded' && submission.feedback && (
                          <span className="hidden truncate text-slate-400 sm:inline">
                            · "{submission.feedback}"
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </Link>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* BLINK Assistant banner */}
      <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/60 p-4 shadow-xs">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 shadow-md">
          <Blink variant="face" size={34} animated />
        </span>
        <div>
          <p className="text-sm font-semibold text-indigo-900">BLINK is your study buddy after submission</p>
          <p className="mt-0.5 text-xs leading-relaxed text-indigo-700/80">
            Submit your solution on any activity, then review your code with BLINK to see what you can improve or study next.
          </p>
        </div>
      </div>
    </div>
  )
}
