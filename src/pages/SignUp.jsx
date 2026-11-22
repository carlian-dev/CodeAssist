import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { useStore } from '../store/store'
import { Blink, Button, Eyebrow, Field, Input, Logo, cx } from '../components/ui'
import { Icon } from '../components/icons'

const FEATURES = [
  {
    icon: 'layers',
    title: 'Flexible section workspaces',
    text: 'Manage any number of course sections with dedicated rosters and schedules.',
  },
  {
    icon: 'clipboard',
    title: 'Assign, submit, review',
    text: 'A clear to-do list for students and a grading queue for instructors.',
  },
  {
    icon: 'blink',
    title: 'BLINK, when it is allowed',
    text: 'AI help unlocks only after a student submits — if the instructor permits it.',
  },
]

export default function SignUp() {
  const { user, login } = useAuth()
  const { db, registerUser } = useStore()
  const navigate = useNavigate()

  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to={user.role === 'student' ? '/student' : '/instructor'} replace />
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    setError('')

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName) {
      setError('Please enter your full name.')
      return
    }
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter a password.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail)
    if (existing) {
      setError('An account with this email already exists. Please sign in instead.')
      return
    }

    const newUser = registerUser({
      name: cleanName,
      email: cleanEmail,
      role,
    })

    login(newUser.id)
    navigate(newUser.role === 'instructor' ? '/instructor' : '/student')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-flame-300/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:py-6">
        <section className="relative hidden overflow-hidden rounded-[2rem] bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-flame-500/15 blur-3xl" />

          <div className="relative">
            <Link to="/">
              <Logo light />
            </Link>
            <Eyebrow light className="mt-14">
              Get started
            </Eyebrow>
            <h2 className="mt-3 max-w-sm font-editorial text-[2.7rem] leading-[1.03] text-white">
              Start learning or teaching in a calm coding workspace.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Create your account in seconds. Access assignments, instant submission review, and interactive BLINK guidance.
            </p>
          </div>

          <div className="relative mt-12 space-y-2.5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-indigo-200">
                  {feature.icon === 'blink' ? (
                    <Blink variant="face" size={24} animated />
                  ) : (
                    <Icon name={feature.icon} className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-12 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <span>Secure Access</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              System Online
            </span>
          </div>
        </section>

        <section className="flex flex-col justify-center py-8 lg:py-12">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 lg:inline-flex"
            >
              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
              Back to home
            </Link>

            <Eyebrow className="mt-6">Get started</Eyebrow>
            <h1 className="mt-2 font-editorial text-[2.6rem] leading-none text-slate-900">Create an account</h1>
            <p className="mt-3 text-sm text-slate-500">Join CodeAssist as a student or instructor.</p>

            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {[
                { id: 'student', label: 'Student', icon: 'user' },
                { id: 'instructor', label: 'Instructor', icon: 'users' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRole(option.id)}
                  className={cx(
                    'flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition',
                    role === option.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                  )}
                >
                  <Icon name={option.icon} className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800">
                <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <Field label="Full name" htmlFor="name">
                <Input
                  id="name"
                  type="text"
                  placeholder={role === 'student' ? 'e.g. Juan Dela Cruz' : 'e.g. Prof. Maria Santos'}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError('')
                  }}
                  required
                />
              </Field>

              <Field label="Email address" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  placeholder={role === 'student' ? 'student@codeassist.edu' : 'instructor@codeassist.edu'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  autoComplete="email"
                  required
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Button type="submit" className="w-full" size="lg">
                Create account
                <Icon name="arrowRight" className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
