export function sectionById(db, id) {
  return db.sections.find((s) => s.id === id) || null
}

export function subjectById(db, id) {
  return db.subjects.find((s) => s.id === id) || null
}

export function userById(db, id) {
  return db.users.find((u) => u.id === id) || null
}

export function studentsInSection(db, sectionId) {
  return db.users.filter((u) => u.role === 'student' && u.sectionId === sectionId)
}

export function activitiesForSection(db, sectionId) {
  return db.activities
    .filter((a) => a.sectionId === sectionId)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

export function submissionFor(db, activityId, studentId) {
  return db.submissions.find((s) => s.activityId === activityId && s.studentId === studentId) || null
}

export function submissionsForActivity(db, activityId) {
  return db.submissions
    .filter((s) => s.activityId === activityId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

export function activityCounts(db, activity) {
  const submissions = submissionsForActivity(db, activity.id)
  const graded = submissions.filter((s) => s.status === 'graded').length
  const pending = submissions.filter((s) => s.status === 'submitted').length
  const total = studentsInSection(db, activity.sectionId).length
  return { submissions: submissions.length, graded, pending, total, missing: Math.max(0, total - submissions.length) }
}

export function sectionCounts(db, sectionId) {
  const students = studentsInSection(db, sectionId)
  const activities = activitiesForSection(db, sectionId)
  const activityIds = new Set(activities.map((a) => a.id))
  const subs = db.submissions.filter((s) => activityIds.has(s.activityId))
  return {
    students: students.length,
    activities: activities.length,
    submissions: subs.length,
    pending: subs.filter((s) => s.status === 'submitted').length,
    graded: subs.filter((s) => s.status === 'graded').length,
  }
}

export function studentSummary(db, student) {
  const activities = activitiesForSection(db, student.sectionId)
  let toDo = 0
  let submitted = 0
  let graded = 0
  let gradeTotal = 0
  activities.forEach((activity) => {
    const sub = submissionFor(db, activity.id, student.id)
    if (!sub) toDo += 1
    else if (sub.status === 'graded') {
      graded += 1
      gradeTotal += sub.grade || 0
    } else submitted += 1
  })
  return {
    activities,
    total: activities.length,
    toDo,
    submitted,
    graded,
    average: graded ? Math.round(gradeTotal / graded) : null,
  }
}

export function subjectProgress(db, student, subjectId) {
  const activities = activitiesForSection(db, student.sectionId).filter((a) => a.subjectId === subjectId)
  let done = 0
  activities.forEach((activity) => {
    if (submissionFor(db, activity.id, student.id)) done += 1
  })
  return { total: activities.length, done, percent: activities.length ? (done / activities.length) * 100 : 0 }
}

export function pendingSubmissions(db, sectionIds) {
  const ids = new Set(sectionIds)
  const activityMap = new Map(db.activities.map((a) => [a.id, a]))
  return db.submissions
    .filter((s) => s.status === 'submitted' && ids.has(activityMap.get(s.activityId)?.sectionId))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}
