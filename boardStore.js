import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

// AI-Architected State Structure
// Board → Columns → Tasks (hierarchical with normalized lookups)
const initialColumns = [
  { id: 'col-1', title: 'To Do', color: '#6366f1' },
  { id: 'col-2', title: 'In Progress', color: '#f59e0b' },
  { id: 'col-3', title: 'Review', color: '#8b5cf6' },
  { id: 'col-4', title: 'Done', color: '#10b981' },
]

const initialTasks = [
  { id: 'task-1', title: 'Design system setup', description: 'Create color tokens, typography, spacing scale', columnId: 'col-1', priority: 'high', assignee: 'Sara', createdAt: Date.now() - 86400000 * 3 },
  { id: 'task-2', title: 'API integration', description: 'Connect backend endpoints to frontend services', columnId: 'col-1', priority: 'medium', assignee: 'Ahmed', createdAt: Date.now() - 86400000 * 2 },
  { id: 'task-3', title: 'Auth flow', description: 'JWT login, refresh tokens, protected routes', columnId: 'col-2', priority: 'high', assignee: 'Sara', createdAt: Date.now() - 86400000 },
  { id: 'task-4', title: 'Dashboard analytics', description: 'Charts, KPIs, real-time data updates', columnId: 'col-2', priority: 'low', assignee: 'Omar', createdAt: Date.now() - 3600000 * 5 },
  { id: 'task-5', title: 'Unit tests', description: 'Vitest coverage for store and utilities', columnId: 'col-3', priority: 'medium', assignee: 'Ahmed', createdAt: Date.now() - 3600000 * 2 },
  { id: 'task-6', title: 'Landing page', description: 'Hero, features, pricing, CTA sections', columnId: 'col-4', priority: 'low', assignee: 'Omar', createdAt: Date.now() - 86400000 * 7 },
]

export const useBoardStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────
  columns: initialColumns,
  tasks: initialTasks,
  searchQuery: '',
  filterPriority: 'all',
  deletedTask: null, // for undo

  // ── Column Actions ─────────────────────────────────────────────
  addColumn: (title) => {
    const colors = ['#6366f1', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6']
    const color = colors[get().columns.length % colors.length]
    set((state) => ({
      columns: [...state.columns, { id: uuidv4(), title, color }],
    }))
  },

  removeColumn: (columnId) => {
    set((state) => ({
      columns: state.columns.filter((c) => c.id !== columnId),
      tasks: state.tasks.filter((t) => t.columnId !== columnId),
    }))
  },

  renameColumn: (columnId, newTitle) => {
    set((state) => ({
      columns: state.columns.map((c) =>
        c.id === columnId ? { ...c, title: newTitle } : c
      ),
    }))
  },

  // ── Task Actions ───────────────────────────────────────────────
  addTask: (columnId, { title, description = '', priority = 'medium', assignee = '' }) => {
    const task = { id: uuidv4(), title, description, columnId, priority, assignee, createdAt: Date.now() }
    set((state) => ({ tasks: [...state.tasks, task] }))
    return task
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }))
  },

  deleteTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId)
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      deletedTask: task,
    }))
  },

  undoDelete: () => {
    const { deletedTask } = get()
    if (deletedTask) {
      set((state) => ({
        tasks: [...state.tasks, deletedTask],
        deletedTask: null,
      }))
    }
  },

  moveTask: (taskId, newColumnId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, columnId: newColumnId } : t
      ),
    }))
  },

  // ── Filters ────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterPriority: (p) => set({ filterPriority: p }),

  // ── Selectors ─────────────────────────────────────────────────
  getTasksByColumn: (columnId) => {
    const { tasks, searchQuery, filterPriority } = get()
    return tasks
      .filter((t) => t.columnId === columnId)
      .filter((t) => searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
  },

  getStats: () => {
    const { tasks, columns } = get()
    return {
      total: tasks.length,
      byColumn: columns.map((c) => ({
        ...c,
        count: tasks.filter((t) => t.columnId === c.id).length,
      })),
      byPriority: {
        high: tasks.filter((t) => t.priority === 'high').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        low: tasks.filter((t) => t.priority === 'low').length,
      },
    }
  },
}))
