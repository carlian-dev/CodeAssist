import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { Avatar, Badge, Blink, Eyebrow, Logo, ProgressBar, buttonStyles, cx } from '../components/ui'
import { Icon } from '../components/icons'

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#blink', label: 'BLINK' },
  { href: '#sections', label: 'Sections' },
]

const STATS = [
  { value: 'Unlimited', label: 'Course sections' },
  { value: '10+', label: 'Active students' },
  { value: '13', label: 'Curated activities' },
  { value: '100%', label: 'Hands-on practice' },
]

const STEPS = [
  {
    title: 'Create an activity',
    text: 'Write the problem yourself or let BLINK draft one from your lesson. Publish it to a single section or across all your classes at once.',
    icon: 'plus',
  },
  {
    title: 'Students submit code',
    text: 'A focused editor with the problem, instructions, due date, and starter code in one calm column.',
    icon: 'code',
  },
  {
    title: 'Grade and explain',
    text: 'Review submissions, leave feedback, and ask BLINK for a first-pass note. Students get guidance after they submit.',
    icon: 'check',
  },
]

const INSTRUCTOR_LINKS = [
  { label: 'Dashboard', to: '/instructor' },
  { label: 'Section T151', to: '/instructor/section/t151' },
  { label: 'Create activity', to: '/instructor/activity/new?sectionId=t151' },
]

const STUDENT_LINKS = [
  { label: 'Dashboard', to: '/student' },
  { label: 'Hello, World!', to: '/student/activity/a1' },
  { label: 'Reverse an Array', to: '/student/activity/a4' },
]

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cx(
        'transition-all duration-700 ease-out motion-reduce:transition-none',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100',
        className,
      )}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function NavBar({ user }) {
  const [open, setOpen] = useState(false)
  const dashboard = user ? (user.role === 'instructor' ? '/instructor' : '/student') : null

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-slate-50/85 py-2 pl-4 pr-2 shadow-[0_1px_2px_rgba(28,25,21,0.05),0_12px_30px_-24px_rgba(28,25,21,0.5)] backdrop-blur-xl">
          <Link to="/" aria-label="CodeAssist home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {user ? (
              <Link to={dashboard} className={buttonStyles('primary', 'sm')}>
                Open dashboard
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link to="/login" className={buttonStyles('primary', 'sm')}>
                  Get started
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
              aria-expanded={open}
              aria-label="Toggle navigation"
            >
              <Icon name={open ? 'x' : 'menu'} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl md:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {link.label}
                <Icon name="arrowRight" className="h-4 w-4 text-slate-300" />
              </a>
            ))}
            {!user && (
              <Link
                to="/login"
                className="mt-1 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Sign in to your account
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function HeroPreview() {
  const rows = [
    { code: 'CP 2', title: 'Sum of N Numbers', meta: 'Due in 2 days · 30 pts', tone: 'slate', label: 'To do' },
    { code: 'CP 3', title: 'Reverse an Array', meta: 'Submitted yesterday', tone: 'sky', label: 'Submitted' },
    { code: 'CP 1', title: 'Hello, World!', meta: 'Returned with feedback', tone: 'emerald', label: 'Graded 95' },
  ]

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/70 via-white/40 to-flame-200/60 blur-2xl" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_36px_90px_-44px_rgba(28,25,21,0.55)]">
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="mx-auto flex max-w-[15rem] flex-1 items-center justify-center gap-1.5 truncate rounded-md bg-white px-2.5 py-1 font-mono text-[10px] text-slate-400 ring-1 ring-slate-200">
            <Icon name="lock" className="h-2.5 w-2.5" />
            codeassist.app/student
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
                T151 · Computer Programming 1
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Hi, Juan</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
              <Icon name="calendar" className="h-3 w-3" />
              MWF
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'To do', value: '2', tone: 'text-amber-600' },
              { label: 'Submitted', value: '1', tone: 'text-sky-600' },
              { label: 'Average', value: '92%', tone: 'text-emerald-600' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
                <p className={cx('mt-1 text-lg font-semibold leading-none tracking-tight', stat.tone)}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {rows.map((row) => (
              <div
                key={row.title}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
              >
                <span className="grid h-8 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[9px] font-bold text-slate-500">
                  {row.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-slate-800">{row.title}</p>
                  <p className="truncate text-[10px] text-slate-400">{row.meta}</p>
                </div>
                <Badge tone={row.tone}>{row.label}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -right-2 top-20 hidden w-40 rotate-2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl sm:block">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600">Graded</p>
        <div className="mt-1 flex items-end gap-1">
          <span className="text-2xl font-semibold leading-none tracking-tight text-slate-900">95</span>
          <span className="pb-0.5 text-[10px] text-slate-400">/ 100</span>
        </div>
        <p className="mt-1 text-[10px] leading-snug text-slate-500">Clean and correct. Keep experimenting.</p>
      </div>

      <div className="animate-float absolute -bottom-6 left-2 w-56 rounded-2xl border border-white/10 bg-slate-900 p-3.5 text-white shadow-2xl sm:-left-6">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10">
            <Blink variant="face" size={18} animated />
          </span>
          <p className="text-[11px] font-semibold">BLINK</p>
          <span className="ml-auto text-[8px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Unlocked
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
          Your loop works. Try tracing it with N = 0 to check the edge case before you resubmit.
        </p>
      </div>
    </div>
  )
}

function Panel({ className = '', children }) {
  return (
    <div
      className={cx(
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(28,25,21,0.04),0_20px_40px_-32px_rgba(28,25,21,0.35)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function FeatureIcon({ name, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    flame: 'bg-flame-50 text-flame-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <span className={cx('grid h-10 w-10 place-items-center rounded-xl', tones[tone])}>
      <Icon name={name} className="h-5 w-5" />
    </span>
  )
}

function BlinkShowcase() {
  const [mood, setMood] = useState('happy')
  const moods = [
    { id: 'happy', label: 'Happy' },
    { id: 'thinking', label: 'Thinking' },
    { id: 'celebrate', label: 'Celebrate' },
    { id: 'oops', label: 'Oops' },
  ]
  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center sm:flex-row sm:items-center sm:gap-6">
        <div className="flex h-36 w-36 shrink-0 items-center justify-center">
          <Blink mood={mood} size={130} animated />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:text-left">
          <div className="flex items-center justify-center gap-1.5 sm:justify-start">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Living cursor mascot</p>
          </div>
          <p className="mt-1 text-sm text-slate-200">
            Blink reacts to student progress, thinking through hints and celebrating achievements.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {moods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={cx(
                  'rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                  mood === m.id
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white',
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const dashboard = user ? (user.role === 'instructor' ? '/instructor' : '/student') : '/login'

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar user={user} />

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
            <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-300/25 blur-3xl" />
            <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-flame-300/20 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-28 lg:pt-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-flame-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-flame-500" />
                </span>
                Interactive classroom platform
              </div>

              <h1 className="mt-6 text-[2.85rem] font-semibold leading-[1.02] tracking-[-0.035em] text-slate-900 sm:text-[4rem]">
                Teach code.
                <span className="block font-editorial text-indigo-600">Grade with clarity.</span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
                CodeAssist brings every section, activity, submission, and piece of feedback into one focused
                workspace — with BLINK, an AI study buddy that only steps in after students submit.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={dashboard} className={buttonStyles('primary', 'lg')}>
                  {user ? 'Open your dashboard' : 'Get started'}
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
                <a href="#workflow" className={buttonStyles('secondary', 'lg')}>
                  See the workflow
                  <Icon name="chevronDown" className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                {['Instant access', 'Scalable course sections', 'Real-time AI assistance'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Icon name="check" className="h-3.5 w-3.5 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        <section className="border-y border-slate-200/80 bg-white/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-9 sm:px-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="overview" className="scroll-mt-28 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl">
              <Eyebrow>The workspace</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-4xl">
                Everything the class needs.{' '}
                <span className="text-slate-400">Nothing it doesn&rsquo;t.</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Built for programming classes that meet in labs, move fast, and need feedback to land while the
                problem is still fresh.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Reveal className="md:col-span-2">
                <Panel className="h-full">
                  <div className="flex items-center gap-3">
                    <FeatureIcon name="layers" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Section workspaces
                    </p>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                    All your sections, one shared rhythm.
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                    Move between course sections without losing the thread. Each section keeps its own roster, activities,
                    and grading queue as your class list expands.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {['T151', 'T152', 'T153', 'T154', 'T155', '+ more'].map((code, index) => (
                      <span
                        key={code}
                        className={cx(
                          'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
                          index === 0
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-slate-50 text-slate-600',
                        )}
                      >
                        <span
                          className={cx(
                            'h-1.5 w-1.5 rounded-full',
                            index === 0 ? 'bg-indigo-500' : 'bg-slate-300',
                          )}
                        />
                        {code}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2">
                        <Avatar name="Juan Dela Cruz" size="sm" />
                        <Avatar name="Maria Santos" size="sm" />
                        <Avatar name="Andres Bonifacio" size="sm" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Class roster</p>
                        <p className="text-[11px] text-slate-500">2 students · 6 activities · 1 to grade</p>
                      </div>
                    </div>
                    <span className="hidden rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200 sm:inline-flex">
                      Lab 1 · MWF
                    </span>
                  </div>
                </Panel>
              </Reveal>

              <Reveal delay={80}>
                <Panel className="h-full">
                  <FeatureIcon name="clipboard" tone="emerald" />
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">A queue that empties.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Submissions arrive in one list. Open, grade, and move on.
                  </p>

                  <div className="mt-5 space-y-2">
                    {[
                      { name: 'Maria Santos', meta: 'Sum of N Numbers', tone: 'amber', label: 'To grade' },
                      { name: 'Andres Bonifacio', meta: 'Print a Triangle', tone: 'amber', label: 'To grade' },
                      { name: 'Gabriela Silang', meta: 'Multiplication Table', tone: 'emerald', label: 'Graded 90' },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5"
                      >
                        <Avatar name={row.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-slate-800">{row.name}</p>
                          <p className="truncate text-[10px] text-slate-400">{row.meta}</p>
                        </div>
                        <Badge tone={row.tone}>{row.label}</Badge>
                      </div>
                    ))}
                  </div>
                </Panel>
              </Reveal>

              <Reveal>
                <Panel className="h-full bg-slate-900 text-white">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 shadow-sm">
                      <Blink variant="face" size={26} animated />
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
                      After submit
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">BLINK, with guardrails.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Hints and review topics — never the finished answer.
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-3 py-2 text-[11px] leading-relaxed text-white">
                      Where did I go wrong?
                    </div>
                    <div className="w-fit max-w-[92%] rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 text-[11px] leading-relaxed text-slate-200">
                      Your loop works. Try tracing it with N = 0 before you resubmit.
                    </div>
                  </div>
                </Panel>
              </Reveal>

              <Reveal className="md:col-span-2" delay={80}>
                <Panel className="h-full">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <FeatureIcon name="chart" />
                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                        Progress you can feel.
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                        Students see what is left, what is waiting, and what came back. Instructors see the whole
                        section at a glance.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Average</p>
                      <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-slate-900">92%</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      { code: 'CP 1', label: 'Computer Programming 1', value: 100, tone: 'emerald' },
                      { code: 'CP 2', label: 'Computer Programming 2', value: 60, tone: 'indigo' },
                      { code: 'CP 3', label: 'Computer Programming 3', value: 40, tone: 'indigo' },
                      { code: 'CP 4', label: 'Computer Programming 4', value: 0, tone: 'indigo' },
                    ].map((item) => (
                      <div key={item.code} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">
                            {item.code} · {item.label}
                          </span>
                          <span className="text-slate-400">{item.value}%</span>
                        </div>
                        <ProgressBar className="mt-2" value={item.value} tone={item.tone} />
                      </div>
                    ))}
                  </div>
                </Panel>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-28 border-y border-slate-200/80 bg-white/50 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>The workflow</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-4xl">
                From lesson to feedback in three moves.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                A clear workflow and instant feedback. Everything students and instructors need in one focused place.
              </p>
            </Reveal>

            <div className="relative mt-12 grid gap-4 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-slate-300 md:block" />
              {STEPS.map((step, index) => (
                <Reveal key={step.title} delay={index * 90}>
                  <div className="relative h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(28,25,21,0.04)]">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        0{index + 1}
                      </span>
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon name={step.icon} className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="blink" className="scroll-mt-28 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-6 text-white sm:p-10 lg:p-14">
                <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-60" />
                <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-flame-500/15 blur-3xl" />

                <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
                      <Blink variant="face" size={16} animated={false} />
                      BLINK · AI study buddy
                    </div>
                    <h2 className="mt-5 max-w-lg font-editorial text-[2.5rem] leading-[1.05] text-white sm:text-5xl">
                      Help that arrives after the work, not before it.
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
                      BLINK reads the submission, points at what to revisit, and keeps the answer just out of reach.
                      Instructors decide where it is allowed.
                    </p>

                    <ul className="mt-7 space-y-3">
                      {[
                        { icon: 'lock', text: 'Unlocks only after a student submits.' },
                        { icon: 'shield', text: 'Can be switched off per activity.' },
                        { icon: 'sparkles', text: 'Gives hints and review topics — never full solutions.' },
                      ].map((item) => (
                        <li key={item.text} className="flex items-start gap-3 text-sm text-slate-200">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-indigo-200">
                            <Icon name={item.icon} className="h-4 w-4" />
                          </span>
                          {item.text}
                        </li>
                      ))}
                    </ul>

                    <BlinkShowcase />
                  </div>

                  <div className="rounded-3xl bg-white p-3 shadow-2xl">
                    <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 shadow-xs">
                        <Blink variant="face" size={24} animated />
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-900">BLINK</p>
                        <p className="text-[10px] text-slate-500">Reviewing “Reverse an Array”</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        Unlocked
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 px-1">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-900">
                          <Blink variant="face" size={18} animated={false} />
                        </span>
                        <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2.5 text-[11px] leading-relaxed text-slate-700">
                          Hi Juan! You&rsquo;ve submitted, so let&rsquo;s review it together. Ask me where you went wrong
                          or what to study next.
                        </div>
                      </div>
                      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-3 py-2.5 text-[11px] leading-relaxed text-white">
                        What should I review next?
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-900">
                          <Blink variant="face" size={18} animated={false} />
                        </span>
                        <div className="max-w-[94%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2.5 text-[11px] leading-relaxed text-slate-700">
                          Your loop walks the list backwards correctly. Next, review indexing from the end and how to
                          handle an empty input without crashing.
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 px-1 pt-3">
                      {['Where did I go wrong?', 'What next?'].map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="sections" className="scroll-mt-28 border-t border-slate-200/80 bg-white/50 px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <Reveal>
                <Eyebrow>Jump in</Eyebrow>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-slate-900 sm:text-4xl">
                  Pick a side of the classroom.
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
                  Dedicated tools tailored for learning and teaching. Submit solutions as a student or review and grade as
                  an instructor.
                </p>
                <Link to="/login" className={cx(buttonStyles('primary', 'md'), 'mt-6')}>
                  Get started
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </Reveal>

              <div className="grid gap-4 sm:grid-cols-2">
                <Reveal delay={60}>
                  <Panel className="h-full">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon name="user" className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-semibold text-slate-900">Student</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      See what is due, submit code, and revisit feedback.
                    </p>
                    <ul className="mt-4 space-y-2">
                      {STUDENT_LINKS.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.to}
                            className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
                          >
                            {link.label}
                            <Icon name="arrowUpRight" className="h-3.5 w-3.5 text-slate-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </Reveal>

                <Reveal delay={120}>
                  <Panel className="h-full">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-flame-50 text-flame-600">
                        <Icon name="users" className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-semibold text-slate-900">Instructor</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      Create activities, publish to sections, and clear the queue.
                    </p>
                    <ul className="mt-4 space-y-2">
                      {INSTRUCTOR_LINKS.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.to}
                            className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-flame-200 hover:bg-flame-50/50 hover:text-flame-700"
                          >
                            {link.label}
                            <Icon name="arrowUpRight" className="h-3.5 w-3.5 text-slate-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 px-6 py-14 text-center sm:px-12">
                <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-40" />
                <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-flame-400/25 blur-3xl" />
                <div className="relative">
                  <Eyebrow light>Try it now</Eyebrow>
                  <h2 className="mx-auto mt-3 max-w-2xl font-editorial text-4xl leading-tight text-white sm:text-5xl">
                    Ready to teach and code with clarity?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-indigo-100">
                    Join students and instructors already managing coding coursework with focus and speed.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to={dashboard} className={buttonStyles('dark', 'lg')}>
                      {user ? 'Open your dashboard' : 'Get started now'}
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </Link>
                    <a
                      href="#workflow"
                      className={cx(
                        buttonStyles('secondary', 'lg'),
                        'border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15',
                      )}
                    >
                      How it works
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              A calmer workspace for programming classes — activities, submissions, feedback, and a tutor with
              boundaries.
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Learning platform
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-indigo-600">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Portal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/login" className="transition hover:text-indigo-600">
                  Student sign in
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-indigo-600">
                  Instructor sign in
                </Link>
              </li>
              <li>
                <Link to="/instructor/activity/new?sectionId=t151" className="transition hover:text-indigo-600">
                  Create an activity
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Built with</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>React 19</li>
              <li>Vite 8</li>
              <li>Tailwind CSS v4</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/80">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>© 2026 CodeAssist. All rights reserved.</span>
            <span>Made for programming classrooms.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
