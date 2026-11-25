import { Link } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import { useStore } from '../../store/store'
import { customizationsForSection, sectionById, sectionLanguage, subjectById } from '../../lib/selectors'
import { LEARNING_MATERIALS } from '../../data/learningMaterials'
import { Badge, Card, EmptyState } from '../../components/ui'
import { Icon } from '../../components/icons'
import LessonBrowser from '../../components/LessonBrowser'

export default function LearningMaterials() {
  const { user } = useAuth()
  const { db } = useStore()

  const section = user.sectionId ? sectionById(db, user.sectionId) : null
  const subject = section ? subjectById(db, section.subjectId) : null
  const language = section ? sectionLanguage(db, section.id) : 'Python'
  const published =
    Boolean(section) &&
    db.publishedMaterials.some((m) => m.sectionId === section.id && m.language === language)
  const lessons = published ? LEARNING_MATERIALS[language] || [] : []

  if (!section) {
    return (
      <EmptyState
        title="No class section yet"
        description="Learning materials appear once your instructor assigns you to a section."
        action={
          <Link to="/student" className="text-sm font-semibold text-indigo-600">
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const customizations = customizationsForSection(db, section.id)

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/student" className="font-medium transition hover:text-indigo-600">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Learning materials</span>
      </div>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Learning materials</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{language} lessons</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sample lessons and practice quizzes for {section.code}
            {subject ? ` · ${subject.code} ${subject.name}` : ''}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={published ? 'indigo' : 'slate'}>
            <Icon name="book" className="h-3.5 w-3.5" />
            {published ? `${lessons.length} lessons` : 'Not published'}
          </Badge>
          <Badge tone="slate">{language}</Badge>
          <Badge tone="amber">Sample content</Badge>
        </div>
      </header>

      <LessonBrowser
        lessons={lessons}
        language={language}
        customizations={customizations}
        emptyTitle={
          published ? `${language} materials are not available yet` : 'Learning materials not published yet'
        }
        emptyDescription={
          published
            ? 'This prototype only includes sample Python lessons. More languages can be added later.'
            : `Your instructor has not published the ${language} sample lessons for ${section.code}. Check back after they publish them.`
        }
        emptyAction={
          <Link to="/playground" className="text-sm font-semibold text-indigo-600">
            Practice in the Playground
          </Link>
        }
        aside={
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">About these materials</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Short examples based on the language used in {section.code}. The quizzes are for practice only — answers
              are not graded or saved.
            </p>
          </Card>
        }
      />
    </div>
  )
}
