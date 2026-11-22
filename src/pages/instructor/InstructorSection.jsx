import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useStore } from '../../store/store'
import {
  activitiesForSection,
  activityCounts,
  sectionById,
  sectionCounts,
  studentsInSection,
  subjectById,
  submissionFor,
} from '../../lib/selectors'
import { dueLabel, isOverdue } from '../../lib/format'
import { Avatar, Badge, Blink, Button, Card, EmptyState, Field, Input, ProgressBar, Select, Stat, buttonStyles, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

export default function InstructorSection() {
  const { sectionId } = useParams()
  const { db, inviteStudentToSection, removeStudentFromSection } = useStore()
  const location = useLocation()
  const [subjectFilter, setSubjectFilter] = useState('all')

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteSubject, setInviteSubject] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const section = sectionById(db, sectionId)
  const created = location.state?.created

  if (!section) {
    return (
      <EmptyState
        title="Section not found"
        description="That section does not exist."
        action={
          <Link to="/instructor" className="text-sm font-semibold text-indigo-600">
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const activities = activitiesForSection(db, section.id)
  const students = studentsInSection(db, section.id)
  const counts = sectionCounts(db, section.id)
  const visible = subjectFilter === 'all' ? activities : activities.filter((a) => a.subjectId === subjectFilter)

  const createLink = `/instructor/activity/new?sectionId=${section.id}${
    subjectFilter !== 'all' ? `&subjectId=${subjectFilter}` : ''
  }`

  const handleInviteSubmit = (e) => {
    e.preventDefault()
    setInviteError('')

    const cleanEmail = inviteEmail.trim().toLowerCase()
    if (!cleanEmail) {
      setInviteError('Please enter a student email address.')
      return
    }

    const existingStudent = students.find((s) => s.email.toLowerCase() === cleanEmail)
    if (existingStudent) {
      setInviteError('This student is already enrolled in this section.')
      return
    }

    const invitedUser = inviteStudentToSection({
      email: cleanEmail,
      name: inviteName,
      sectionId: section.id,
      subjectId: inviteSubject || null,
    })

    const subjectObj = inviteSubject ? subjectById(db, inviteSubject) : null
    const subjectInfo = subjectObj ? ` for ${subjectObj.code}` : ''
    setInviteSuccess(`Invited ${invitedUser.name} (${invitedUser.email}) to ${section.code}${subjectInfo}!`)
    setInviteEmail('')
    setInviteName('')
    setInviteSubject('')
    setShowInviteModal(false)
  }

  const handleRemoveStudent = (student) => {
    if (window.confirm(`Remove ${student.name} from section ${section.code}?`)) {
      removeStudentFromSection(student.id)
      setInviteSuccess(`${student.name} was removed from ${section.code}.`)
    }
  }

  return (
    <div>
      <Link
        to="/instructor"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        All sections
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-12 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              {section.code}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{section.name}</p>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Section workspace</h1>
          <p className="mt-1 text-sm text-slate-500">
            {section.schedule} · {section.room}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setShowInviteModal(true)}>
            <Icon name="mail" className="h-4 w-4" />
            Invite student
          </Button>
          <Link to={createLink} className={buttonStyles('primary', 'md')}>
            <Icon name="plus" className="h-4 w-4" />
            Create activity
          </Link>
        </div>
      </header>

      {inviteSuccess && (
        <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
              <Icon name="check" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">{inviteSuccess}</p>
              <p className="mt-0.5 text-xs text-emerald-700">
                The student can now access activities and submit solutions for this section.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInviteSuccess('')}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}

      {created > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Activity published to {created} section{created === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">Students will now see it in their to-do list.</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Students" value={counts.students} tone="sky" icon={<Icon name="users" className="h-5 w-5" />} />
        <Stat label="Activities" value={counts.activities} tone="indigo" icon={<Icon name="code" className="h-5 w-5" />} />
        <Stat label="To grade" value={counts.pending} tone="amber" icon={<Icon name="clipboard" className="h-5 w-5" />} />
        <Stat label="Graded" value={counts.graded} tone="emerald" icon={<Icon name="check" className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSubjectFilter('all')}
              className={cx(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                subjectFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              All subjects
              <span className="ml-1 opacity-60">{activities.length}</span>
            </button>
            {db.subjects.map((subject) => {
              const count = activities.filter((a) => a.subjectId === subject.id).length
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSubjectFilter(subject.id)}
                  className={cx(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    subjectFilter === subject.id
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {subject.code}
                  <span className="ml-1 opacity-60">{count}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 space-y-2">
            {visible.length === 0 ? (
              <EmptyState
                title="No activities here yet"
                description="Create an activity for this subject and it will appear in your students' to-do lists."
                action={
                  <Link to={createLink} className={buttonStyles('primary', 'sm')}>
                    <Icon name="plus" className="h-4 w-4" />
                    Create activity
                  </Link>
                }
              />
            ) : (
              visible.map((activity) => {
                const subject = subjectById(db, activity.subjectId)
                const stats = activityCounts(db, activity)
                const overdue = isOverdue(activity.dueDate)
                return (
                  <Link
                    key={activity.id}
                    to={`/instructor/activity/${activity.id}`}
                    className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-[10px] font-bold text-slate-500">
                        {subject?.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 transition group-hover:text-indigo-700">
                            {activity.title}
                          </p>
                          {stats.pending > 0 && <Badge tone="amber">{stats.pending} to grade</Badge>}
                          {activity.allowBlink ? (
                            <Badge tone="indigo">
                              <Blink variant="face" size={13} animated={false} className="mr-0.5 inline-block" />
                              BLINK
                            </Badge>
                          ) : (
                            <Badge tone="slate">No BLINK</Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className={cx('inline-flex items-center gap-1', overdue && 'font-semibold text-rose-600')}>
                            <Icon name="clock" className="h-3.5 w-3.5" />
                            {dueLabel(activity.dueDate)}
                          </span>
                          <span>{activity.points} pts</span>
                          <span>{activity.language}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <ProgressBar
                            value={stats.total ? (stats.submissions / stats.total) * 100 : 0}
                            className="max-w-[180px]"
                            tone={stats.submissions === stats.total ? 'emerald' : 'indigo'}
                          />
                          <span className="text-xs text-slate-500">
                            {stats.submissions}/{stats.total} submitted · {stats.graded} graded
                          </span>
                        </div>
                      </div>
                      <Icon name="chevronRight" className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        <div>
          <Card className="p-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Class roster</p>
                <p className="text-[11px] text-slate-400">
                  {students.length} student{students.length === 1 ? '' : 's'}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowInviteModal(true)}
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                Invite
              </Button>
            </div>

            <ul className="mt-4 space-y-3">
              {students.length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  <p>No students enrolled yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="mt-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Invite student
                  </button>
                </li>
              ) : (
                students.map((student) => {
                  const done = activities.filter((a) => submissionFor(db, a.id, student.id)).length
                  return (
                    <li key={student.id} className="group flex items-center justify-between gap-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={student.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
                          <p className="truncate text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">
                          {done}/{activities.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(student)}
                          title="Remove student from section"
                          className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-rose-600 group-hover:opacity-100"
                        >
                          <Icon name="x" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </Card>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setShowInviteModal(false)
              setInviteError('')
            }}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon name="mail" className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Invite to {section.code}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add a student by email to this section or subject.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteError('')
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            {inviteError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <Icon name="alert" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="mt-5 space-y-4">
              <Field
                label="Student email address"
                htmlFor="invite-email"
                hint="Enrolls existing students or creates their invitation"
              >
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="student@example.edu"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value)
                    if (inviteError) setInviteError('')
                  }}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Student full name (optional)" htmlFor="invite-name">
                <Input
                  id="invite-name"
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </Field>

              <Field
                label="Subject focus (optional)"
                htmlFor="invite-subject"
                hint="Assign to a specific subject module or all subjects"
              >
                <Select
                  id="invite-subject"
                  value={inviteSubject}
                  onChange={(e) => setInviteSubject(e.target.value)}
                >
                  <option value="">All section subjects</option>
                  {db.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} — {sub.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Target section:</span> {section.code} · {section.name} ({section.schedule})
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteError('')
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Icon name="send" className="h-4 w-4" />
                  Send invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
