import { useId } from 'react'
import './Blink.css'

export const BLINK_MOODS = ['happy', 'thinking', 'celebrate', 'oops']

const NAVY = '#0B1B4A'
const AMBER = '#FBBF24'
const BRACE_L =
  'M308 150 C300 150 302 158 302 164 C302 170 298 172 294 172 C298 172 302 174 302 180 C302 186 300 194 308 194'
const BRACE_R =
  'M328 150 C336 150 334 158 334 164 C334 170 338 172 342 172 C338 172 334 174 334 180 C334 186 336 194 328 194'

const f = (n) => +n.toFixed(1)
// 4-point sparkle star
const star = (cx, cy, r) => {
  const k = r * 0.3
  return `M${f(cx)} ${f(cy - r)} L${f(cx + k)} ${f(cy - k)} L${f(cx + r)} ${f(cy)} L${f(cx + k)} ${f(cy + k)} L${f(cx)} ${f(cy + r)} L${f(cx - k)} ${f(cy + k)} L${f(cx - r)} ${f(cy)} L${f(cx - k)} ${f(cy - k)}Z`
}

function Eyes({ mood }) {
  if (mood === 'celebrate') {
    return (
      <g fill="none" stroke={NAVY} strokeWidth="6" strokeLinecap="round">
        <path d="M164 202 Q180 182 196 202" />
        <path d="M204 202 Q220 182 236 202" />
      </g>
    )
  }
  if (mood === 'oops') {
    return (
      <g>
        <g className="blk-eyes">
          <circle cx="180" cy="198" r="16" fill="#F0F9FF" />
          <circle cx="220" cy="198" r="16" fill="#F0F9FF" />
          <circle cx="180" cy="199" r="5.5" fill={NAVY} />
          <circle cx="220" cy="199" r="5.5" fill={NAVY} />
          <circle cx="182" cy="197" r="2" fill="#fff" />
          <circle cx="222" cy="197" r="2" fill="#fff" />
        </g>
        <g fill="none" stroke={NAVY} strokeWidth="5" strokeLinecap="round">
          <path d="M164 180 L194 170" />
          <path d="M206 170 L236 180" />
        </g>
      </g>
    )
  }
  const dx = mood === 'thinking' ? 2 : 0
  const dy = mood === 'thinking' ? -9 : 0
  return (
    <g className="blk-eyes">
      <circle cx="180" cy="196" r="16" fill="#F0F9FF" />
      <circle cx="220" cy="196" r="16" fill="#F0F9FF" />
      <circle cx={183 + dx} cy={200 + dy} r="9" fill={NAVY} />
      <circle cx={223 + dx} cy={200 + dy} r="9" fill={NAVY} />
      <circle cx={187 + dx} cy={196 + dy} r="3.5" fill="#fff" />
      <circle cx={227 + dx} cy={196 + dy} r="3.5" fill="#fff" />
    </g>
  )
}

function Mouth({ mood }) {
  if (mood === 'thinking') {
    return (
      <g fill={AMBER}>
        <circle className="blk-dot" cx="187" cy="242" r="3.8" />
        <circle className="blk-dot blk-dot-2" cx="200" cy="242" r="3.8" />
        <circle className="blk-dot blk-dot-3" cx="213" cy="242" r="3.8" />
      </g>
    )
  }
  if (mood === 'celebrate') {
    return (
      <g>
        <path d="M181 232 Q200 270 219 232 Z" fill={NAVY} stroke={NAVY} strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="200" cy="245" rx="9" ry="5" fill="#F472B6" />
      </g>
    )
  }
  if (mood === 'oops') {
    return <path d="M184 247 Q192 239 200 247 T216 247" fill="none" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
  }
  return <path d="M186 238 Q200 254 214 238" fill="none" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
}

function Sparkles({ mood, filter }) {
  if (mood === 'oops') return null
  if (mood === 'celebrate') {
    return (
      <g filter={filter}>
        <path className="blk-spark" d={star(64, 104, 14)} fill={AMBER} />
        <path className="blk-spark blk-spark-2" d={star(352, 70, 12)} fill="#22D3EE" />
        <path className="blk-spark blk-spark-3" d={star(44, 330, 10)} fill="#F472B6" />
        <circle className="blk-spark blk-spark-4" cx="58" cy="190" r="5" fill="#F472B6" />
        <circle className="blk-spark blk-spark-2" cx="356" cy="240" r="5" fill="#A78BFA" />
        <circle className="blk-spark blk-spark-3" cx="352" cy="340" r="4" fill={AMBER} />
        <circle className="blk-spark" cx="40" cy="250" r="4" fill="#22D3EE" />
      </g>
    )
  }
  return (
    <g filter={filter}>
      <path className="blk-spark" d={star(66, 126, 14)} fill={AMBER} />
      <path className="blk-spark blk-spark-2" d={star(352, 108, 10)} fill="#22D3EE" />
      <circle className="blk-spark blk-spark-3" cx="60" cy="300" r="4" fill="#F472B6" />
      <circle className="blk-spark blk-spark-4" cx="350" cy="320" r="3.5" fill="#22D3EE" />
    </g>
  )
}

/**
 * Blink, the CodeAssist mascot: a living text cursor.
 *
 * @param mood     'happy' | 'thinking' | 'celebrate' | 'oops'
 * @param variant  'full' (whole body) | 'face' (square crop for avatars)
 * @param size     rendered width in px
 * @param animated set false for a static image
 */
export function Blink({
  mood = 'happy',
  variant = 'full',
  size = 200,
  animated = true,
  title = 'Blink, the CodeAssist mascot',
  className = '',
  ...rest
}) {
  const uid = 'blk' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const gid = `${uid}g`
  const fid = `${uid}f`
  const glow = `url(#${fid})`
  const face = variant === 'face'
  const [vb, w, h] = face ? ['100 56 200 200', 200, 200] : ['0 0 400 440', 400, 440]
  const height = Math.round((size * h) / w)
  const cheer = mood === 'celebrate'

  const armL = cheer ? 'M148 246 C116 236 94 206 90 170' : 'M148 250 C118 246 98 224 94 196'
  const handL = cheer ? [90, 160] : [94, 188]
  const armR = cheer ? 'M252 246 C284 236 306 206 310 170' : 'M252 260 C284 264 304 252 314 232'
  const handR = cheer ? [310, 160] : [316, 226]
  const bracesT = cheer ? 'translate(-8 -66)' : undefined

  const cls = ['blk', `blk--${variant}`, `blk--${mood}`, animated ? '' : 'blk--still', className]
    .filter(Boolean)
    .join(' ')

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={vb}
      width={size}
      height={height}
      role="img"
      aria-label={title}
      className={cls}
      {...rest}
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="72" x2="0" y2="380">
          <stop offset="0" stopColor="#38E1F5" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <filter id={fid} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {!face && (
        <ellipse className="blk-shadow" cx="200" cy="408" rx="130" ry="13" fill="#3B82F6" opacity="0.4" filter={glow} />
      )}

      <g className="blk-body">
        <rect className="blk-halo" x="148" y="88" width="104" height="280" rx="40" fill="#22D3EE" opacity="0.3" filter={glow} />

        {!face && (
          <>
            {/* left arm */}
            <g className="blk-arm blk-arm-l">
              <path d={armL} stroke="#3B82F6" strokeWidth="20" fill="none" strokeLinecap="round" />
              <circle cx={handL[0]} cy={handL[1]} r="16" fill="#60A5FA" />
            </g>
            {/* right arm, holding the { } symbol */}
            <g className="blk-arm blk-arm-r">
              <path d={armR} stroke="#3B82F6" strokeWidth="20" fill="none" strokeLinecap="round" />
              <circle cx={handR[0]} cy={handR[1]} r="16" fill="#60A5FA" />
              <g
                className="blk-braces"
                transform={bracesT}
                fill="none"
                stroke={AMBER}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={glow}
              >
                <path d={BRACE_L} />
                <path d={BRACE_R} />
              </g>
            </g>
            {/* feet */}
            <ellipse cx="140" cy="394" rx="22" ry="10" fill="#1E3A8A" />
            <ellipse cx="260" cy="394" rx="22" ry="10" fill="#1E3A8A" />
          </>
        )}

        {/* cursor body: serifs + stem */}
        {!face && <rect x="112" y="352" width="176" height="28" rx="14" fill={`url(#${gid})`} />}
        <rect x="112" y="72" width="176" height="28" rx="14" fill={`url(#${gid})`} />
        <rect x="148" y="88" width="104" height="280" rx="40" fill={`url(#${gid})`} stroke="#BAE6FD" strokeOpacity="0.5" strokeWidth="3" />
        <path d="M166 130 C164 190 164 260 168 320" stroke="#fff" strokeOpacity="0.28" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* face */}
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        <circle cx="166" cy="236" r={cheer ? 9 : 8} fill="#F472B6" opacity={mood === 'oops' ? 0.25 : 0.55} />
        <circle cx="234" cy="236" r={cheer ? 9 : 8} fill="#F472B6" opacity={mood === 'oops' ? 0.25 : 0.55} />
        {mood === 'oops' && (
          <path className="blk-drop" d="M248 150 C242 160 240 166 248 170 C256 166 254 160 248 150 Z" fill="#7DD3FC" />
        )}

        {/* terminal prompt on chest */}
        {!face && (
          <g>
            <path d="M180 292 L198 306 L180 320" fill="none" stroke="#F0F9FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <rect className="blk-caret" x="207" y="316" width="22" height="6" rx="3" fill={mood === 'oops' ? '#F87171' : AMBER} />
          </g>
        )}
      </g>

      {!face && <Sparkles mood={mood} filter={glow} />}
    </svg>
  )
}

export default Blink
