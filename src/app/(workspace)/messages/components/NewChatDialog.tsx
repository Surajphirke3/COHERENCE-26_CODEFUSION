'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getInitials } from '@/lib/utils/format'
import { toast } from 'sonner'

export default function NewChatDialog({ 
  onClose, 
  onChatCreated 
}: { 
  onClose: () => void
  onChatCreated: (chatId: string) => void
}) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(data => {
         // Filter out current user from list
         setUsers(data?.filter((u: any) => u._id !== session?.user?.id) || [])
         setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load users', err)
        setLoading(false)
      })
  }, [session])

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      if (!isGroup && newSelected.size >= 1) {
         // for direct messages, only allow 1 selection
         newSelected.clear()
      }
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedUsers.size === 0) {
      toast.error('Select at least one user')
      return
    }
    if (isGroup && !groupName.trim()) {
      toast.error('Group name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isGroup,
          name: isGroup ? groupName : undefined,
          participantIds: Array.from(selectedUsers)
        })
      })

      const data = await res.json()
      if (res.ok) {
        onChatCreated(data._id)
      } else {
        toast.error(data.error || 'Failed to create chat')
      }
    } catch (error) {
       toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-elevated)',
        width: '100%',
        maxWidth: '500px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>New Conversation</h2>
          <button 
             onClick={onClose} 
             className="btn-ghost" 
             style={{ padding: '4px', width: 'auto', height: 'auto' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Main area */}
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* Type Toggle */}
             <div style={{ display: 'flex', background: 'var(--bg-base)', padding: '4px', borderRadius: 'var(--radius)' }}>
               <button
                 type="button"
                 onClick={() => { setIsGroup(false); setSelectedUsers(new Set()) }}
                 style={{
                   flex: 1,
                   padding: '8px',
                   borderRadius: 'var(--radius-sm)',
                   background: !isGroup ? 'var(--bg-elevated)' : 'transparent',
                   color: !isGroup ? 'var(--brand-700)' : 'var(--text-secondary)',
                   border: !isGroup ? '1px solid var(--border-subtle)' : 'none',
                   fontWeight: !isGroup ? 600 : 400,
                   fontSize: '14px',
                   cursor: 'pointer',
                   boxShadow: !isGroup ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                 }}
               >
                 Direct Message
               </button>
               <button
                 type="button"
                 onClick={() => setIsGroup(true)}
                 style={{
                   flex: 1,
                   padding: '8px',
                   borderRadius: 'var(--radius-sm)',
                   background: isGroup ? 'var(--bg-elevated)' : 'transparent',
                   color: isGroup ? 'var(--brand-700)' : 'var(--text-secondary)',
                   border: isGroup ? '1px solid var(--border-subtle)' : 'none',
                   fontWeight: isGroup ? 600 : 400,
                   fontSize: '14px',
                   cursor: 'pointer',
                   boxShadow: isGroup ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                 }}
               >
                 Group Chat
               </button>
             </div>

             {/* Group Name Input */}
             {isGroup && (
               <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Group Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="E.g., Design Team..."
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    required={isGroup}
                  />
               </div>
             )}

             {/* User Search & Selection */}
             <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Select People {isGroup ? '(Multiple)' : ''}
                </label>
                
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  padding: '4px',
                  background: 'var(--bg-base)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading members...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No users found.</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <label 
                        key={user._id} 
                        style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: '12px',
                           padding: '10px 12px',
                           borderRadius: 'var(--radius-sm)',
                           cursor: 'pointer',
                           background: selectedUsers.has(user._id) ? 'var(--brand-50)' : 'transparent',
                           transition: 'all 150ms ease'
                        }}
                        className="hover:bg-[var(--bg-elevated)]"
                      >
                         <input 
                           type={isGroup ? 'checkbox' : 'radio'}
                           name="user"
                           checked={selectedUsers.has(user._id)}
                           onChange={() => toggleUser(user._id)}
                           style={{ width: '16px', height: '16px', accentColor: 'var(--brand-600)' }}
                         />
                         <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-inactive)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                         }}>
                           {getInitials(user.name)}
                         </div>
                         <div>
                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{user.email}</div>
                         </div>
                      </label>
                    ))
                  )}
                </div>
             </div>

          </div>
          
          {/* Footer */}
          <div style={{
             padding: '20px 24px',
             borderTop: '1px solid var(--border-subtle)',
             display: 'flex',
             justifyContent: 'flex-end',
             gap: '12px'
          }}>
             <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
             </button>
             <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting || selectedUsers.size === 0 || (isGroup && !groupName.trim())}
             >
                {isSubmitting ? 'Creating...' : 'Create Chat'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
