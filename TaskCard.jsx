import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoardStore } from '../store/boardStore'

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

const AVATAR_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#3b82f6']
function avatarColor(name) {
  let h = 0; for (const c of (name || '?')) h += c.charCodeAt(0)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default function TaskCard({ task, columnColor }) {
  const { deleteTask, updateTask } = useBoardStore()
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [hovered, setHovered] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const initials = (task.assignee || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  function saveEdit() {
    if (editTitle.trim()) updateTask(task.id, { title: editTitle.trim() })
    setEditing(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') { setEditTitle(task.title); setEditing(false) }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      {...attributes}
      style={{
        transform: style.transform,
        transition: style.transition,
        opacity: isDragging ? 0.4 : 1,
        background: 'var(--bg3)',
        border: `1px solid ${hovered ? columnColor + '40' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Color accent strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: columnColor, borderRadius: '3px 0 0 3px' }} />

      {/* Priority + actions row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          color: prio.color, background: prio.bg, letterSpacing: '0.04em'
        }}>
          {prio.label}
        </span>
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ display: 'flex', gap: 4 }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                title="Edit"
                style={{ padding: '3px 6px', borderRadius: 6, background: 'var(--bg4)', color: 'var(--text2)', fontSize: 13 }}
              >✏️</button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
                title="Delete"
                style={{ padding: '3px 6px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 13 }}
              >🗑️</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title */}
      {editing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%', background: 'var(--bg4)', border: '1px solid var(--accent)',
            borderRadius: 6, color: 'var(--text)', padding: '4px 8px',
            fontSize: 14, fontWeight: 500, outline: 'none',
          }}
          {...{ onClick: e => e.stopPropagation() }}
        />
      ) : (
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}
           {...listeners}>
          {task.title}
        </p>
      )}

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 12 }} {...listeners}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} {...listeners}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {task.assignee && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: avatarColor(task.assignee),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
            title: task.assignee,
          }} title={task.assignee}>
            {initials}
          </div>
        )}
      </div>
    </motion.div>
  )
}
