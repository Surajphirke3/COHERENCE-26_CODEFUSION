'use client'

import useSWR from 'swr'
import { useState, useRef, useEffect } from 'react'
import { Send, Users, ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { getInitials } from '@/lib/utils/format'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ChatWindow({ chatId }: { chatId: string }) {
  const { data: session } = useSession()
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Poll for messages every 3 seconds for active chat
  const { data, error, mutate } = useSWR(`/api/chats/${chatId}`, fetcher, { refreshInterval: 3000 })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })
      if (res.ok) {
        setNewMessage('')
        mutate() // Re-fetch immediately
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  if (error) return <div style={{ padding: '20px', color: 'var(--danger-600)' }}>Failed to load chat</div>
  if (!data) return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading message...</div>

  const { chat, messages } = data

  let chatName = chat.name
  let isGroup = chat.isGroup
  if (!isGroup && session?.user) {
    const otherUser = chat.participants.find((p: any) => p._id !== session?.user?.id)
    chatName = otherUser ? otherUser.name : 'Just You'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-base)',
        gap: '12px'
      }}>
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
        }}>
          {isGroup ? <Users size={18} /> : getInitials(chatName || 'C')}
        </div>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{chatName}</h2>
          {isGroup && (
             <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
               {chat.participants.length} participants
             </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 ? (
           <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No messages yet. Say hi!
           </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.senderId._id === session?.user?.id
            
            return (
              <div 
                key={msg._id} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: '8px'
                }}
              >
                {!isMe && isGroup && (
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px', marginLeft: '4px' }}>
                    {msg.senderId.name}
                  </span>
                )}
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  background: isMe ? 'var(--brand-600)' : 'var(--bg-inactive)',
                  color: isMe ? 'white' : 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-quaternary)', marginTop: '4px' }}>
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ flex: 1, borderRadius: '24px', paddingLeft: '20px' }}
            disabled={isSending}
          />
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, flexShrink: 0 }}
            disabled={!newMessage.trim() || isSending}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
