import Blink from './Blink'

export { Blink }

export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Logo({ className = '', showText = true, light = false, animated = false, mood = 'happy' }) {
  return (
    <div className={cx('flex items-center gap-2.5', className)}>
      <span
        className={cx(
          'relative grid h-9 w-9 place-items-center overflow-hidden rounded-[11px]',
          light
            ? 'bg-slate-900/80 ring-1 ring-white/20 shadow-sm'
            : 'bg-slate-900 shadow-[0_2px_8px_rgba(28,25,21,0.28)]',
        )}
      >
        <Blink variant="face" mood={mood} size={28} animated={animated} title="CodeAssist logo" />
      </span>
      {showText && (
        <span
          className={cx(
            'text-[17px] font-semibold tracking-tight',
            light ? 'text-white' : 'text-slate-900',
          )}
        >
          Code<span className={light ? 'text-indigo-300' : 'text-indigo-600'}>Assist</span>
        </span>
      )}
    </div>
  )
}

const AVATAR_TONES = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-flame-100 text-flame-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
]

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ name, size = 'md', className = '' }) {
  const tone = AVATAR_TONES[(name || '').charCodeAt(0) % AVATAR_TONES.length]
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  }
  return (
    <span
      className={cx(
        'grid shrink-0 place-items-center rounded-full font-semibold ring-2 ring-white',
        sizes[size],
        tone,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

export function Eyebrow({ children, className = '', light = false }) {
  return (
    <p
      className={cx(
        'text-[11px] font-semibold uppercase tracking-[0.16em]',
        light ? 'text-indigo-200' : 'text-indigo-600',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function buttonStyles(variant = 'primary', size = 'md') {
  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-[0_1px_2px_rgba(28,25,21,0.12),0_8px_20px_-8px_rgba(75,70,229,0.65)] hover:bg-indigo-700 focus-visible:ring-indigo-200',
    secondary:
      'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-200',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-200',
    danger:
      'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-200',
    soft: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus-visible:ring-indigo-200',
    dark: 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-300',
    flame: 'bg-flame-500 text-white shadow-sm hover:bg-flame-600 focus-visible:ring-flame-200',
  }
  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  }
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return <button className={cx(buttonStyles(variant, size), className)} {...props} />
}

export function Card({ className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cx(
        'rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(28,25,21,0.04),0_14px_30px_-22px_rgba(28,25,21,0.35)]',
        className,
      )}
      {...props}
    />
  )
}

const BADGE_TONES = {
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  flame: 'bg-flame-50 text-flame-700 ring-flame-200',
}

export function Badge({ tone = 'slate', className = '', children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        BADGE_TONES[tone] || BADGE_TONES.slate,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Field({ label, hint, htmlFor, children, className = '' }) {
  return (
    <div className={cx('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

const fieldBase =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50'

export function Input({ className = '', ...props }) {
  return <input className={cx(fieldBase, className)} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cx(fieldBase, 'min-h-24 resize-y leading-relaxed', className)} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={cx(fieldBase, 'cursor-pointer appearance-none pr-9', className)} {...props}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label
      className={cx(
        'flex cursor-pointer items-start gap-3',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cx(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200',
          checked ? 'bg-indigo-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </button>
      <span>
        {label && <span className="block text-sm font-semibold text-slate-800">{label}</span>}
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  )
}

export function ProgressBar({ value = 0, tone = 'indigo', className = '' }) {
  const tones = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    flame: 'bg-flame-500',
  }
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className={cx('h-full rounded-full transition-all', tones[tone] || tones.indigo)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function EmptyState({ title, description, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        {icon || (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 7 4.5 12 9 17" />
            <path d="m15 7 4.5 5L15 17" />
          </svg>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Stat({ label, value, hint, tone = 'indigo', icon }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    flame: 'bg-flame-50 text-flame-600',
  }
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <span className={cx('grid h-8 w-8 place-items-center rounded-xl', tones[tone] || tones.indigo)}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>}
    </Card>
  )
}
