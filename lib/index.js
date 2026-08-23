// DSH 项目任务看板 — host half.
// 正式 cordis 插件：存储 + 模型工具 + 技能 + 浏览器视图用的 HTTP 路由。
// 数据根目录：$DSH_HOME/taskboards（缺省 ~/.dsh/taskboards），按项目 sha256 命名 JSON，与 CodexFF 格式一致。
import { createHash, randomUUID } from 'node:crypto'
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'task-board'
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
  return { project_path: project, project_name: projectName(project), revision: 0, updated_at_ms: 0, tasks: [] }
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
  const projectPathProperty = { type: 'string', description: '项目根目录的绝对路径（=会话工作目录）' }
  const pathSchema = (extraProperties, required) => ({
    type: 'object',
    properties: Object.assign({ project_path: projectPathProperty }, extraProperties || {}),
    required: required || ['project_path'],
  })
  const taskFields = {
    parent_id: { type: 'string', description: '父任务 id；省略表示顶层' },
    title: { type: 'string', description: '任务标题' },
    details: { type: 'string', description: '任务说明/执行笔记' },
    boundary: { type: 'string', description: '任务边界：目标 / 包含范围 / 不包含 / 验收标准' },
    kind: { type: 'string', enum: ['main', 'subtask', 'temporary'], description: '任务类型' },
    completed: { type: 'boolean', description: '是否已完成' },
  }

  const defs = [
    {
      name: 'board_get',
      description: '读取当前项目的本地父子任务树（只读，不访问网络）。',
      parameters: pathSchema(null, ['project_path']),
      execute: async (args) => (await ops().get({ projectPath: args.project_path })).board,
    },
    {
      name: 'board_revision',
      description: '只读取任务看板修订号；调用 board_get 前用它判断数据是否变化。',
      parameters: pathSchema(null, ['project_path']),
      execute: async (args) => ops().revision({ projectPath: args.project_path }),
    },
    {
      name: 'board_sync',
      description: '在一个锁和一次磁盘写入内原子地创建或更新多条任务；支持 operation key / parent_key 引用同一次调用中创建的任务。不删除。',
      parameters: {
        type: 'object',
        properties: {
          project_path: projectPathProperty,
          operations: {
            type: 'array',
            description: '操作列表（1–200 条）',
            items: {
              oneOf: [
                {
                  type: 'object',
                  properties: Object.assign({ action: { const: 'create', description: '创建操作', type: 'string' }, key: { type: 'string', description: '同批引用键' }, parent_key: { type: 'string', description: '引用同批创建的任务键' } }, taskFields),
                  required: ['action', 'title'],
                },
                {
                  type: 'object',
                  properties: Object.assign({ action: { const: 'update', description: '更新操作', type: 'string' }, task_id: { type: 'string' } }, taskFields, { x: { type: 'number' }, y: { type: 'number' } }),
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
      description: '在当前项目看板中创建一个任务并返回更新后的看板。',
      parameters: pathSchema(Object.assign({}, taskFields, { title: { type: 'string', description: '任务标题（必填）' } }), ['project_path', 'title']),
      execute: async (args) => (await ops().create({ projectPath: args.project_path, parentId: args.parent_id, title: args.title, details: args.details, boundary: args.boundary, kind: args.kind, completed: args.completed })).board,
    },
    {
      name: 'task_update',
      description: '更新标题、边界、完成状态或画布位置等信息。',
      parameters: pathSchema(Object.assign({}, taskFields, { task_id: { type: 'string', description: '任务 id（必填）' }, x: { type: 'number' }, y: { type: 'number' } }), ['project_path', 'task_id']),
      execute: async (args) => {
        const payload = { project_path: args.project_path, task_id: args.task_id, parent_id: args.parent_id, title: args.title, details: args.details, boundary: args.boundary, kind: args.kind, completed: args.completed, x: args.x, y: args.y }
        return (await ops().update({ projectPath: args.project_path, taskId: args.task_id, patch: payload })).board
      },
    },
    {
      name: 'task_delete',
      description: '永久删除一个任务及其全部后代任务，返回更新后的看板。',
      parameters: pathSchema({ task_id: { type: 'string', description: '任务 id（必填）' } }, ['project_path', 'task_id']),
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
      '# DSH 任务看板',
      '',
      '用 `board_get` / `board_revision` / `board_sync` / `task_create` / `task_update` / `task_delete` 工具管理当前项目的父子任务树，工具是任务事实的唯一来源。',
      '',
      '## 开始项目工作时',
      '1. 先调用 `board_revision`，仅在修订变化或当前上下文没有快照时调用 `board_get`。',
      '2. 读取任务标题、详情、边界与归属后再决定新工作放在哪里。',
      '3. 优先复用或扩展现有任务，不要重复创建根任务。',
      '',
      '## 任务拆分时',
      '- 只放真实产品工作（功能、缺陷、重构、安全/可靠性、有意义的测试与文档）。',
      '- 不要为提交、合并、推送、构建、打包、安装或发布这类 git/发布动作创建任务，记入所属任务详情即可。',
      '- 一次创建或更新多条任务优先用 `board_sync`，用 `key` / `parent_key` 原子地构造完整父子树。',
      '- 一个真正的新顶层工作流才创建新主任务；具体实现步骤建成子任务；执行中再次拆分时再建子任务。',
      '- 创建任务前，选择边界最能覆盖该工作的最具体任务作为归属；能挂子任务就不要挂在更宽的主任务下。',
      '- 现有工作流中发现的偶发缺陷、跟进调整、小需求或修正，以 `kind: "temporary"` 挂到最贴切的主任务或子任务下；仅当归属确实不存在时才新建根。',
      '- 每个任务必须有简洁明确的 `boundary`：目标 / 包含范围 / 不包含 / 验收标准。范围变化时同步更新。',
      '',
      '## 实现过程中',
      '- 批量状态变化用 `board_sync`；单条独立变化才用单个任务工具。',
      '- 工作验证完成后立即标记 `completed: true`。',
      '- 范围变化时更新标题或详情。',
      '- 只有误建才删除任务；优先标记完成或挂起。',
      '- 归属错误的用 `parent_id` / `kind` 重新归类，保留历史与后代。',
      '- 给出进度总结前保持看板同步。',
      '',
      '## 任务编号示例',
      '- `A`、`B`、`C` 为顶层主任务。',
      '- `A0`、`A1` 是 `A` 的子任务；`A0_1`、`A0_2` 是 `A0` 的子任务。',
      '',
      '## 更新后给用户跳转入口',
      '- 任何任务创建 / 更新 / 完成之后，在给用户的进度回复末尾附一条可点击链接：',
      '  `[📋 查看最新任务看板](http://127.0.0.1:1/dsh-view-taskboard?session=<SESSION_ID>)`',
      '- `<SESSION_ID>` 为当前会话 id（bash 环境变量 `DSH_SESSION_ID`，形如 session-0b8a...）。',
      '- 用户点击该链接即切换到「任务看板」tab，无需刷新页面。',
      '',
      '看板按项目隔离：始终传项目根目录的绝对路径作为 `project_path`。',
    ]
    skills.register({
      name: 'dsh-task-board',
      description: '当开始、恢复、规划、拆分、修改或完成一个软件项目的任务时使用，把当前项目的父子任务与看板保持同步。',
      whenToUse: '开始项目工作、任务规划拆分、实现中更新任务状态或给出进度总结之前。',
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
