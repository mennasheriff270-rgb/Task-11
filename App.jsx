import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useBoardStore } from './store/boardStore'
import Column from './components/Column'
import StatsBar from './components/StatsBar'
import TaskCard from './components/TaskCard'

export default function App() {
  const {
    columns, tasks, addColumn, moveTask,
    searchQuery, setSearchQuery,
    filterPriority, setFilterPriority,
    deletedTask, undoDelete,
  } = useBoardStore()

  const [activeTask, setActiveTask] = useState(null)
  const [addingCol, setAddingCol] = useState(false)
  const [newColName, setNewColName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart({ active }) {
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over || active.id === over.id) return

    const task = tasks.find(t => t.id === active.id)
    if (!task) return

    // If dropped on a column
    const targetColumn = columns.find(c => c.id === over.id)
    if (targetColumn) { moveTask(task.id, targetColumn.id); return }

    // If dropped on another task
    const overTask = tasks.find(t => t.id === over.id)
    if (overTask && overTask.columnId !== task.columnId) {
      moveTask(task.id, overTask.columnId)
    }
  }

  function handleAddColumn(e) {
    e.preventDefault()
    if (newColName.trim()) {
      addColumn(newColName.trim())
      setNewColName('')
      setAddingCol(false)
    }
  }

  const activeTaskColumn = activeTask ? columns.find(c => c.id === activeTask.columnId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        padding: '16px 28px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>⚡</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>TaskFlow</h1>
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Team Task Board</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 16 }}>🔍</span>
          <input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 10,
              color: 'var(--text)', padding: '8px 14px 8px 38px',
              fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text)', padding: '8px 14px',
            fontSize: 13, outline: 'none',
          }}
        >
          <option value="all">All Priorities</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Tasks: {tasks.length}</span>
        </div>
      </header>

      {/* Stats */}
      <div style={{ padding: '12px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <StatsBar />
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{
          flex: 1, overflowX: 'auto', overflowY: 'hidden',
          padding: '20px 28px',
          display: 'flex', gap: 16, alignItems: 'flex-start',
        }}>
          <AnimatePresence>
            {columns.map(col => (
              <Column key={col.id} column={col} />
            ))}
          </AnimatePresence>

          {/* Add Column */}
          <div style={{ flexShrink: 0 }}>
            <AnimatePresence mode="wait">
              {addingCol ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onSubmit={handleAddColumn}
                  style={{
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: 14, width: 240,
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}
                >
                  <input
                    autoFocus
                    placeholder="Column name"
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    style={{
                      background: 'var(--bg3)', border: '1px solid var(--accent)',
                      borderRadius: 8, color: 'var(--text)', padding: '8px 12px',
                      fontSize: 13, outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={{
                      flex: 1, padding: '7px', borderRadius: 8,
                      background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
                    }}>Add</button>
                    <button type="button" onClick={() => setAddingCol(false)} style={{
                      flex: 1, padding: '7px', borderRadius: 8,
                      background: 'var(--bg4)', color: 'var(--text2)', fontSize: 13,
                    }}>Cancel</button>
                  </div>
                </motion.form>
              ) : (
                <motion.button
                  key="btn"
                  onClick={() => setAddingCol(true)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: 240, padding: '14px',
                    border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text3)', fontSize: 13, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>+</span> Add Column
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div style={{ transform: 'rotate(3deg)', opacity: 0.9 }}>
              <TaskCard
                task={activeTask}
                columnColor={activeTaskColumn?.color || '#6366f1'}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Undo Toast */}
      <AnimatePresence>
        {deletedTask && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg4)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              Task "<strong style={{ color: 'var(--text)' }}>{deletedTask.title}</strong>" deleted
            </span>
            <button
              onClick={undoDelete}
              style={{
                padding: '5px 14px', borderRadius: 8,
                background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
              }}
            >Undo</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
