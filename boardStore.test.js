import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardStore } from '../store/boardStore'

// Helper: reset store state before each test
function resetStore() {
  useBoardStore.setState({
    columns: [
      { id: 'col-1', title: 'To Do', color: '#6366f1' },
      { id: 'col-2', title: 'In Progress', color: '#f59e0b' },
    ],
    tasks: [
      { id: 'task-1', title: 'First Task', description: 'desc', columnId: 'col-1', priority: 'high', assignee: 'Alice', createdAt: Date.now() },
      { id: 'task-2', title: 'Second Task', description: 'desc2', columnId: 'col-2', priority: 'low', assignee: 'Bob', createdAt: Date.now() },
    ],
    searchQuery: '',
    filterPriority: 'all',
    deletedTask: null,
  })
}

describe('Board Store — Task Actions', () => {
  beforeEach(resetStore)

  it('adds a new task to the correct column', () => {
    const { addTask, tasks } = useBoardStore.getState()
    const before = tasks.length
    addTask('col-1', { title: 'New Task', priority: 'medium', assignee: 'Carol' })
    const after = useBoardStore.getState().tasks
    expect(after.length).toBe(before + 1)
    expect(after[after.length - 1].columnId).toBe('col-1')
    expect(after[after.length - 1].title).toBe('New Task')
  })

  it('generates a unique id for each new task', () => {
    const { addTask } = useBoardStore.getState()
    addTask('col-1', { title: 'Task A' })
    addTask('col-1', { title: 'Task B' })
    const tasks = useBoardStore.getState().tasks
    const ids = tasks.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('deletes a task by id', () => {
    const { deleteTask } = useBoardStore.getState()
    deleteTask('task-1')
    const tasks = useBoardStore.getState().tasks
    expect(tasks.find((t) => t.id === 'task-1')).toBeUndefined()
  })

  it('stores deleted task for undo', () => {
    const { deleteTask } = useBoardStore.getState()
    deleteTask('task-1')
    const { deletedTask } = useBoardStore.getState()
    expect(deletedTask).not.toBeNull()
    expect(deletedTask.id).toBe('task-1')
  })

  it('restores deleted task on undoDelete', () => {
    const { deleteTask, undoDelete } = useBoardStore.getState()
    deleteTask('task-1')
    undoDelete()
    const tasks = useBoardStore.getState().tasks
    expect(tasks.find((t) => t.id === 'task-1')).toBeDefined()
    expect(useBoardStore.getState().deletedTask).toBeNull()
  })

  it('updates task fields correctly', () => {
    const { updateTask } = useBoardStore.getState()
    updateTask('task-1', { title: 'Updated Title', priority: 'low' })
    const task = useBoardStore.getState().tasks.find((t) => t.id === 'task-1')
    expect(task.title).toBe('Updated Title')
    expect(task.priority).toBe('low')
  })

  it('moves a task to a different column', () => {
    const { moveTask } = useBoardStore.getState()
    moveTask('task-1', 'col-2')
    const task = useBoardStore.getState().tasks.find((t) => t.id === 'task-1')
    expect(task.columnId).toBe('col-2')
  })
})

describe('Board Store — Column Actions', () => {
  beforeEach(resetStore)

  it('adds a new column', () => {
    const { addColumn } = useBoardStore.getState()
    const before = useBoardStore.getState().columns.length
    addColumn('New Column')
    expect(useBoardStore.getState().columns.length).toBe(before + 1)
    expect(useBoardStore.getState().columns.at(-1).title).toBe('New Column')
  })

  it('removes a column and its tasks', () => {
    const { removeColumn } = useBoardStore.getState()
    removeColumn('col-1')
    const state = useBoardStore.getState()
    expect(state.columns.find((c) => c.id === 'col-1')).toBeUndefined()
    expect(state.tasks.filter((t) => t.columnId === 'col-1').length).toBe(0)
  })

  it('renames a column', () => {
    const { renameColumn } = useBoardStore.getState()
    renameColumn('col-1', 'Backlog')
    const col = useBoardStore.getState().columns.find((c) => c.id === 'col-1')
    expect(col.title).toBe('Backlog')
  })
})

describe('Board Store — Filters & Selectors', () => {
  beforeEach(resetStore)

  it('filters tasks by search query', () => {
    const { setSearchQuery, getTasksByColumn } = useBoardStore.getState()
    setSearchQuery('First')
    const tasks = useBoardStore.getState().getTasksByColumn('col-1')
    expect(tasks.length).toBe(1)
    expect(tasks[0].title).toBe('First Task')
  })

  it('returns empty when search matches nothing', () => {
    const { setSearchQuery } = useBoardStore.getState()
    setSearchQuery('xyzxyz')
    const tasks = useBoardStore.getState().getTasksByColumn('col-1')
    expect(tasks.length).toBe(0)
  })

  it('filters tasks by priority', () => {
    const { setFilterPriority } = useBoardStore.getState()
    setFilterPriority('high')
    const tasks = useBoardStore.getState().getTasksByColumn('col-1')
    expect(tasks.every((t) => t.priority === 'high')).toBe(true)
  })

  it('getStats returns correct totals', () => {
    const { getStats } = useBoardStore.getState()
    const stats = getStats()
    expect(stats.total).toBe(2)
    expect(stats.byPriority.high).toBe(1)
    expect(stats.byPriority.low).toBe(1)
  })
})
