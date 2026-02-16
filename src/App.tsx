import { useState, useCallback } from 'react'
import { MaiTree } from './components/MaiTree'
import { MemberModal } from './components/MemberModal'
import { useMembers } from './hooks/useMembers'
import type { Member } from './types'

function App() {
  const { members, loading, isDemo } = useMembers()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const handleNodeClick = useCallback((member: Member) => {
    setSelectedMember(member)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedMember(null)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        {isDemo && (
          <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded text-xs">
            Demo Mode
          </div>
        )}
      </header>

      {/* Interactive Tree */}
      <div className="relative z-10 h-full">
        <MaiTree members={members} onNodeClick={handleNodeClick} />
      </div>

      {/* Modal */}
      {selectedMember && (
        <MemberModal member={selectedMember} onClose={handleCloseModal} />
      )}

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center pointer-events-none z-20">
        <p className="text-yellow-300/90 text-sm font-medium">
          Click on a lucky coin to see greetings
        </p>
      </footer>
    </div>
  )
}

export default App
