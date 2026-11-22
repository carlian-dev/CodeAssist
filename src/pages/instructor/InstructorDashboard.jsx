import { Link } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useStore } from '../../store/store'
import { pendingSubmissions, sectionCounts } from '../../lib/selectors'
import { timeAgo } from '../../lib/format'
import { Avatar, Badge, Blink, Card, EmptyState, Stat, buttonStyles, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const { db } = useStore()

  const sectionIds = db.sections.map((s) => s.id)
  const pending = pendingSubmissions(db, sectionIds)
  const studentCount = db.users.filter((u) => u.role === 'student').length
  const activityMap = new Map(db.activities.map((a) => [a.id, a]))
  const userMap = new Map(db.users.map((u) => [u.id, u]))
  const sectionMap = new Map(db.sections.map((s) => [s.id, s]))
  const firstName = user.name.replace(/^Prof\.\s*/, '').split(' ')[0]

  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Instructor console</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            5 sections, {studentCount} students, and {pending.length} submission{pending.length === 1 ? '' : 's'} waiting
            for your review.
          </p>
        </div>
        <Link to="/instructor/activity/new" className={buttonStyles('primary', 'md')}>
          <Icon name="plus" className="h-4 w-4" />
          Create activity
        </Link>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Needs grading"
          value={pending.length}
          hint={pending.length ? 'Pending across all sections' : 'Inbox zero'}
          tone={pending.length ? 'amber' : 'emerald'}
          icon={<Icon name="clipboard" className="h-5 w-5" />}
        />
        <Stat
          label="Sections"
          value={db.sections.length}
          hint="T151 through T155"
          tone="indigo"
          icon={<Icon name="layers" className="h-5 w-5" />}
        />
        <Stat
          label="Students"
          value={studentCount}
          hint="Across all 5 sections"
          tone="sky"
          icon={<Icon name="user" className="h-5 w-5" />}
        />
        <Stat
          label="Activities"
          value={db.activities.length}
          hint="Active coding tasks"
          tone="violet"
          icon={<Icon name="code" className="h-5 w-5" />}
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Sections</h2>
            <p className="text-sm text-slate-500">Jump directly into a section to review or post activities</p>
          </div>
          <Badge tone="slate">5 active</Badge>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {db.sections.map((section) => {
            const counts = sectionCounts(db, section.id)
            return (
              <Link
                key={section.id}
                to={`/instructor/section/${section.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      {section.code}
                    </span>
                    {counts.pending > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        {counts.pending} to grade
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900 transition group-hover:text-indigo-600">
                    {section.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{section.schedule}</p>
                  <p className="text-xs text-slate-400">{section.room}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{counts.students} students</span>
                  <span>{counts.activities} activities</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Grading queue</h2>
            <p className="text-sm text-slate-500">Submissions waiting for your feedback</p>
          </div>
          <Badge tone={pending.length ? 'amber' : 'emerald'}>
            {pending.length ? `${pending.length} pending` : 'All caught up'}
          </Badge>
        </div>

        <Card className="mt-4 divide-y divide-slate-100 overflow-hidden">
          {pending.length === 0 ? (
            <EmptyState
              title="Grading queue empty"
              description="No submissions are waiting for review right now. All caught up!"
            />
          ) : (
            pending.slice(0, 8).map((submission) => {
              const activity = activityMap.get(submission.activityId)
              const student = userMap.get(submission.studentId)
              const section = student?.sectionId ? sectionMap.get(student.sectionId) : null
              return (
                <div
                  key={submission.id}
                  className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={student?.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{student?.name}</p>
                      <p className="text-xs text-slate-500">
                        {activity?.title} · <span className="font-medium text-slate-600">{section?.code}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Submitted {timeAgo(submission.submittedAt)}</span>
                    <Link
                      to={`/instructor/activity/${activity?.id}`}
                      className={buttonStyles('secondary', 'sm')}
                    >
                      Grade
                      <Icon name="arrowRight" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </Card>
      </section>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/60 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 shadow-sm">
            <Blink variant="face" size={28} animated />
          </span>
          <div>
            <p className="text-sm font-semibold text-indigo-900">Let BLINK draft your next problem</p>
            <p className="mt-0.5 text-xs leading-relaxed text-indigo-700/80">
              Give it your lesson or instructions, review the draft, then publish to one or more sections.
            </p>
          </div>
        </div>
        <Link to="/instructor/activity/new?sectionId=t151" className={cx(buttonStyles('secondary', 'sm'), 'shrink-0')}>
          Try it
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
