import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../../store/store'
import { sectionById } from '../../lib/selectors'
import { generateProblem } from '../../lib/blink'
import { Badge, Blink, Button, Card, Field, Input, Select, Textarea, Toggle, cx } from '../../components/ui'
import { Icon } from '../../components/icons'

function defaultDueDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function CreateActivity() {
  const { db, createActivities } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const initialSectionId = sectionById(db, params.get('sectionId'))?.id || db.sections[0].id
  const requestedSubject = params.get('subjectId')
  const initialSubjectId = db.subjects.some((s) => s.id === requestedSubject)
    ? requestedSubject
    : db.subjects[0].id

  const [form, setForm] = useState({
    title: '',
    subjectId: initialSubjectId,
    language: 'Python',
    points: 30,
    dueDate: defaultDueDate(),
    allowBlink: true,
    description: '',
    instructions: '',
    starterCode: '',
  })
  const [selectedSections, setSelectedSections] = useState([initialSectionId])
  const [lesson, setLesson] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [aiDrafted, setAiDrafted] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleSection = (id) =>
    setSelectedSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const draft = await generateProblem({
        lesson,
        subjectId: form.subjectId,
        difficulty,
        language: form.language,
      })
      setForm((prev) => ({
        ...prev,
        title: draft.title,
        description: draft.description,
        instructions: draft.instructions,
        starterCode: draft.starterCode,
        language: draft.language,
        points: draft.points,
      }))
      setAiDrafted(true)
    } finally {
      setGenerating(false)
    }
  }

  const canPublish =
    form.title.trim() && form.description.trim() && form.instructions.trim() && form.dueDate && selectedSections.length > 0

  const handlePublish = () => {
    if (!canPublish) {
      setError('Add a title, description, instructions, due date, and pick at least one section.')
      return
    }
    const dueISO = new Date(`${form.dueDate}T23:59:00`).toISOString()
    const created = createActivities({
      base: {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        instructions: form.instructions.trim(),
        points: Number(form.points) || 0,
        dueDate: dueISO,
      },
      sectionIds: selectedSections,
    })
    navigate(`/instructor/section/${selectedSections[0]}`, { state: { created: created.length } })
  }

  return (
    <div>
      <Link
        to={`/instructor/section/${initialSectionId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        Back to section
      </Link>

      <header className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">New activity</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Create a coding problem</h1>
        <p className="mt-1 text-sm text-slate-500">
          Write it yourself or let BLINK draft it from your lesson, then publish it to sections.
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="space-y-5 p-5">
          <Field label="Activity title" htmlFor="title">
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Sum of N Numbers (Loops)"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subject" htmlFor="subject">
              <Select id="subject" value={form.subjectId} onChange={(e) => update('subjectId', e.target.value)}>
                {db.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} · {subject.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Language" htmlFor="language">
              <Select id="language" value={form.language} onChange={(e) => update('language', e.target.value)}>
                {['Python', 'C++', 'Java', 'JavaScript'].map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Points" htmlFor="points">
              <Input
                id="points"
                type="number"
                min="1"
                value={form.points}
                onChange={(e) => update('points', e.target.value)}
              />
            </Field>
            <Field label="Due date" htmlFor="due">
              <Input id="due" type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
            </Field>
          </div>

          <Field label="Problem description" hint="Shown to students at the top of the activity." htmlFor="description">
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe what the program should do..."
            />
          </Field>

          <Field label="Instructions" hint="Rules, constraints, and expected output." htmlFor="instructions">
            <Textarea
              id="instructions"
              rows={4}
              value={form.instructions}
              onChange={(e) => update('instructions', e.target.value)}
              placeholder="1. Read N from input...&#10;2. Use a loop..."
            />
          </Field>

          <Field label="Starter code" hint="Pre-filled in the student's editor." htmlFor="starter">
            <Textarea
              id="starter"
              rows={7}
              value={form.starterCode}
              onChange={(e) => update('starterCode', e.target.value)}
              placeholder="# Write your starter code here"
              className="font-mono text-[13px]"
            />
          </Field>

          <div className="rounded-xl border border-slate-200 p-3.5">
            <Toggle
              checked={form.allowBlink}
              onChange={(value) => update('allowBlink', value)}
              label="Allow BLINK on this activity"
              description="Students can ask the AI study buddy for guidance after submitting."
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-slate-900 px-4 py-3 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15">
                <Blink variant="face" size={22} mood={generating ? 'thinking' : 'happy'} animated={generating} />
              </span>
              <div>
                <p className="text-sm font-bold">Generate with BLINK</p>
                <p className="text-[11px] text-indigo-100">Draft a problem from your lesson</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <Field label="Lesson or instructions" htmlFor="lesson">
                <Textarea
                  id="lesson"
                  rows={4}
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="e.g. This week we covered for loops, counters, and accumulators..."
                />
              </Field>
              <Field label="Difficulty" htmlFor="difficulty">
                <Select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </Field>
              <Button className="w-full" onClick={handleGenerate} disabled={generating}>
                {generating ? 'BLINK is drafting...' : 'Generate problem'}
                {generating ? (
                  <Blink variant="face" size={16} mood="thinking" animated />
                ) : (
                  <Icon name="sparkles" className="h-4 w-4" />
                )}
              </Button>
              {aiDrafted && (
                <p className="rounded-lg bg-indigo-50 p-2.5 text-[11px] leading-relaxed text-indigo-700">
                  BLINK drafted a problem and filled the form. Review and edit it before publishing.
                </p>
              )}
              <p className="text-[11px] leading-relaxed text-slate-400">
                BLINK uses your lesson and the selected subject to create a starting point. You stay in control of what
                gets published.
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Publish to sections</p>
              <Badge tone={selectedSections.length ? 'indigo' : 'slate'}>{selectedSections.length} selected</Badge>
            </div>
            <div className="mt-2 space-y-1.5">
              {db.sections.map((section) => {
                const active = selectedSections.includes(section.id)
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={cx(
                      'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition',
                      active
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cx(
                          'grid h-6 w-9 place-items-center rounded-md text-[10px] font-bold',
                          active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {section.code}
                      </span>
                      {section.name}
                    </span>
                    {active && <Icon name="check" className="h-4 w-4" />}
                  </button>
                )
              })}
            </div>

            {error && <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600">{error}</p>}

            <Button className="mt-3 w-full" onClick={handlePublish}>
              <Icon name="send" className="h-4 w-4" />
              Publish activity
            </Button>
            {!canPublish && !error && (
              <p className="mt-2 text-[11px] text-slate-400">
                Add a title, description, instructions, due date, and at least one section.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
