import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createSeed } from '../data/seed'

const DB_KEY = 'codeassist:db:v1'

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.version === 1) return parsed
    }
  } catch {
    // fall through to a fresh seed
  }
  const seeded = createSeed()
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(seeded))
  } catch {
    // ignore storage failures
  }
  return seeded
}

function makeId(prefix) {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [db, setDb] = useState(loadDb)

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db))
    } catch {
      // ignore storage failures
    }
  }, [db])

  const value = useMemo(() => {
    const submitActivity = ({ activityId, studentId, code }) => {
      setDb((prev) => {
        const now = new Date().toISOString()
        const existing = prev.submissions.find(
          (s) => s.activityId === activityId && s.studentId === studentId,
        )
        if (existing) {
          return {
            ...prev,
            submissions: prev.submissions.map((s) =>
              s.id === existing.id
                ? { ...s, code, submittedAt: now, status: 'submitted', grade: null, feedback: '' }
                : s,
            ),
          }
        }
        return {
          ...prev,
          submissions: [
            ...prev.submissions,
            {
              id: makeId('sub'),
              activityId,
              studentId,
              code,
              submittedAt: now,
              status: 'submitted',
              grade: null,
              feedback: '',
            },
          ],
        }
      })
    }

    const gradeSubmission = ({ submissionId, grade, feedback }) => {
      setDb((prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) =>
          s.id === submissionId
            ? { ...s, grade: grade === '' || grade == null ? null : Number(grade), feedback, status: 'graded' }
            : s,
        ),
      }))
    }

    const createActivities = ({ base, sectionIds }) => {
      const created = sectionIds.map((sectionId) => ({
        ...base,
        id: makeId('act'),
        sectionId,
        createdBy: 'ins-1',
        createdAt: new Date().toISOString(),
      }))
      setDb((prev) => ({ ...prev, activities: [...created, ...prev.activities] }))
      return created
    }

    const updateActivity = (id, patch) => {
      setDb((prev) => ({
        ...prev,
        activities: prev.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }))
    }

    const registerUser = ({ name, email, role, sectionId = null }) => {
      const newUser = {
        id: makeId(role === 'instructor' ? 'ins' : 'stu'),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        ...(role === 'student'
          ? { sectionId: sectionId || null }
          : { title: 'Instructor · Computer Programming' }),
      }
      setDb((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
      }))
      return newUser
    }

    const inviteStudentToSection = ({ email, name, sectionId, subjectId = null }) => {
      const cleanEmail = email.trim().toLowerCase()
      const cleanName = name?.trim() || cleanEmail.split('@')[0]
      let createdOrUpdatedUser = null

      setDb((prev) => {
        const existing = prev.users.find((u) => u.email.toLowerCase() === cleanEmail)
        if (existing) {
          createdOrUpdatedUser = {
            ...existing,
            sectionId,
            ...(name?.trim() ? { name: cleanName } : {}),
            ...(subjectId ? { focusSubjectId: subjectId } : {}),
          }
          return {
            ...prev,
            users: prev.users.map((u) => (u.id === existing.id ? createdOrUpdatedUser : u)),
          }
        }

        const newUser = {
          id: makeId('stu'),
          name: cleanName,
          email: cleanEmail,
          role: 'student',
          sectionId,
          ...(subjectId ? { focusSubjectId: subjectId } : {}),
        }
        createdOrUpdatedUser = newUser
        return {
          ...prev,
          users: [...prev.users, newUser],
        }
      })

      return createdOrUpdatedUser
    }

    const removeStudentFromSection = (studentId) => {
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === studentId ? { ...u, sectionId: null } : u,
        ),
      }))
    }

    const resetDemo = () => {
      const seeded = createSeed()
      setDb(seeded)
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(seeded))
      } catch {
        // ignore storage failures
      }
    }

    return {
      db,
      submitActivity,
      gradeSubmission,
      createActivities,
      updateActivity,
      registerUser,
      inviteStudentToSection,
      removeStudentFromSection,
      resetDemo,
    }
  }, [db])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
