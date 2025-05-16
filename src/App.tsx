import { Routes, Route } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"

// Componentes de layout
import { Sidebar } from '@/components/ui/sidebar'

// Páginas
import Dashboard from '@/pages/Index'
import Opportunities from '@/pages/Opportunities'
import OpportunityDetail from '@/pages/OpportunityDetail'
import Partners from '@/pages/Partners'

function App() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/partners" element={<Partners />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  )
}

export default App
