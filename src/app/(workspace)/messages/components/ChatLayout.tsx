'use client'

import { useState } from 'react'
import ChatList from '@/app/(workspace)/messages/components/ChatList'
import ChatWindow from '@/app/(workspace)/messages/components/ChatWindow'


export default function ChatLayout() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  return (
    <>
      {/* Sidebar: Chat List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)'
      }}>
        <ChatList activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      </div>

      {/* Main Content: Active Chat */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-elevated)',
        minWidth: 0
      }}>
        {activeChatId ? (
          <ChatWindow chatId={activeChatId} />
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--brand-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-600)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 500 }}>Select a conversation</p>
            <p style={{ fontSize: '13px' }}>Choose a chat from the list or start a new one.</p>
          </div>
        )}
      </div>
    </>
  )
}
