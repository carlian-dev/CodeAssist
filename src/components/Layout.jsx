import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useStore } from '../store/store'
import { Avatar, Blink, Logo, cx } from './ui'
import { Icon } from './icons'

function SidebarLink({ to, icon, label, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
          isActive
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            name={icon}
            className={cx('h-[18px] w-[18px]', isActive ? 'text-white/80' : 'text-slate-400')}
          />
          {label}
        </>
      )}
    </NavLink>
  )
}

function GroupLabel({ children }) {
  return (
    <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
      {children}
    </p>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { db } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isStudent = user.role === 'student'
  const studentSection = isStudent && user.sectionId ? db.sections.find((s) => s.id === user.sectionId) : null
  const subjectMap = new Map(db.subjects.map((s) => [s.id, s]))
  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to={isStudent ? '/student' : '/instructor'} onClick={close}>
          <Logo />
        </Link>
        <button
          type="button"
          onClick={close}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          aria-label="Close menu"
        >
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          <GroupLabel>Workspace</GroupLabel>
          <SidebarLink
            to={isStudent ? '/student' : '/instructor'}
            icon="home"
            label="Dashboard"
            end
            onNavigate={close}
          />
          <SidebarLink to="/playground" icon="code" label="Playground" onNavigate={close} />
        </div>

        {isStudent ? (
          <div className="space-y-1">
            <GroupLabel>Class Section</GroupLabel>
            {studentSection ? (
              <NavLink
                to={`/student/section/${studentSection.id}`}
                onClick={close}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                    isActive
                      ? 'bg-indigo-50 text-indigo-800 font-medium'
                      : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        'grid h-7 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold tracking-wide',
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {studentSection.code}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{studentSection.name}</span>
                      {(() => {
                        const subject = subjectMap.get(studentSection.subjectId)
                        return subject ? (
                          <span
                            className={cx(
                              'block truncate text-[11px] leading-tight',
                              isActive ? 'text-indigo-600' : 'text-slate-400',
                            )}
                          >
                            {subject.code} · {subject.name}
                          </span>
                        ) : null
                      })()}
                    </span>
                  </>
                )}
              </NavLink>
            ) : (
              <p className="px-3 text-xs text-slate-400">No class assigned yet</p>
            )}

            <div className="relative mt-5 overflow-hidden rounded-2xl bg-slate-900 p-3.5 text-white shadow-sm">
              <div className="pointer-events-none absolute -bottom-7 -right-3 opacity-30">
                <Blink mood="happy" size={76} animated />
              </div>
              <div className="relative flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 shadow-xs">
                  <Blink variant="face" size={20} animated />
                </span>
                <p className="text-xs font-semibold tracking-tight">BLINK</p>
                <span className="ml-auto text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-200/70">
                  AI buddy
                </span>
              </div>
              <p className="relative mt-2 text-[11px] leading-relaxed text-slate-300">
                Your study buddy unlocks after you submit an activity.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <GroupLabel>Sections</GroupLabel>
            {db.sections.map((section) => {
              const subject = subjectMap.get(section.subjectId)
              return (
                <NavLink
                  key={section.id}
                  to={`/instructor/section/${section.id}`}
                  onClick={close}
                  className={({ isActive }) =>
                    cx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition',
                      isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-100',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cx(
                          'grid h-7 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-bold tracking-wide',
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {section.code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{section.name}</span>
                        {subject && (
                          <span
                            className={cx(
                              'block truncate text-[11px] leading-tight',
                              isActive ? 'text-indigo-500' : 'text-slate-400',
                            )}
                          >
                            {subject.code} · {subject.name}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-500">
              {isStudent ? (studentSection ? `${studentSection.code} · Student` : 'Student · Awaiting section') : 'Instructor'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-slate-50/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white transition-transform duration-200 lg:inset-y-3 lg:left-3 lg:rounded-3xl lg:border lg:shadow-[0_1px_2px_rgba(28,25,21,0.04),0_24px_48px_-24px_rgba(28,25,21,0.25)] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebar}
      </aside>

      <div className="lg:pl-[19.5rem]">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
