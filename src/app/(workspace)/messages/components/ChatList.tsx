'use client'

import useSWR from 'swr'
import { Plus, Search, Users, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import NewChatDialog from '@/app/(workspace)/messages/components/NewChatDialog'
import { getInitials } from '@/lib/utils/format'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ChatList({ 
  activeChatId, 
  onSelectChat 
}: { 
  activeChatId: string | null
  onSelectChat: (id: string) => void 
}) {
  const { data: session } = useSession()
  const [showNewChat, setShowNewChat] = useState(false)
  
  // Use SWR to poll for chats every 5 seconds (simulating real-time updates)
  const { data: chats, error, mutate } = useSWR('/api/chats', fetcher, { refreshInterval: 5000 })

  if (error) return <div style={{ padding: '20px', color: 'var(--danger-600)' }}>Failed to load chats</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Messages</h2>
        <button 
          onClick={() => setShowNewChat(true)}
          className="btn-ghost" 
          style={{ width: '32px', height: '32px', padding: 0 }}
          title="New Chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {!chats ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
            No conversations yet. Start a new one!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {chats.map((chat: any) => {
              const isActive = activeChatId === chat._id
              
              // For direct messages, get the other user's name
              let name = chat.name;
              let initials = 'G';
              let isGroup = chat.isGroup;

              if (!isGroup && session?.user) {
                 const otherUser = chat.participants.find((p: any) => p._id !== session.user.id)
                 if (otherUser) {
                    name = otherUser.name;
                    initials = getInitials(name || 'U');
                 } else {
                    name = "Just You";
                    initials = getInitials(name);
                 }
              } else if (isGroup) {
                 initials = getInitials(name || 'G');
              }

              return (
                <button
                  key={chat._id}
                  onClick={() => onSelectChat(chat._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    background: isActive ? 'var(--brand-50)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  className="hover:bg-[var(--bg-elevated)]"
                >
                  {/* Avatar */}
                  <div style={{
                     width: '40px',
                     height: '40px',
                     borderRadius: '50%',
                     background: isGroup ? 'var(--brand-100)' : 'var(--bg-inactive)',
                     color: isGroup ? 'var(--brand-700)' : 'var(--text-secondary)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '14px',
                     fontWeight: 600,
                     flexShrink: 0
                  }}>
                    {isGroup ? <Users size={18} /> : initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ 
                        fontWeight: 500, 
                        fontSize: '14px', 
                        color: isActive ? 'var(--brand-900)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {name}
                      </span>
                      {chat.lastMessageAt && (
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                           {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {chat.latestMessage?.content || <span style={{ fontStyle: 'italic' }}>New conversation</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatDialog 
          onClose={() => setShowNewChat(false)} 
          onChatCreated={(chatId: string) => {
             mutate() // Refresh list
             onSelectChat(chatId)
             setShowNewChat(false)
          }}
        />
      )}
    </div>
  )
}
