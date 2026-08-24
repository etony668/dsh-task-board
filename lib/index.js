// DSH 项目任务看板 — host half.
// 正式 cordis 插件：存储 + 模型工具 + 技能 + 浏览器视图用的 HTTP 路由。
// 数据根目录：$DSH_HOME/taskboards（缺省 ~/.dsh/taskboards），按项目 sha256 命名 JSON，与 CodexFF 格式一致。
import { createHash, randomUUID } from 'node:crypto'
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'task-board'
let lastProjectPath = null
export const inject = ['tools', 'skills', 'webServer', 'sessions']

// ---------- 存储根 ----------
function storageRoot() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'taskboards')
}

// ---------- 基础工具 ----------
function normalizeProject(value) {
  const text = String(value ?? '').trim()
  if (!text) throw new Error('project_path is required')
  if (text.charAt(0) !== '/') throw new Error('project_path must be an absolute path')
  return text
}

function projectName(project) {
  const parts = String(project).replace(/\/+$/, '').split('/')
  return parts[parts.length - 1] || '当前项目'
}

function emptyBoard(project) {
  return { project_path: project, project_name: projectName(project), revision: 0, updated_at_ms: 0, tasks: [], layout: { positions: {}, layers: {} } }
}

function touch(board) {
  board.revision = Number(board.revision || 0) + 1
  board.updated_at_ms = Date.now()
}

function normalizeBoard(board, project) {
  if (!board || typeof board !== 'object') board = {}
  board.project_path = project
  board.project_name = board.project_name || projectName(project)
  board.tasks = Array.isArray(board.tasks) ? board.tasks : []
  for (const task of board.tasks) {
    task.details = typeof task.details === 'string' ? task.details : ''
    task.boundary = typeof task.boundary === 'string' ? task.boundary : ''
    task.kind = task.kind === 'temporary' ? 'temporary' : task.parent_id ? 'subtask' : 'main'
  }
  return board
}

function copyBoard(board) {
  return {
    project_path: board.project_path,
    project_name: board.project_name,
    revision: board.revision,
    updated_at_ms: board.updated_at_ms,
    tasks: board.tasks.map((task) => ({ ...task })),
    layout: board.layout && typeof board.layout === 'object' ? JSON.parse(JSON.stringify(board.layout)) : null,
  }
}

// ---------- 看板引擎（CodexFF server.mjs 移植） ----------
function alphaCode(index) {
  let output = ''
  while (true) {
    output = String.fromCharCode(65 + (index % 26)) + output
    if (index < 26) return output
    index = Math.floor(index / 26) - 1
  }
}

function nextCode(board, parentId) {
  const siblings = board.tasks.filter((task) => (task.parent_id || null) === (parentId || null))
  if (!parentId) return alphaCode(siblings.length)
  const parent = board.tasks.find((task) => task.id === parentId)
  const parentCode = parent && parent.code || 'T'
  const separated = parentCode.includes('_') || /\d$/.test(parentCode)
  return separated ? parentCode + '_' + (siblings.length + 1) : parentCode + siblings.length
}

function defaultPosition(board, parentId) {
  const siblings = board.tasks.filter((task) => (task.parent_id || null) === (parentId || null))
  if (!parentId) return { x: 80 + siblings.length * 300, y: 80 }
  const parent = board.tasks.find((task) => task.id === parentId)
  return { x: (parent && parent.x || 80) + siblings.length * 260, y: (parent && parent.y || 80) + 190 }
}

function recodeSubtree(board, taskId) {
  const task = board.tasks.find((item) => item.id === taskId)
  if (!task) return
  const siblings = board.tasks
    .filter((item) => (item.parent_id || null) === (task.parent_id || null))
    .sort((left, right) =>
      Number(left.created_at_ms || 0) - Number(right.created_at_ms || 0)
      || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
  const index = Math.max(0, siblings.findIndex((item) => item.id === task.id))
  if (!task.parent_id) {
    task.code = alphaCode(index)
  } else {
    const parent = board.tasks.find((item) => item.id === task.parent_id)
    const parentCode = parent && parent.code || 'T'
    task.code = parentCode.includes('_') || /\d$/.test(parentCode)
      ? parentCode + '_' + (index + 1)
      : parentCode + index
  }
  for (const child of board.tasks.filter((item) => item.parent_id === task.id)) {
    recodeSubtree(board, child.id)
  }
}

function clearIncompleteAncestors(board, parentId) {
  let currentId = parentId || null
  while (currentId) {
    const parent = board.tasks.find((item) => item.id === currentId)
    if (!parent) break
    parent.completed = false
    parent.updated_at_ms = Date.now()
    currentId = parent.parent_id || null
  }
}

function createTaskInBoard(board, args, parentId) {
  const resolvedParent = parentId === undefined ? (args && args.parent_id || null) : parentId
  if (resolvedParent && !board.tasks.some((task) => task.id === resolvedParent)) {
    throw new Error('parent task not found: ' + resolvedParent)
  }
  const title = String(args && args.title || '').trim()
  if (!title) throw new Error('title is required')
  const position = defaultPosition(board, resolvedParent)
  const now = Date.now()
  const task = {
    id: randomUUID(),
    code: nextCode(board, resolvedParent),
    parent_id: resolvedParent,
    title,
    details: String(args && args.details || '').trim(),
    boundary: String(args && args.boundary || '').trim(),
    kind: args && args.kind === 'temporary' ? 'temporary' : resolvedParent ? 'subtask' : 'main',
    completed: Boolean(args && args.completed),
    x: position.x,
    y: position.y,
    created_at_ms: now,
    updated_at_ms: now,
  }
  board.tasks.push(task)
  clearIncompleteAncestors(board, resolvedParent)
  return task
}

function updateTaskInBoard(board, args) {
  const task = board.tasks.find((item) => item.id === args.task_id)
  if (!task) throw new Error('task not found: ' + args.task_id)
  if (args.parent_id !== undefined) {
    const parentId = args.parent_id || null
    if (parentId) {
      if (parentId === task.id) throw new Error('task cannot be its own parent')
      const parent = board.tasks.find((item) => item.id === parentId)
      if (!parent) throw new Error('parent task not found: ' + parentId)
      const pending = [task.id]
      while (pending.length > 0) {
        const ancestor = pending.shift()
        for (const child of board.tasks.filter((item) => item.parent_id === ancestor)) {
          if (child.id === parentId) throw new Error('task parent would create a cycle')
          pending.push(child.id)
        }
      }
    }
    task.parent_id = parentId
    task.kind = args.kind === 'temporary' ? 'temporary' : parentId ? 'subtask' : 'main'
    recodeSubtree(board, task.id)
  }
  if (args.title !== undefined) {
    const title = String(args.title).trim()
    if (!title) throw new Error('title is required')
    task.title = title
  }
  if (args.details !== undefined) task.details = String(args.details || '').trim()
  if (args.boundary !== undefined) task.boundary = String(args.boundary || '').trim()
  if (args.kind !== undefined) {
    task.kind = args.kind === 'temporary' ? 'temporary' : task.parent_id ? 'subtask' : 'main'
  }
  if (args.completed !== undefined) {
    task.completed = Boolean(args.completed)
    if (!task.completed) clearIncompleteAncestors(board, task.parent_id)
  }
  if (args.x !== undefined) task.x = Math.max(0, Number(args.x) || 0)
  if (args.y !== undefined) task.y = Math.max(0, Number(args.y) || 0)
  task.updated_at_ms = Date.now()
  if (!task.completed) clearIncompleteAncestors(board, task.parent_id)
  return task
}

function deleteTaskInBoard(board, taskId) {
  const ids = [taskId]
  for (let index = 0; index < ids.length; index += 1) {
    for (const task of board.tasks) {
      if (task.parent_id === ids[index] && !ids.includes(task.id)) ids.push(task.id)
    }
  }
  const before = board.tasks.length
  board.tasks = board.tasks.filter((task) => !ids.includes(task.id))
  if (before === board.tasks.length) throw new Error('task not found: ' + taskId)
  return ids.length
}

function syncBoard(board, operations) {
  const createdByKey = {}
  for (const operation of operations) {
    const action = String(operation && operation.action || '')
    if (action === 'create') {
      const key = String(operation.key || '').trim()
      if (key && createdByKey[key]) throw new Error('duplicate operation key: ' + key)
      const parentKey = String(operation.parent_key || '').trim()
      const parentId = parentKey ? createdByKey[parentKey] : (operation.parent_id || null)
      if (parentKey && !parentId) throw new Error('parent operation key not found: ' + parentKey)
      const task = createTaskInBoard(board, operation, parentId)
      if (key) createdByKey[key] = task.id
    } else if (action === 'update') {
      updateTaskInBoard(board, operation)
    } else {
      throw new Error('unsupported sync action: ' + (action || '(empty)'))
    }
  }
  return { created_by_key: createdByKey }
}

// ---------- 持久化（每项目一个原子写 JSON；进程内按项目串行） ----------
const lockChains = new Map()

function withLock(project, op) {
  const key = project
  const previous = lockChains.get(key) || Promise.resolve()
  const run = previous.then(op, op)
  const tail = run.then(() => undefined, () => undefined)
  lockChains.set(key, tail)
  const settle = () => { if (lockChains.get(key) === tail) lockChains.delete(key) }
  run.then(settle, settle)
  return run
}

async function ensureStoreDir() {
  await mkdir(storageRoot(), { recursive: true })
}

async function loadBoard(project) {
  await ensureStoreDir()
  const target = join(storageRoot(), createHash('sha256').update(project).digest('hex') + '.json')
  let text
  try {
    text = await readFile(target, 'utf8')
  } catch (error) {
    if (error && error.code === 'ENOENT') return emptyBoard(project)
    throw error
  }
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (error) {
    throw new Error('看板数据文件损坏: ' + String(error && error.message || error))
  }
  return normalizeBoard(parsed, project)
}

async function saveBoard(board) {
  await ensureStoreDir()
  const target = join(storageRoot(), createHash('sha256').update(board.project_path).digest('hex') + '.json')
  const temp = target + '.' + process.pid + '.' + Date.now() + '.tmp'
  await writeFile(temp, JSON.stringify(board, null, 2) + '\n', 'utf8')
  await rename(temp, target)
}

// ---------- 业务入口 ----------
function ops() {
  return {
    layoutSave: (args) => withLock(normalizeProject(args.projectPath), async () => {
      const board = await loadBoard(normalizeProject(args.projectPath))
      board.layout = args.layout && typeof args.layout === 'object' ? args.layout : { positions: {}, layers: {} }
      await saveBoard(board)
      return { ok: true }
    }),
    get: (args) => withLock(normalizeProject(args.projectPath), async () => {
      return { board: copyBoard(await loadBoard(normalizeProject(args.projectPath))) }
    }),
    revision: (args) => withLock(normalizeProject(args.projectPath), async () => {
      const board = await loadBoard(normalizeProject(args.projectPath))
      return { revision: board.revision, updated_at_ms: board.updated_at_ms, project_path: board.project_path, project_name: board.project_name }
    }),
    create: (args) => withLock(normalizeProject(args.projectPath), async () => {
      const project = normalizeProject(args.projectPath)
      const board = await loadBoard(project)
      createTaskInBoard(board, args, args.parent_id || null)
      touch(board)
      await saveBoard(board)
      return { board: copyBoard(board) }
    }),
    update: (args) => withLock(normalizeProject(args.projectPath), async () => {
      const project = normalizeProject(args.projectPath)
      const board = await loadBoard(project)
      updateTaskInBoard(board, Object.assign({}, args.patch || {}, { task_id: args.taskId }))
      touch(board)
      await saveBoard(board)
      return { board: copyBoard(board) }
    }),
    delete: (args) => withLock(normalizeProject(args.projectPath), async () => {
      const project = normalizeProject(args.projectPath)
      const board = await loadBoard(project)
      deleteTaskInBoard(board, args.taskId)
      touch(board)
      await saveBoard(board)
      return { board: copyBoard(board) }
    }),
    sync: (args) => withLock(normalizeProject(args.projectPath), async () => {
      const project = normalizeProject(args.projectPath)
      const operations = Array.isArray(args.operations) ? args.operations : []
      if (operations.length === 0) throw new Error('operations are required')
      if (operations.length > 200) throw new Error('too many operations (max 200)')
      const board = await loadBoard(project)
      const extra = syncBoard(board, operations)
      touch(board)
      await saveBoard(board)
      return { board: Object.assign(copyBoard(board), { created_by_key: extra.created_by_key }) }
    }),
    init: async (args, sessions) => {
      const sessionId = args.sessionId ? String(args.sessionId) : ''
      let cwd = null
      if (sessions && sessionId) {
        const session = sessions.get(sessionId)
        const header = session && session.header
        if (header && typeof header.cwd === 'string' && header.cwd) cwd = header.cwd
      }
      if (!cwd) throw new Error('无法确定当前会话的项目工作目录')
      return ops().get({ projectPath: cwd }).then((result) => ({
        projectPath: cwd,
        projectName: result.board.project_name,
        board: result.board,
      }))
    },
  }
}

// ---------- apply ----------
export function apply(ctx) {
  const tools = ctx.get('tools')
  const skills = ctx.get('skills')
  const webServer = ctx.get('webServer')
  const sessions = ctx.get('sessions')

  const jsonRender = (args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }]
  const output = { schema: { type: 'object', additionalProperties: true }, render: jsonRender }
  const projectPathProperty = { type: 'string', description: 'Absolute path of the project root (= session working directory)' }
  const pathSchema = (extraProperties, required) => ({
    type: 'object',
    properties: Object.assign({ project_path: projectPathProperty }, extraProperties || {}),
    required: required || ['project_path'],
  })
  const taskFields = {
    parent_id: { type: 'string', description: 'Parent task id; omit for a top-level task' },
    title: { type: 'string', description: 'Task title' },
    details: { type: 'string', description: 'Task details / working notes' },
    boundary: { type: 'string', description: 'Task boundary: goal / scope / out of scope / acceptance criteria' },
    kind: { type: 'string', enum: ['main', 'subtask', 'temporary'], description: 'Task kind' },
    completed: { type: 'boolean', description: 'Whether the task is completed' },
  }

  const defs = [
    {
      name: 'board_get',
      description: 'Read the local parent/child task tree of the current project (read-only, no network access).',
      parameters: pathSchema(null, ['project_path']),
      execute: async (args) => (await ops().get({ projectPath: args.project_path })).board,
    },
    {
      name: 'board_revision',
      description: 'Read only the board revision; call it before board_get to check whether the data changed.',
      parameters: pathSchema(null, ['project_path']),
      execute: async (args) => ops().revision({ projectPath: args.project_path }),
    },
    {
      name: 'board_sync',
      description: 'Atomically create or update multiple tasks under one lock and one disk write; supports operation key / parent_key references within the same call. Never deletes.',
      parameters: {
        type: 'object',
        properties: {
          project_path: projectPathProperty,
          operations: {
            type: 'array',
            description: 'Operations list (1-200 items)',
            items: {
              oneOf: [
                {
                  type: 'object',
                  properties: Object.assign({ action: { const: 'create', description: 'create operation', type: 'string' }, key: { type: 'string', description: 'reference key within this batch' }, parent_key: { type: 'string', description: 'reference key of a task created in this batch' } }, taskFields),
                  required: ['action', 'title'],
                },
                {
                  type: 'object',
                  properties: Object.assign({ action: { const: 'update', description: 'update operation', type: 'string' }, task_id: { type: 'string' } }, taskFields, { x: { type: 'number' }, y: { type: 'number' } }),
                  required: ['action', 'task_id'],
                },
              ],
            },
          },
        },
        required: ['project_path', 'operations'],
      },
      execute: async (args) => (await ops().sync({ projectPath: args.project_path, operations: args.operations })).board,
    },
    {
      name: 'task_create',
      description: 'Create a task in the current project board and return the updated board.',
      parameters: pathSchema(Object.assign({}, taskFields, { title: { type: 'string', description: 'Task title (required)' } }), ['project_path', 'title']),
      execute: async (args) => (await ops().create({ projectPath: args.project_path, parentId: args.parent_id, title: args.title, details: args.details, boundary: args.boundary, kind: args.kind, completed: args.completed })).board,
    },
    {
      name: 'task_update',
      description: 'Update title, boundary, completion state or canvas position.',
      parameters: pathSchema(Object.assign({}, taskFields, { task_id: { type: 'string', description: 'Task id (required)' }, x: { type: 'number' }, y: { type: 'number' } }), ['project_path', 'task_id']),
      execute: async (args) => {
        const payload = { project_path: args.project_path, task_id: args.task_id, parent_id: args.parent_id, title: args.title, details: args.details, boundary: args.boundary, kind: args.kind, completed: args.completed, x: args.x, y: args.y }
        return (await ops().update({ projectPath: args.project_path, taskId: args.task_id, patch: payload })).board
      },
    },
    {
      name: 'task_delete',
      description: 'Permanently delete a task and all its descendants; returns the updated board.',
      parameters: pathSchema({ task_id: { type: 'string', description: 'Task id (required)' } }, ['project_path', 'task_id']),
      execute: async (args) => (await ops().delete({ projectPath: args.project_path, taskId: args.task_id })).board,
    },
  ]

  if (tools !== undefined) {
    for (const def of defs) {
      tools.register({ ...def, output })
    }
  }

  if (skills !== undefined) {
    const body = [
      '# DSH Task Board',
      '',
      'Manage the current project\'s parent/child task tree with `board_get` / `board_revision` / `board_sync` / `task_create` / `task_update` / `task_delete`. These tools are the single source of truth for tasks.',
      '',
      '## When starting project work',
      '1. Call `board_revision` first; call `board_get` only when the revision changed or there is no snapshot in context.',
      '2. Read task titles, details, boundaries and parentage before deciding where new work belongs.',
      '3. Reuse or extend existing tasks where possible; never create duplicate root tasks.',
      '',
      '## When splitting work',
      '- Only real product work belongs on the board: features, bugs, refactors, security/reliability, meaningful tests and docs.',
      '- Do not create tasks for git/release actions (commit, merge, push, build, package, install, publish); record them in the owning task\'s details instead.',
      '- Prefer `board_sync` for multi-task batches; use `key` / `parent_key` to build complete parent/child trees atomically.',
      '- Create a new main task only for a genuinely new top-level workflow; implementation steps become subtasks; split again while working when needed.',
      '- Choose the most specific task whose boundary covers the work as the parent; prefer attaching under a subtask over a broader main task.',
      '- Attach incidental fixes, follow-ups, small requests or corrections found in existing work as `kind: "temporary"` under the closest main/subtask; create a new root only when no owner exists.',
      '- Every task must have a concise `boundary`: goal / scope / out of scope / acceptance criteria. Keep it updated when scope changes.',
      '',
      '## While implementing',
      '- Batch state changes with `board_sync`; use a single task tool only for an isolated change.',
      '- Mark `completed: true` as soon as work is verified.',
      '- Update the title or details when scope changes.',
      '- Delete only miscreated tasks; prefer completion or deferral.',
      '- Re-classify with `parent_id` / `kind` when the owner is wrong; keep history and descendants.',
      '- Keep the board in sync before giving a progress summary.',
      '',
      '## Task code examples',
      '- `A`, `B`, `C` are top-level main tasks.',
      '- `A0`, `A1` are subtasks of `A`; `A0_1`, `A0_2` are subtasks of `A0`.',
      '',
      '## Link for the user after updates',
      '- After any task create/update/complete, append a clickable link at the end of your reply:',
      '  `[📋 查看最新任务看板](http://127.0.0.1:1/dsh-view-taskboard?session=<SESSION_ID>)`',
      '  English context: `[📋 View latest task board](http://127.0.0.1:1/dsh-view-taskboard?session=<SESSION_ID>)`',
      '- `<SESSION_ID>` is the current session id (bash env `DSH_SESSION_ID`, e.g. session-0b8a...).',
      '- Clicking the link switches the conversation view to the Task Board tab without a page refresh.',
      '',
      'The board is isolated per project: always pass the absolute path of the project root as `project_path`.',
      '',
      '## 中文要点',
      '- 工具是任务事实的唯一来源：`board_get` / `board_revision` / `board_sync` / `task_create` / `task_update` / `task_delete`。',
      '- 只放真实产品工作；git/发布类动作记入所属任务详情，不建任务。',
      '- 批量变更用 `board_sync`（`key` / `parent_key` 原子构造父子树）；单条变更才用单任务工具。',
      '- 新顶层工作才建主任务；实现步骤建成子任务；偶发缺陷/跟进以 `kind: "temporary"` 挂最贴切任务下。',
      '- 每个任务必须有 `boundary`（目标 / 包含 / 不包含 / 验收），范围变化时同步更新。',
      '- 验证完成后立即 `completed: true`；仅误建才删除；归属错误用 `parent_id` / `kind` 重新归类。',
      '- 任务变更后给用户附跳转链接：`[📋 查看最新任务看板](http://127.0.0.1:1/dsh-view-taskboard?session=<SESSION_ID>)`。',
    ]

    skills.register({
      name: 'dsh-task-board',
      description: 'Use when starting, resuming, planning, splitting, updating or completing tasks of a software project, to keep the parent/child task tree and the board in sync.',
      whenToUse: 'Before starting project work, before planning or splitting tasks, before updating task state mid-implementation, or before a progress summary.',
      source: 'runtime',
      content: body.join('\n'),
    })
  }

  if (webServer !== undefined) {
    const route = webServer.register({
      kind: 'exact',
      path: '/api/task-board',
      handler: async (req, res) => {
        const send = (status, payload) => {
          res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify(payload))
        }
        try {
          const chunks = []
          let size = 0
          for await (const chunk of req) {
            size += chunk.length
            if (size > 8 * 1024 * 1024) throw new Error('请求体过大')
            chunks.push(chunk)
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
          const op = String(body.op || '')
          console.log('[task-board] op=' + op)
          if (op === 'init' || op === 'get' || op === 'revision') {
            if (body.projectPath) lastProjectPath = body.projectPath
            else if (lastProjectPath && (op === 'revision' || op === 'get')) body.projectPath = lastProjectPath
          }
          const fn = ops()[op === 'init' ? 'init' : op]
          if (typeof fn !== 'function') throw new Error('unknown op: ' + op)
          const result = await (op === 'init' ? fn(body, sessions) : fn(body))
          send(200, Object.assign({ ok: true }, result))
        } catch (error) {
          send(200, { ok: false, error: String(error && error.message || error) })
        }
      },
    })
    return route
  }
  return () => {}
}
