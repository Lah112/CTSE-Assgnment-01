import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar  from './TopBar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-8 overflow-auto">
          {/* React Router renders the matched child route here */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
