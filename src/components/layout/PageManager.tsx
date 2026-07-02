import { useState, useRef, useEffect } from 'react'
import { useDocumentStore } from '@/stores/documentStore'

export function PageManager() {
  const { project, createPage, switchPage, deletePage, renamePage, dismissWarning } = useDocumentStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const startRename = (pageId: string, currentName: string) => {
    setEditingId(pageId)
    setEditName(currentName)
  }

  const commitRename = () => {
    if (editingId && editName.trim()) {
      renamePage(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleDeleteClick = (pageId: string) => {
    if (project.pages.length <= 1) return
    setConfirmDeleteId(pageId)
  }

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deletePage(confirmDeleteId)
      setConfirmDeleteId(null)
    }
  }

  const cancelDelete = () => {
    setConfirmDeleteId(null)
  }

  return (
    <div
      className="flex-shrink-0"
      style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* localStorage warning */}
      {!project.warningDismissed && (
        <div
          className="flex items-center justify-between px-4 py-1.5 text-[10px]"
          style={{
            background: 'rgba(226, 168, 62, 0.08)',
            color: 'var(--accent)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <span>
            Your pages are stored in your browser&apos;s local storage and may be lost if you clear your browser data.
          </span>
          <button
            onClick={() => dismissWarning()}
            className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            title="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Page tabs */}
      <div className="flex items-center px-3 py-1 gap-1 overflow-x-auto">
        {project.pages.map((page) => {
          const isActive = page.id === project.activePageId
          const isEditing = editingId === page.id

          return (
            <div
              key={page.id}
              className="flex items-center group rounded-md transition-all duration-150 flex-shrink-0"
              style={{
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                border: isActive ? '1px solid var(--accent-soft)' : '1px solid transparent',
              }}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') {
                      setEditingId(null)
                      setEditName('')
                    }
                  }}
                  className="px-2.5 py-1 text-xs bg-transparent outline-none w-[100px]"
                  style={{ color: 'var(--text-ui)' }}
                />
              ) : (
                <button
                  onClick={() => switchPage(page.id)}
                  onDoubleClick={() => startRename(page.id, page.name)}
                  className="px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-ui-dim)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--text-ui)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--text-ui-dim)'
                  }}
                  title="Double-click to rename"
                >
                  {page.name}
                </button>
              )}
              {project.pages.length > 1 && confirmDeleteId !== page.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(page.id)
                  }}
                  className="pr-1.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                  style={{ color: '#ef4444' }}
                  title="Delete page"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {confirmDeleteId === page.id && (
                <div className="flex items-center gap-1 px-1.5">
                  <span className="text-[10px] whitespace-nowrap" style={{ color: '#ef4444' }}>
                    Delete?
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmDelete() }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelDelete() }}
                    className="px-1.5 py-0.5 rounded text-[10px] transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-ui-dim)' }}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* New page button */}
        <button
          onClick={() => createPage()}
          className="flex-shrink-0 px-2 py-1 rounded-md text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 ml-1"
          style={{
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            border: '1px solid transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
        >
          + New Page
        </button>
      </div>
    </div>
  )
}
