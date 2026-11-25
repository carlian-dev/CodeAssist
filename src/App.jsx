import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './store/auth'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Playground from './pages/Playground'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentSection from './pages/student/StudentSection'
import StudentActivity from './pages/student/StudentActivity'
import LearningMaterials from './pages/student/LearningMaterials'
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import InstructorSection from './pages/instructor/InstructorSection'
import CreateActivity from './pages/instructor/CreateActivity'
import ActivityReview from './pages/instructor/ActivityReview'
import InstructorMaterials from './pages/instructor/InstructorMaterials'

function homeFor(role) {
  return role === 'instructor' ? '/instructor' : '/student'
}

function RequireRole({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return children
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          element={
            <RequireRole role="student">
              <Layout />
            </RequireRole>
          }
        >
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/section/:sectionId" element={<StudentSection />} />
          <Route path="/student/activity/:activityId" element={<StudentActivity />} />
          <Route path="/student/materials" element={<LearningMaterials />} />
        </Route>

        <Route
          element={
            <RequireRole role="instructor">
              <Layout />
            </RequireRole>
          }
        >
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/section/:sectionId" element={<InstructorSection />} />
          <Route path="/instructor/section/:sectionId/materials" element={<InstructorMaterials />} />
          <Route path="/instructor/activity/new" element={<CreateActivity />} />
          <Route path="/instructor/activity/:activityId" element={<ActivityReview />} />
        </Route>

        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/playground" element={<Playground />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
