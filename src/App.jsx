import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './store/auth'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentActivity from './pages/student/StudentActivity'
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import InstructorSection from './pages/instructor/InstructorSection'
import CreateActivity from './pages/instructor/CreateActivity'
import ActivityReview from './pages/instructor/ActivityReview'

function homeFor(role) {
  return role === 'instructor' ? '/instructor' : '/student'
}

function RequireRole({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
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
          <Route path="/student/activity/:activityId" element={<StudentActivity />} />
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
          <Route path="/instructor/activity/new" element={<CreateActivity />} />
          <Route path="/instructor/activity/:activityId" element={<ActivityReview />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
