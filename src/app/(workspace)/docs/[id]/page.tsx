'use client'

import { use, useState, useCallback } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils/date'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DocEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: doc, mutate } = useSWR(`/api/docs/${id}`, fetcher)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [initialized, setInitialized] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        style: 'min-height: 400px; outline: none;',
      },
    },
  })

  // Load content once
  if (doc && editor && !initialized) {
    setTitle(doc.title || '')
    if (doc.content) {
      editor.commands.setContent(doc.content)
    }
    setInitialized(true)
  }

  const handleSave = useCallback(async () => {
    if (!editor) return
    setSaving(true)
    try {
      await fetch(`/api/docs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: editor.getJSON(),
        }),
      })
      toast.success('Saved!')
      mutate()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }, [editor, id, title, mutate])

  if (!doc) return <LoadingSpinner />

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/docs" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Docs
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last saved {doc.updatedAt ? formatDateTime(doc.updatedAt) : 'never'}
          </span>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '8px 16px' }}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled document"
        style={{
          width: '100%',
          fontSize: '2rem',
          fontWeight: 700,
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          outline: 'none',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}
      />

      {/* Type badge */}
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', letterSpacing: '0.05em' }}>
          {doc.type?.replace('_', ' ') || 'General'}
        </span>
      </div>

      {/* Toolbar */}
      {editor && (
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'B', command: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), style: { fontWeight: 700 } },
            { label: 'I', command: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), style: { fontStyle: 'italic' } },
            { label: 'H1', command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
            { label: 'H2', command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
            { label: 'H3', command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
            { label: '• List', command: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
            { label: '1. List', command: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
            { label: '> Quote', command: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
            { label: 'Code', command: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={btn.command}
              className="btn-ghost"
              style={{
                padding: '4px 10px',
                fontSize: '0.8125rem',
                background: btn.active ? 'var(--primary-muted)' : 'transparent',
                color: btn.active ? 'var(--primary)' : 'var(--text-secondary)',
                ...btn.style,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="card" style={{ minHeight: '500px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
