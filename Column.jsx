import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useBoardStore } from '../store/boardStore'
import TaskCard from './TaskCard'
import AddTaskForm from './AddTaskForm'

export default function Column({ column }) {
  const { getTasksByColumn, removeColumn, renameColumn } = useBoardStore()
  const tasks = getTasksByColumn(column.id)
  const [addingTask, setAddingTask] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(column.title)
  const [menuOpen, setMenuOpen] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  function saveTitle() {
    if (titleVal.trim()) renameColumn(column.id, titleVal.trim())
    setEditingTitle(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        background: isOver ? `${column.color}10` : 'var(--bg2)',
        border: `1px solid ${isOver ? column.color + '40' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: 16,
        width: 290,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: 'calc(100vh - 180px)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Column header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: column.color, flexShrink: 0 }} />
          {editingTitle ? (
            <input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
              style={{
                background: 'var(--bg4)', border: '1px solid var(--accent)',
                borderRadius: 6, color: 'var(--text)', padding: '2px 8px',
                fontSize: 13, fontWeight: 600, outline: 'none', width: '100%',
              }}
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', cursor: 'text', flex: 1, fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {column.title}
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
            background: column.color + '20', color: column.color, flexShrink: 0,
          }}>
            {tasks.length}
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: 'var(--text3)', padding: '2px 6px', borderRadius: 6, fontSize: 18, lineHeight: 1 }}
          >⋯</button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: 'absolute', right: 0, top: 28, zIndex: 50,
                  background: 'var(--bg4)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: 6, minWidth: 150,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setEditingTitle(true); setMenuOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 7, color: 'var(--text2)', fontSize: 13 }}
                >✏️ Rename Column</button>
                <button
                  onClick={() => { removeColumn(column.id); setMenuOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 7, color: '#ef4444', fontSize: 13 }}
                >🗑️ Delete Column</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 2, minHeight: 60 }}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} columnColor={column.color} />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && !addingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              border: `1.5px dashed ${column.color}30`,
              borderRadius: 10, padding: '20px 16px',
              textAlign: 'center', color: 'var(--text3)', fontSize: 12,
            }}
          >
            Drop tasks here
          </motion.div>
        )}
      </div>

      {/* Add task */}
      <AnimatePresence>
        {addingTask ? (
          <AddTaskForm columnId={column.id} onClose={() => setAddingTask(false)} />
        ) : (
          <motion.button
            onClick={() => setAddingTask(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '8px',
              border: `1px dashed ${column.color}50`,
              borderRadius: 'var(--radius-sm)',
              color: column.color, fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.2s',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Task
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
