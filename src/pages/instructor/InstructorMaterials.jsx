import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../store/store'
import {
  customizationsForSection,
  sectionById,
  sectionLanguage,
  subjectById,
} from '../../lib/selectors'
import { LEARNING_MATERIALS } from '../../data/learningMaterials'
import { customizeLesson } from '../../lib/blink'
import { Badge, Blink, Button, Card, EmptyState, Textarea } from '../../components/ui'
import { Icon } from '../../components/icons'
import LessonBrowser from '../../components/LessonBrowser'

const BLINK_SUGGESTIONS = [
  'Make this lesson simpler',
  'Add a real-world example',
  'Review the quiz answers in class',
]

function LessonBlinkPanel({ lesson, customization, onSave, onClear }) {
  const [prompt, setPrompt] = useState('')
  const [thinking, setThinking] = useState(false)
  const [notice, setNotice] = useState('')

  const askBlink = async (value) => {
    const request = (value ?? prompt).trim()
    if (!request || thinking) return
    setThinking(true)
    setNotice('')
    const draft = await customizeLesson({ lesson, request })
    onSave({ request, note: draft.note })
    setPrompt('')
    setNotice(draft.reply)
    setThinking(false)
  }

  const clear = () => {
    onClear()
    setNotice('')
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-slate-900 px-4 py-3 text-white">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15">
          <Blink variant="face" size={24} mood={thinking ? 'thinking' : 'happy'} animated={thinking} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold">BLINK lesson editor</p>
          <p className="text-[11px] text-indigo-100">Tell BLINK what this lesson should include.</p>
        </div>
        {customization && (
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-100">
            Applied
          </span>
        )}
      </div>

      <div className="p-4">
        {customization && (
          <div className="mb-3 flex items-start justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-700">Applied request</p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-900/80">"{customization.request}"</p>
            </div>
            <button
              type="button"
              onClick={clear}
              title="Remove this focus"
              className="shrink-0 rounded-lg p-1 text-indigo-400 transition hover:bg-white hover:text-rose-600"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {BLINK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setPrompt(suggestion)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            askBlink()
          }}
          className="mt-3 space-y-2"
        >
          <Textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Slow down and add a real-world example about student grades."
            className="text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] leading-relaxed text-slate-400">
              BLINK updates this lesson's focus note. Students see it when the materials are published.
            </p>
            <Button type="submit" size="sm" disabled={!prompt.trim() || thinking}>
              {thinking ? 'BLINK is drafting...' : 'Ask BLINK'}
              {thinking ? (
                <Blink variant="face" size={15} mood="thinking" animated />
              ) : (
                <Icon name="sparkles" className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </form>

        {notice && (
          <p className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-[11px] leading-relaxed text-emerald-800">
            {notice}
          </p>
        )}
      </div>
    </Card>
  )
}

export default function InstructorMaterials() {
  const { sectionId } = useParams()
  const {
    db,
    setMaterialsPublished,
    saveLessonCustomization,
    clearLessonCustomization,
  } = useStore()

  const section = sectionById(db, sectionId)

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

  const subject = subjectById(db, section.subjectId)
  const language = sectionLanguage(db, section.id)
  const lessons = LEARNING_MATERIALS[language] || []
  const customizations = customizationsForSection(db, section.id)
  const published = db.publishedMaterials.some(
    (m) => m.sectionId === section.id && m.language === language,
  )

  const handleToggle = () => {
    if (
      published &&
      !window.confirm(
        `Unpublish ${language} learning materials from ${section.code}? Students will lose access.`,
      )
    ) {
      return
    }
    setMaterialsPublished({ sectionId: section.id, language, published: !published })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/instructor" className="font-medium transition hover:text-indigo-600">
          All sections
        </Link>
        <span>/</span>
        <Link
          to={`/instructor/section/${section.id}`}
          className="font-medium transition hover:text-indigo-600"
        >
          {section.code}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Learning materials</span>
      </div>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Learning materials</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Review and publish lessons</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preview the developer-provided {language} lessons for {section.code}
            {subject ? ` · ${subject.code} ${subject.name}` : ''} before students see them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={published ? 'emerald' : 'slate'}>
            {published ? 'Published' : 'Not published'}
          </Badge>
          <Badge tone="slate">{language}</Badge>
          <Button
            variant={published ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggle}
            disabled={lessons.length === 0}
          >
            <Icon name={published ? 'x' : 'send'} className="h-3.5 w-3.5" />
            {published ? 'Unpublish' : 'Publish to section'}
          </Button>
        </div>
      </header>

      <LessonBrowser
        lessons={lessons}
        language={language}
        reviewMode
        customizations={customizations}
        lessonPanel={(lesson) => (
          <LessonBlinkPanel
            key={lesson.id}
            lesson={lesson}
            customization={customizations[lesson.id]}
            onSave={({ request, note }) =>
              saveLessonCustomization({ sectionId: section.id, lessonId: lesson.id, request, note })
            }
            onClear={() =>
              clearLessonCustomization({ sectionId: section.id, lessonId: lesson.id })
            }
          />
        )}
        emptyTitle={`No developer-provided lessons for ${language} yet`}
        emptyDescription="Only sample Python lessons are pre-installed in this prototype."
        emptyAction={
          <Link
            to={`/instructor/section/${section.id}`}
            className="text-sm font-semibold text-indigo-600"
          >
            Back to section
          </Link>
        }
        aside={
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Publishing</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {published
                ? `Students in ${section.code} can currently see these lessons.`
                : `Students in ${section.code} cannot see these lessons yet.`}{' '}
              Review each lesson and its quiz answers, then publish when you are ready.
            </p>
          </Card>
        }
      />
    </div>
  )
}
