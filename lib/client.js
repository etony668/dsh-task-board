// DSH 项目任务看板 — browser half（手工构建的 web bundle，仅依赖基线外部模块 react）。
// 注册到 conversation.view（order 20 → 对话 → 轨迹 → 任务看板）；数据经 /api/task-board 走 host。
window.__ModuleLoader__.load({
	id: '@etony668/dsh-task-board',
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		var React = require('react');
		var el = React.createElement;
		var TB_LANG = (((typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || (typeof navigator !== 'undefined' && navigator.language) || 'en') + '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
		var I18N = {
			zh: {
				tabLabel: '任务看板',
				kindMain: '主任务', kindSub: '子任务', kindTmp: '临时任务',
				boundaryEmpty: '尚未定义任务边界。', editTip: '编辑标题与任务边界',
				boundary: '任务边界', addSub: '+ 子任务', addTmp: '+ 临时任务', del: '删除',
				broken: '拆分任务',
				apiFail: '任务看板调用失败', titleRequired: '任务标题不能为空',
				boundaryTpl: '目标：\n范围：\n不包含：\n验收：',
				titlePh: '输入任务标题', rootTitlePh: '输入主任务标题',
				addRoot: '添加主任务', cancel: '取消',
				boardTitleSuffix: '项目任务看板', noProject: '未选择项目',
				mainPanelDrag: '拖动主任务面板', mainPanel: '主任务',
				mainPanelHint: '拖动此处移动整个主任务面板 · Tab / Esc 返回对话',
				childPanelDrag: '拖动 {c} 的子任务面板', childPanel: '{c} 的子任务',
				layerUp: '上一层', layerDown: '下一层', layerTop: '置顶层',
				expandPanel: '展开子任务面板', collapsePanel: '折叠子任务面板',
				doneAll: '全部完成 · 点击 + 展开', remainExpanded: '剩余 {n} 项 · 点击 + 展开',
				childPanelHint: '拖动此处移动整个子任务面板', noSubtasks: '尚未拆分子任务',
				emptyTitle: '当前项目还没有任务', emptyHint: '先建立主任务，再将执行工作拆分为子任务。',
				newMain: '新建主任务', newTmp: '新建临时任务', newSub: '新建子任务',
				delTask: '删除 {c}',
				warnCreate: '不推荐手动新建任务。请优先与 DeepSeek 对话创建与拆分任务，结合现有任务边界选择正确归属，避免重复任务或层级混乱。',
				warnDelete: '不推荐手动删除。删除父任务会同时删除全部后代。建议先与 DeepSeek 确认调整、合并或完成任务。',
				taskTitle: '任务标题',
				confirmCreate: '确认新建', confirmDelete: '确认删除',
				delDescendants: '将同时永久删除 {n} 个后代任务。', delSelf: '该任务将被永久删除。',
				typePhrase: '请输入「{p}」',
				busy: '处理中…', confirmCreateBtn: '确认新建任务', confirmDeleteBtn: '确认永久删除',
				editPrefix: '编辑 {t}', boundaryLabel: '任务边界（目标 / 包含 / 不包含 / 验收）', save: '保存',
				jumpText: '查看最新任务看板',
			},
			en: {
				tabLabel: 'Task Board',
				kindMain: 'Main task', kindSub: 'Subtask', kindTmp: 'Temporary task',
				boundaryEmpty: 'No task boundary defined yet.', editTip: 'Edit title and task boundary',
				boundary: 'Boundary', addSub: '+ Subtask', addTmp: '+ Temporary task', del: 'Delete',
				broken: 'Broken-down tasks',
				apiFail: 'Task board request failed', titleRequired: 'Task title is required',
				boundaryTpl: 'Goal:\nScope:\nOut of scope:\nAcceptance:',
				titlePh: 'Task title', rootTitlePh: 'Main task title',
				addRoot: 'Add main task', cancel: 'Cancel',
				boardTitleSuffix: 'Task Board', noProject: 'No project selected',
				mainPanelDrag: 'Drag main panel', mainPanel: 'Main tasks',
				mainPanelHint: 'Drag here to move the main panel · Tab / Esc to return to chat',
				childPanelDrag: 'Drag subtask panel of {c}', childPanel: 'Subtasks of {c}',
				layerUp: 'Layer up', layerDown: 'Layer down', layerTop: 'Bring to top',
				expandPanel: 'Expand panel', collapsePanel: 'Collapse panel',
				doneAll: 'All done · click + to expand', remainExpanded: '{n} remaining · click + to expand',
				childPanelHint: 'Drag here to move the panel', noSubtasks: 'No subtasks yet',
				emptyTitle: 'No tasks in this project yet', emptyHint: 'Create a main task first, then break the work into subtasks.',
				newMain: 'New main task', newTmp: 'New temporary task', newSub: 'New subtask',
				delTask: 'Delete {c}',
				warnCreate: 'Manual creation is discouraged. Prefer creating and splitting tasks through a conversation with DeepSeek, choosing the right parent from existing boundaries to avoid duplicates or a messy hierarchy.',
				warnDelete: 'Manual deletion is discouraged. Deleting a parent task also removes all its descendants. Confirm the change with DeepSeek first.',
				taskTitle: 'Task title',
				confirmCreate: 'CONFIRM CREATE', confirmDelete: 'CONFIRM DELETE',
				delDescendants: 'Also permanently deletes {n} descendant task(s).', delSelf: 'This task will be permanently deleted.',
				typePhrase: 'Type "{p}"',
				busy: 'Processing…', confirmCreateBtn: 'Create task', confirmDeleteBtn: 'Delete permanently',
				editPrefix: 'Edit {t}', boundaryLabel: 'Task boundary (Goal / Scope / Out of scope / Acceptance)', save: 'Save',
				jumpText: 'View latest task board',
			}
		};
		function t(key) { var v = I18N[TB_LANG][key]; return v === undefined ? I18N.en[key] : v; }
		function tn(key, n) { return String(t(key)).replace('{n}', String(n)); }
		function tc(key, c) { return String(t(key)).replace('{c}', c); }
		function tp(key, p) { return String(t(key)).replace('{p}', p); }
		function tt(key, x) { return String(t(key)).replace('{t}', x); }

		var TB_CSS = [
			'.dsh-tb-shell { height:100%; display:flex; flex-direction:column; overflow:hidden; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); }',
			'.dsh-tb-header { display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--dsw-alias-bg-layer-1); border-bottom:1px solid var(--dsw-alias-border-l1); justify-content:space-between; }',
			'.dsh-tb-header > div:first-child { min-width:0; display:flex; flex-direction:column; gap:3px; }',
			'.dsh-tb-header strong { font-size:15px; }',
			'.dsh-tb-header span { max-width:420px; overflow:hidden; color:var(--dsw-alias-label-secondary); font-size:11px; text-overflow:ellipsis; white-space:nowrap; }',
			'.dsh-tb-progress { color:var(--dsw-alias-brand-primary); font:12px "SF Mono", Menlo, monospace; }',
			'.dsh-tb-error { margin:8px 12px 0; padding:8px 10px; color:var(--dsw-alias-state-error-primary); border:1px solid var(--dsw-alias-state-error-primary); border-radius:7px; background:rgba(224,92,92,.12); font-size:12px; }',
			'.dsh-tb-viewport { position:relative; flex:1; min-height:0; overflow:auto; background-image:linear-gradient(rgba(127,127,127,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(127,127,127,.08) 1px, transparent 1px); background-size:24px 24px; }',
			'.dsh-tb-canvas { position:relative; min-width:100%; min-height:100%; }',
			'.dsh-tb-panel { position:absolute; z-index:2; padding:12px; border:1px solid var(--dsw-alias-border-l1); border-radius:13px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 95%, transparent); box-shadow:0 12px 34px rgba(0,0,0,.35); }',
			'.dsh-tb-main-panel, .dsh-tb-child-panel { background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 95%, transparent); }',
			'.dsh-tb-child-panel.dsh-tb-collapsed { padding-bottom:0; }',
			'.dsh-tb-links { position:absolute; inset:0; z-index:-1; overflow:visible; pointer-events:none; }',
			'.dsh-tb-links path { fill:none; stroke:var(--dsw-alias-brand-primary); stroke-width:1.7; stroke-dasharray:7 7; stroke-linecap:round; opacity:.78; }',
			'.dsh-tb-panel-head { display:flex; flex-direction:column; gap:3px; margin-bottom:10px; color:var(--dsw-alias-label-primary); font-size:13px; font-weight:700; }',
			'.dsh-tb-panel-head small { color:var(--dsw-alias-label-secondary); font-size:10px; font-weight:400; }',
			'.dsh-tb-panel-head-row { display:flex; align-items:center; justify-content:space-between; gap:8px; }',
			'.dsh-tb-head-actions, .dsh-tb-layer-actions { display:flex; align-items:center; gap:4px; }',
			'.dsh-tb-head-actions { margin-left:auto; }',
			'.dsh-tb-layer-button { width:22px; min-width:22px; height:22px; min-height:22px; padding:0; color:var(--dsw-alias-label-secondary); font-size:14px; }',
			'.dsh-tb-layer-icon { display:block; width:15px; height:15px; overflow:visible; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linejoin:round; }',
			'.dsh-tb-layer-icon-filled { fill:currentColor; stroke:currentColor; }',
			'.dsh-tb-layer-button:hover { color:var(--dsw-alias-brand-primary); }',
			'.dsh-tb-drag-handle { margin:-12px -12px 10px; padding:11px 12px 9px; border-bottom:1px solid var(--dsw-alias-border-l1); border-radius:13px 13px 0 0; cursor:grab; touch-action:none; user-select:none; }',
			'.dsh-tb-collapsed .dsh-tb-drag-handle { margin-bottom:0; border-bottom:0; border-radius:13px; }',
			'.dsh-tb-drag-handle:active { cursor:grabbing; }',
			'.dsh-tb-collapse { display:grid; width:22px; min-width:22px; height:22px; min-height:22px; padding:0; place-items:center; color:var(--dsw-alias-brand-primary); border:1px solid var(--dsw-alias-border-l1); border-radius:6px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, var(--dsw-alias-brand-primary)); font:16px/1 "SF Mono", Menlo, monospace; cursor:pointer; }',
			'.dsh-tb-collapse:hover { border-color:var(--dsw-alias-brand-primary); }',
			'.dsh-tb-column { display:flex; flex-direction:column; gap:10px; }',
			'.dsh-tb-column-empty { margin:12px 0; color:var(--dsw-alias-label-secondary); font-size:12px; }',
			'.dsh-tb-add-root { display:grid; width:34px; height:34px; margin:2px auto 0; padding:0; place-items:center; color:var(--dsw-alias-brand-primary); border:1px dashed var(--dsw-alias-brand-primary); border-radius:50%; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 90%, var(--dsw-alias-brand-primary)); font:22px/1 "SF Mono", Menlo, monospace; cursor:pointer; }',
			'.dsh-tb-add-root:hover { color:var(--dsw-alias-bg-layer-1); background:var(--dsw-alias-brand-primary); }',
			'.dsh-tb-root-create { display:flex; flex-direction:column; gap:8px; padding:10px; border:1px dashed var(--dsw-alias-brand-primary); border-radius:10px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, var(--dsw-alias-brand-primary)); }',
			'.dsh-tb-root-create input, .dsh-tb-manual-dialog input, .dsh-tb-manual-dialog textarea { width:100%; box-sizing:border-box; padding:0 9px; color:var(--dsw-alias-label-primary); border:1px solid var(--dsw-alias-border-l1); border-radius:7px; outline:0; background:var(--dsw-alias-bg-base); font-size:13px; }',
			'.dsh-tb-root-create input { height:34px; }',
			'.dsh-tb-root-create input:focus, .dsh-tb-manual-dialog input:focus, .dsh-tb-manual-dialog textarea:focus { border-color:var(--dsw-alias-brand-primary); box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent); }',
			'.dsh-tb-root-create > div { display:flex; gap:7px; }',
			'.dsh-tb-root-create button { min-height:29px; padding:3px 9px; color:var(--dsw-alias-label-primary); border:1px solid var(--dsw-alias-border-l1); border-radius:6px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, var(--dsw-alias-brand-primary)); cursor:pointer; }',
			'.dsh-tb-root-create button:first-child { color:#fff; border-color:var(--dsw-alias-brand-primary); background:var(--dsw-alias-brand-primary); }',
			'.dsh-tb-root-create button:disabled { opacity:.45; cursor:not-allowed; }',
			'.dsh-tb-card { min-height:138px; padding:10px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 5px 16px rgba(0,0,0,.28); transition:border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease; }',
			'.dsh-tb-card:hover { border-color:var(--dsw-alias-brand-primary); box-shadow:0 9px 24px rgba(0,0,0,.32), 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 23%, transparent); transform:translateY(-1px); }',
			'.dsh-tb-card.dsh-tb-completed { border-color:var(--dsw-alias-state-success-primary); background:var(--dsw-alias-bg-layer-1); }',
			'.dsh-tb-card-temporary { min-height:112px; border-style:dashed; background:var(--dsw-alias-bg-layer-1); }',
			'.dsh-tb-card-top, .dsh-tb-card-top label, .dsh-tb-card-actions { display:flex; align-items:center; }',
			'.dsh-tb-card-top { justify-content:space-between; gap:6px; }',
			'.dsh-tb-card-top label { gap:6px; cursor:pointer; }',
			'.dsh-tb-card-top input { width:15px; height:15px; margin:0; cursor:pointer; accent-color:var(--dsw-alias-state-success-primary); }',
			'.dsh-tb-code { color:var(--dsw-alias-brand-primary); font:12px "SF Mono", Menlo, monospace; }',
			'.dsh-tb-completed .dsh-tb-code { color:var(--dsw-alias-state-success-primary); }',
			'.dsh-tb-kind { color:var(--dsw-alias-label-secondary); font-size:10px; }',
			'.dsh-tb-card-temporary .dsh-tb-kind { color:#c88a24; }',
			'.dsh-tb-card-title { display:block; width:100%; margin-top:8px; padding:0; overflow:hidden; color:var(--dsw-alias-label-primary); border:0; background:transparent; font-size:13px; font-weight:700; line-height:1.4; text-align:left; text-overflow:ellipsis; white-space:nowrap; cursor:pointer; }',
			'.dsh-tb-completed .dsh-tb-card-title { color:var(--dsw-alias-label-secondary); text-decoration:line-through; }',
			'.dsh-tb-details { margin:5px 0 0; overflow:hidden; color:var(--dsw-alias-label-secondary); font-size:11px; text-overflow:ellipsis; white-space:nowrap; }',
			'.dsh-tb-boundary { display:flex; flex-direction:column; gap:3px; margin-top:8px; color:var(--dsw-alias-label-secondary); font-size:10px; }',
			'.dsh-tb-boundary b { color:color-mix(in srgb, var(--dsw-alias-brand-primary) 80%, var(--dsw-alias-label-primary)); }',
			'.dsh-tb-boundary span { display:-webkit-box; overflow:hidden; white-space:pre-wrap; -webkit-line-clamp:2; -webkit-box-orient:vertical; }',
			'.dsh-tb-card:hover .dsh-tb-boundary span { -webkit-line-clamp:unset; }',
			'.dsh-tb-card-actions { flex-wrap:wrap; gap:5px; margin-top:9px; }',
			'.dsh-tb-card-actions button { min-height:23px; padding:2px 6px; color:var(--dsw-alias-label-secondary); border:1px solid var(--dsw-alias-border-l1); border-radius:5px; background:transparent; font-size:10px; }',
			'.dsh-tb-card-actions button:hover { color:var(--dsw-alias-label-primary); border-color:var(--dsw-alias-brand-primary); }',
			'.dsh-tb-card-actions button.dsh-tb-danger:hover { color:var(--dsw-alias-state-error-primary); border-color:var(--dsw-alias-state-error-primary); }',
			'.dsh-tb-subtask-stack { position:relative; }',
			'.dsh-tb-subtask-stack.dsh-tb-nested { margin-top:8px; }',
			'.dsh-tb-nested-panel { display:flex; flex-direction:column; gap:8px; margin:10px 0 0 17px; padding:8px; border-left:1.5px dashed var(--dsw-alias-brand-primary); border-radius:0 8px 8px 0; }',
			'.dsh-tb-nested-panel > span { color:var(--dsw-alias-brand-primary); font-size:10px; font-weight:700; }',
			'.dsh-tb-temporary-panel { display:flex; flex-direction:column; gap:8px; margin:10px 0 0 17px; padding:8px; border-left:1.5px dashed #d9a345; border-radius:0 8px 8px 0; }',
			'.dsh-tb-temporary-panel > span { color:#c88a24; font-size:10px; font-weight:700; }',
			'.dsh-tb-empty { position:absolute; top:38%; left:50%; display:flex; flex-direction:column; gap:6px; align-items:center; transform:translate(-50%,-50%); color:var(--dsw-alias-label-secondary); text-align:center; white-space:nowrap; }',
			'.dsh-tb-empty strong { color:var(--dsw-alias-label-primary); font-size:14px; }',
			'.dsh-tb-overlay { position:fixed; inset:0; z-index:20000; display:grid; padding:22px; place-items:center; background:rgba(7,12,24,.48); backdrop-filter:blur(8px); }',
			'.dsh-tb-manual-dialog { display:grid; grid-template-columns:42px minmax(0,1fr); gap:13px; width:min(480px, calc(100% - 44px)); max-height:calc(100% - 44px); box-sizing:border-box; padding:18px; overflow:auto; color:var(--dsw-alias-label-primary); border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--dsw-alias-border-l1)); border-radius:14px; background:color-mix(in srgb, var(--dsw-alias-bg-overlay) 96%, transparent); box-shadow:0 24px 80px rgba(0,0,0,.32); }',
			'.dsh-tb-manual-dialog.dsh-tb-destructive { border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 65%, var(--dsw-alias-border-l1)); }',
			'.dsh-tb-warning-icon { display:grid; width:38px; height:38px; place-items:center; color:#fff; border-radius:11px; background:#d9932f; font-size:22px; font-weight:800; box-shadow:0 8px 18px rgba(217,147,47,.26); }',
			'.dsh-tb-destructive .dsh-tb-warning-icon { background:var(--dsw-alias-state-error-primary); }',
			'.dsh-tb-manual-dialog h2 { margin:1px 0 7px; font-size:16px; }',
			'.dsh-tb-manual-warning { margin:0 0 13px; color:var(--dsw-alias-label-secondary); font-size:12px; line-height:1.65; }',
			'.dsh-tb-manual-target { margin:0 0 10px; padding:7px 9px; color:var(--dsw-alias-brand-primary); border-radius:7px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 86%, var(--dsw-alias-brand-primary)); font-size:11px; }',
			'.dsh-tb-manual-dialog label { display:flex; flex-direction:column; gap:6px; margin-top:10px; color:var(--dsw-alias-label-secondary); font-size:11px; }',
			'.dsh-tb-manual-dialog textarea { min-height:96px; padding:7px 9px; resize:vertical; font-family:inherit; }',
			'.dsh-tb-delete-summary { display:flex; flex-direction:column; gap:4px; margin:4px 0 10px; padding:9px 10px; border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1)); border-radius:8px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 90%, var(--dsw-alias-state-error-primary)); }',
			'.dsh-tb-delete-summary strong { color:var(--dsw-alias-label-primary); font-size:12px; }',
			'.dsh-tb-delete-summary span { color:var(--dsw-alias-state-error-primary); font-size:11px; }',
			'.dsh-tb-manual-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:15px; }',
			'.dsh-tb-manual-actions button { min-height:32px; padding:4px 12px; color:var(--dsw-alias-label-primary); border:1px solid var(--dsw-alias-border-l1); border-radius:7px; background:transparent; cursor:pointer; }',
			'.dsh-tb-manual-actions button.dsh-tb-primary { color:#fff; border-color:var(--dsw-alias-brand-primary); background:var(--dsw-alias-brand-primary); }',
			'.dsh-tb-manual-actions button.dsh-tb-danger { color:#fff; border-color:var(--dsw-alias-state-error-primary); background:var(--dsw-alias-state-error-primary); }',
			'.dsh-tb-manual-actions button:disabled { opacity:.42; cursor:not-allowed; }',
			// 任务看板视图激活时隐藏底部消息发送框（composer 坐席带稳定 data-composer-seat 标记）。
			'body:has(.dsh-tb-shell) [data-composer-seat] { display:none !important; }'
		].join('\n');

		function kindLabel(task) { return task.kind === 'temporary' ? t('kindTmp') : task.kind === 'subtask' ? t('kindSub') : t('kindMain'); }
		function boundaryText(task) { return (task.boundary || '').trim() || t('boundaryEmpty'); }
		function childrenOf(tasks, parentId) {
			return tasks.filter(function (task) { return task.parent_id === parentId; }).sort(function (a, b) { return a.created_at_ms - b.created_at_ms; });
		}

		function TaskCard(props) {
			var task = props.task, api = props.api, allowTemporary = props.allowTemporary;
			return el('article', { className: 'dsh-tb-card dsh-tb-card-' + task.kind + (task.completed ? ' dsh-tb-completed' : '') },
				el('div', { className: 'dsh-tb-card-top' },
					el('label', null,
						el('input', { type: 'checkbox', checked: !!task.completed, onChange: function () { api.toggle(task); } }),
						el('span', { className: 'dsh-tb-code' }, task.code)),
					el('span', { className: 'dsh-tb-kind' }, kindLabel(task))),
				el('button', { className: 'dsh-tb-card-title', title: t('editTip'), onClick: function () { api.edit(task); } }, task.title),
				task.details ? el('p', { className: 'dsh-tb-details' }, task.details) : null,
				el('div', { className: 'dsh-tb-boundary' },
					el('b', null, t('boundary')),
					el('span', null, boundaryText(task))),
				el('div', { className: 'dsh-tb-card-actions' },
					task.kind !== 'temporary' ? el('button', { onClick: function () { api.askCreate('subtask', task); } }, t('addSub')) : null,
					allowTemporary ? el('button', { onClick: function () { api.askCreate('temporary', task); } }, t('addTmp')) : null,
					el('button', { className: 'dsh-tb-danger', onClick: function () { api.askDelete(task); } }, t('del'))));
		}

		function TaskNode(props) {
			var task = props.task, api = props.api, all = props.all, depth = props.depth || 0;
			var children = childrenOf(all, task.id);
			return el('div', { className: 'dsh-tb-subtask-stack' + (depth > 0 ? ' dsh-tb-nested' : ''), key: task.id },
				el(TaskCard, { task: task, api: api, allowTemporary: task.kind !== 'temporary' }),
				children.length > 0 ? el('div', { className: 'dsh-tb-nested-panel' + (children.every(function (c) { return c.kind === 'temporary'; }) ? ' dsh-tb-temporary-panel' : '') },
					el('span', null, children.every(function (c) { return c.kind === 'temporary'; }) ? t('kindTmp') : t('broken')),
					children.map(function (child) { return el(TaskNode, { task: child, api: api, all: all, depth: depth + 1, key: child.id }); })) : null);
		}

		function TaskBoardView(props) {
			var sessionId = props.sessionId, tctx = props.tctx, actions = props.actions;
			var state = React.useState(''), projectPath = state[0], setProjectPath = state[1];
			var state2 = React.useState(null), board = state2[0], setBoard = state2[1];
			var state3 = React.useState(''), error = state3[0], setError = state3[1];
			var state4 = React.useState(''), newTitle = state4[0], setNewTitle = state4[1];
			var state5 = React.useState(false), showRootCreator = state5[0], setShowRootCreator = state5[1];
			var state6 = React.useState(false), creating = state6[0], setCreating = state6[1];
			var state7 = React.useState(null), manual = state7[0], setManual = state7[1];
			var state8 = React.useState(''), manualTitle = state8[0], setManualTitle = state8[1];
			var state9 = React.useState(''), manualConfirm = state9[0], setManualConfirm = state9[1];
			var state10 = React.useState(false), manualBusy = state10[0], setManualBusy = state10[1];
			var state11 = React.useState(null), editTask = state11[0], setEditTask = state11[1];
			var state12 = React.useState(''), editTitle = state12[0], setEditTitle = state12[1];
			var state13 = React.useState(''), editBoundary = state13[0], setEditBoundary = state13[1];
			var state14 = React.useState({}), positions = state14[0], setPositions = state14[1];
			var state15 = React.useState({}), layers = state15[0], setLayers = state15[1];
			var state16 = React.useState({}), collapsed = state16[0], setCollapsed = state16[1];
			var state17 = React.useState({}), connectors = state17[0], setConnectors = state17[1];
			var boardRef = React.useRef(null);
			React.useEffect(function () { boardRef.current = board; }, [board]);
			var dragRef = React.useRef(null);
			var canvasRef = React.useRef(null);
			var rootCardRefs = React.useRef({});
			var childPanelRefs = React.useRef({});

			var MAIN_WIDTH = 280, CHILD_WIDTH = 280, GAP = 20, MAIN_KEY = '__main__';
			var TB_SHORT_REV = '5a47334c9257';

			function refreshBoard(next) {
				setBoard(function (current) { return !current || next.revision !== current.revision ? next : current; });
			}

			async function tbApi(op, payload) {
				var response = await fetch('/api/task-board', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(Object.assign({ op: op }, payload || {}))
				});
				var data = await response.json();
				if (!data || data.ok !== true) throw new Error(data && data.error || t('apiFail'));
				return data;
			}

			async function refreshQuiet() {
				if (!projectPath) return;
				try {
					var r = await tbApi('get', { projectPath: projectPath });
					refreshBoard(r.board);
				} catch (e) { /* keep last board */ }
			}

			React.useEffect(function () {
				var alive = true;
				async function boot() {
					try {
						var r = await tbApi('init', { sessionId: sessionId });
						if (!alive) return;
						setProjectPath(r.projectPath); setBoard(r.board); setError('');
						if (r.board && r.board.layout && r.board.layout.positions) setPositions(r.board.layout.positions);
						if (r.board && r.board.layout && r.board.layout.layers) setLayers(r.board.layout.layers);
					} catch (e) {
						if (alive) setError(String(e && e.message || e));
					}
				}
				boot();
				return function () { alive = false; };
			}, [sessionId]);

			// 键盘返回：Tab（或 Esc）切回「对话」视图；焦点在输入类元素时不劫持。
			React.useEffect(function () {
				function onKey(e) {
					if (e.key === 'Escape' && (manual || editTask)) return; // 对话框自行关闭
					if (e.key !== 'Tab' && e.key !== 'Escape') return;
					if (e.shiftKey) return; // Shift+Tab 保留反向焦点导航
					var active = document.activeElement;
					var tag = active && active.tagName ? String(active.tagName).toLowerCase() : '';
					if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
					if (e.preventDefault) e.preventDefault();
					if (actions && typeof actions.setView === 'function') actions.setView('chat');
					else activateTabBack();
				}
				window.addEventListener('keydown', onKey);
				return function () { window.removeEventListener('keydown', onKey); };
			}, [manual, editTask, actions]);

			React.useEffect(function () {
				tbViewActive = true;
				return function () { tbViewActive = false; };
			}, []);
			React.useEffect(function () {
				if (!projectPath) return;
				try {
					var seen = window.localStorage.getItem('dsh-taskboard-seen-rev:' + projectPath);
					if (seen) tbLastRev = Number(seen);
				} catch (e) { }
				tbApi('revision', { projectPath: projectPath }).then(function (r) {
					if (r && typeof r.revision === 'number') {
						tbLastRev = r.revision;
						try { window.localStorage.setItem('dsh-taskboard-seen-rev:' + projectPath, String(r.revision)); } catch (e) { }
						if (tbUnread === 'red') { tbUnread = 'green'; tbUpdateDot(); }
					}
				}).catch(function () { });
			}, [projectPath]);

			React.useEffect(function () {
				if (!projectPath) return;
				try {
					var stored = window.localStorage.getItem('dsh-taskboard-pos:' + projectPath);
					setPositions(stored ? JSON.parse(stored) : {});
				} catch (e) { setPositions({}); }
				try {
					var stored2 = window.localStorage.getItem('dsh-taskboard-layers:' + projectPath);
					var parsed = stored2 ? JSON.parse(stored2) : {};
					var filtered = {};
					for (var key of Object.keys(parsed)) {
						if (typeof parsed[key] === 'number' && Number.isFinite(parsed[key])) filtered[key] = parsed[key];
					}
					setLayers(filtered);
				} catch (e) { setLayers({}); }
			}, [projectPath]);

			React.useEffect(function () {
				if (!board) return;
				var validRoots = new Set(board.tasks.filter(function (t) { return !t.parent_id; }).map(function (t) { return t.id; }));
				setCollapsed(function (current) {
					var next = {};
					for (var key of Object.keys(current)) { if (validRoots.has(key)) next[key] = current[key]; }
					return Object.keys(next).length === Object.keys(current).length ? current : next;
				});
				setLayers(function (current) {
					var next = {};
					for (var key of Object.keys(current)) { if (validRoots.has(key)) next[key] = current[key]; }
					return Object.keys(next).length === Object.keys(current).length ? current : next;
				});
			}, [board]);

			React.useEffect(function () {
				if (!projectPath || Object.keys(positions).length === 0) return;
				try { window.localStorage.setItem('dsh-taskboard-pos:' + projectPath, JSON.stringify(positions)); } catch (e) { }
			}, [positions, projectPath]);
			React.useEffect(function () {
				if (!projectPath || Object.keys(layers).length === 0) return;
				try { window.localStorage.setItem('dsh-taskboard-layers:' + projectPath, JSON.stringify(layers)); } catch (e) { }
			}, [layers, projectPath]);

			React.useEffect(function () {
				function move(event) {
					var drag = dragRef.current;
					if (!drag) return;
					var next = { x: Math.max(8, drag.originX + event.clientX - drag.startX), y: Math.max(8, drag.originY + event.clientY - drag.startY) };
					setPositions(function (current) {
						var snapped = snapFrom(current, drag.key, next);
						var copy = Object.assign({}, current);
						copy[drag.key] = snapped;
						return copy;
					});
				}
				function stop() {
					if (dragRef.current && projectPath) {
						try {
							fetch('/api/task-board', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op: 'layoutSave', projectPath: projectPath, layout: { positions: positions, layers: layers } }) });
						} catch (e) { }
					}
					dragRef.current = null;
				}
				window.addEventListener('pointermove', move);
				window.addEventListener('pointerup', stop);
				return function () {
					window.removeEventListener('pointermove', move);
					window.removeEventListener('pointerup', stop);
				};
			}, []);

			React.useEffect(function () {
				if (!projectPath || !board) return;
				return tctx.interval(async function () {
					try {
						var r = await tbApi('revision', { projectPath: projectPath });
						if (tbLastRev === null) tbLastRev = r.revision;
						else if (r.revision !== tbLastRev) {
							if (tbUnread === 'red') { tbUnread = 'green'; tbUpdateDot(); }
							tbLastRev = r.revision;
						}
						if (r.revision !== board.revision || r.updated_at_ms !== board.updated_at_ms) await refreshQuiet();
					} catch (e) { /* best effort */ }
				}, 2500);
			}, [projectPath, board]);

			function snapFrom(current, selfKey, next) {
				var W = 280, GAPX = 20, T = 24;
				var others = [];
				var mainPos = current['__main__'];
				var mainH = 300;
				try { var mpEl = document.querySelector('.dsh-tb-main-panel'); if (mpEl) mainH = mpEl.offsetHeight; } catch (e) { }
				others.push({ key: '__main__', x: mainPos ? mainPos.x : 12, y: mainPos ? mainPos.y : 12, w: W, h: mainH });
				var roots = boardRef.current ? boardRef.current.tasks.filter(function (t) { return !t.parent_id; }) : [];
				for (var i = 0; i < roots.length; i += 1) {
					var r = roots[i];
					if (r.id === selfKey) continue;
					var pos = current[r.id];
					var ph = 200;
					try { var pel = childPanelRefs.current[r.id]; if (pel) ph = pel.offsetHeight; } catch (e) { }
					others.push({ key: r.id, x: pos ? pos.x : 12 + W + GAPX + i * (W + GAPX), y: pos ? pos.y : 12, w: W, h: ph });
				}
				var y = next.y, x = next.x;
				// (a) 顶部磁吸：接近顶部带或任一面板顶部 -> 对齐顶部
				if (Math.abs(y - 12) <= T) y = 12;
				else {
					for (var o = 0; o < others.length; o += 1) {
						if (Math.abs(y - others[o].y) <= T) { y = others[o].y; break; }
					}
				}
				// (c2) 纵向间距磁吸：接近某面板下缘 20px 处 -> 吸附（同时左对齐其左缘）
				for (var ov = 0; ov < others.length; ov += 1) {
					var below = others[ov].y + others[ov].h + 20;
					if (Math.abs(y - below) <= T) {
						y = below;
						if (Math.abs(x - others[ov].x) <= 70) x = others[ov].x;
						break;
					}
				}
				// (c) 纵向堆叠：位于某面板下方且接近其水平左缘 -> 左对齐
				var leftAligned = null;
				for (var o2 = 0; o2 < others.length; o2 += 1) {
					if (next.y > others[o2].y + 240 && Math.abs(next.x - others[o2].x) <= 70) { leftAligned = others[o2].x; break; }
				}
				if (leftAligned !== null) {
					x = leftAligned;
				} else {
					// (b) 横向栅格：左缘 / 右侧 25px / 左侧 25px
					var xc = [12];
					for (var o3 = 0; o3 < others.length; o3 += 1) {
						xc.push(others[o3].x - W - GAPX, others[o3].x + others[o3].w + GAPX);
					}
					var best = null;
					for (var c = 0; c < xc.length; c += 1) {
						if (best === null || Math.abs(xc[c] - x) < Math.abs(best - x)) best = xc[c];
					}
					if (best !== null && Math.abs(best - x) <= T) x = best;
				}
				return { x: Math.max(4, x), y: Math.max(4, y) };
			}

			function beginDrag(event, key, fallback) {
				if (!event || event.button !== 0) return;
				if (event.preventDefault) event.preventDefault();
				var position = positions[key] || fallback;
				dragRef.current = { key: key, originX: position.x, originY: position.y, startX: event.clientX, startY: event.clientY };
				if (event.currentTarget && event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId);
			}

			function positionFor(key, fallback) { return positions[key] || fallback; }
			function mainPosition() { return positionFor(MAIN_KEY, { x: 12, y: 12 }); }
			function childPosition(root, index) { return positionFor(root.id, { x: 12 + MAIN_WIDTH + GAP + index * (CHILD_WIDTH + GAP), y: 12 }); }

			function connectorPath(from, to) {
				var x1 = from.x + from.width, y1 = from.y + from.height / 2;
				var x2 = to.x, y2 = to.y + Math.min(48, to.height / 2);
				var middle = (x1 + x2) / 2;
				return 'M ' + x1 + ' ' + y1 + ' C ' + middle + ' ' + y1 + ', ' + middle + ' ' + y2 + ', ' + x2 + ' ' + y2;
			}

			function measureConnectors() {
				var canvas = canvasRef.current;
				if (!canvas || !board) return;
				var canvasRect = canvas.getBoundingClientRect();
				var next = {};
				var roots = board.tasks.filter(function (t) { return !t.parent_id; }).sort(function (a, b) { return a.created_at_ms - b.created_at_ms; });
				for (var root of roots) {
					var rootCard = rootCardRefs.current[root.id];
					var childPanel = childPanelRefs.current[root.id];
					if (!rootCard || !childPanel) continue;
					var rootRect = rootCard.getBoundingClientRect();
					var childRect = childPanel.getBoundingClientRect();
					next[root.id] = connectorPath(
						{ x: rootRect.right - canvasRect.left, y: rootRect.top - canvasRect.top, width: 0, height: rootRect.height },
						{ x: childRect.left - canvasRect.left, y: childRect.top - canvasRect.top, width: childRect.width, height: childRect.height });
				}
				setConnectors(function (current) {
					var keys = Object.keys(current), nextKeys = Object.keys(next);
					if (keys.length === nextKeys.length && nextKeys.every(function (k) { return current[k] === next[k]; })) return current;
					return next;
				});
			}

			React.useEffect(function () {
				var frame = window.requestAnimationFrame(measureConnectors);
				var observer = null;
				try {
					observer = new ResizeObserver(measureConnectors);
					if (canvasRef.current) observer.observe(canvasRef.current);
					for (var key of Object.keys(rootCardRefs.current)) {
						var node = rootCardRefs.current[key];
						if (node) observer.observe(node);
					}
					for (var key2 of Object.keys(childPanelRefs.current)) {
						var node2 = childPanelRefs.current[key2];
						if (node2) observer.observe(node2);
					}
				} catch (e) { /* ResizeObserver optional */ }
				return function () {
					window.cancelAnimationFrame(frame);
					if (observer) observer.disconnect();
				};
			}, [board, positions]);

			var allTasks = board ? board.tasks : [];
			var roots = allTasks.filter(function (t) { return !t.parent_id; }).sort(function (a, b) { return a.created_at_ms - b.created_at_ms; });
			var completedCount = allTasks.filter(function (t) { return t.completed; }).length;

			function descendantsOf(rootId) {
				var result = [], pending = [rootId];
				while (pending.length > 0) {
					var parentId = pending.shift();
					for (var task of allTasks) {
						if (task.parent_id !== parentId) continue;
						result.push(task); pending.push(task.id);
					}
				}
				return result;
			}

			function panelDefaultsCollapsed(root) {
				var descendants = descendantsOf(root.id);
				return descendants.length > 0 && descendants.every(function (t) { return t.completed; });
			}
			function panelCollapsed(root) { return collapsed[root.id] === undefined ? panelDefaultsCollapsed(root) : collapsed[root.id]; }
			function panelLayer(root, index) { return layers[root.id] || 3 + index; }
			function bringPanelToTop(rootId) {
				setLayers(function (current) {
					var highest = 2;
					for (var i = 0; i < roots.length; i += 1) {
						var value = current[roots[i].id] || 3 + i;
						if (value > highest) highest = value;
					}
					var next = Object.assign({}, current);
					next[rootId] = highest + 1;
					return next;
				});
			}
			function adjustPanelLayer(rootId, direction) {
				if (direction === 'top') { bringPanelToTop(rootId); return; }
				setLayers(function (current) {
					var ordered = roots.map(function (root, index) { return { id: root.id, layer: current[root.id] || 3 + index, index: index }; })
						.sort(function (l, r) { return l.layer === r.layer ? l.index - r.index : l.layer - r.layer; });
					var currentIndex = ordered.findIndex(function (item) { return item.id === rootId; });
					var targetIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
					if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) return current;
					var a = ordered[currentIndex], b = ordered[targetIndex];
					var next = Object.assign({}, current);
					next[a.id] = b.layer; next[b.id] = a.layer;
					return next;
				});
			}
			function togglePanelCollapsed(root) {
				var isCollapsed = panelCollapsed(root);
				setCollapsed(function (current) {
					var next = Object.assign({}, current);
					next[root.id] = !isCollapsed;
					return next;
				});
				if (isCollapsed) bringPanelToTop(root.id);
			}

			async function toggle(task) {
				try {
					var r = await tbApi('update', { projectPath: projectPath, taskId: task.id, patch: { completed: !task.completed } });
					refreshBoard(r.board); setError('');
				} catch (e) { setError(String(e && e.message || e)); }
			}
			async function saveEdit() {
				if (!editTask) return;
				var title = editTitle.trim();
				if (!title) { setError(t('titleRequired')); return; }
				try {
					var r = await tbApi('update', { projectPath: projectPath, taskId: editTask.id, patch: { title: title, boundary: editBoundary } });
					refreshBoard(r.board); setEditTask(null); setError('');
				} catch (e) { setError(String(e && e.message || e)); }
			}
			async function deleteTask(task) {
				try {
					var r = await tbApi('delete', { projectPath: projectPath, taskId: task.id });
					refreshBoard(r.board); setManual(null); setError('');
				} catch (e) { setError(String(e && e.message || e)); }
			}
			async function createTask(kind, parent) {
				var title = manualTitle.trim();
				if (!title) { setError(t('titleRequired')); return; }
				try {
					var r = await tbApi('create', { projectPath: projectPath, parentId: parent ? parent.id : null, title: title, details: '', boundary: t('boundaryTpl'), kind: kind });
					refreshBoard(r.board); setManual(null); setError('');
				} catch (e) { setError(String(e && e.message || e)); }
			}

			var api = {
				toggle: toggle,
				edit: function (task) { setEditTask(task); setEditTitle(task.title); setEditBoundary(task.boundary || ''); },
				askCreate: function (kind, parent) { setManualTitle(''); setManualConfirm(''); setManual({ type: 'create', kind: kind, parent: parent }); },
				askDelete: function (task) { setManualConfirm(''); setManual({ type: 'delete', task: task }); }
			};

			function confirmCreate() {
				if (manualBusy) return;
				setManualBusy(true);
				Promise.resolve(createTask(manual.kind, manual.parent)).finally(function () { setManualBusy(false); });
			}
			function confirmDelete() {
				if (manualBusy) return;
				setManualBusy(true);
				Promise.resolve(deleteTask(manual.task)).finally(function () { setManualBusy(false); });
			}

			var mainPos = mainPosition();
			var childPanelPositions = roots.map(function (root, index) { return { root: root, position: childPosition(root, index) }; });
			var canvasWidth = Math.max(760, mainPos.x + MAIN_WIDTH + 40, ...childPanelPositions.map(function (p) { return p.position.x + CHILD_WIDTH + 40; }));
			var canvasHeight = Math.max(900, mainPos.y + 760, ...childPanelPositions.map(function (p) { return p.position.y + 760; }));

			return el('div', { className: 'dsh-tb-shell', 'data-conversation-composer-overlay': '' },
				el('header', { className: 'dsh-tb-header' },
					el('div', null,
						el('strong', null, ((board && board.project_name) ? board.project_name + ' · ' : '') + t('boardTitleSuffix')),
						el('span', { title: projectPath }, projectPath || t('noProject'))),
					el('div', { className: 'dsh-tb-progress' }, completedCount + '/' + allTasks.length),
					el('span', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: '10px', fontFamily: 'Menlo, monospace' } }, 'v0.2.0 · r' + TB_SHORT_REV)),
				error ? el('div', { className: 'dsh-tb-error' }, error) : null,
				el('main', { className: 'dsh-tb-viewport' },
					el('div', { className: 'dsh-tb-canvas', ref: canvasRef, style: { width: canvasWidth, height: canvasHeight } },
						el('svg', { className: 'dsh-tb-links', width: canvasWidth, height: canvasHeight, 'aria-hidden': true },
							childPanelPositions.map(function (_a) { var root = _a.root; return el('path', { key: root.id, d: connectors[root.id] || '' }); })),
						el('section', { className: 'dsh-tb-panel dsh-tb-main-panel', style: { left: mainPos.x, top: mainPos.y, width: MAIN_WIDTH } },
							el('div', { className: 'dsh-tb-panel-head dsh-tb-drag-handle', onPointerDown: function (event) { beginDrag(event, MAIN_KEY, { x: 12, y: 12 }); }, title: t('mainPanelDrag') },
								el('span', null, t('mainPanel')),
								el('small', null, t('mainPanelHint'))),
							el('div', { className: 'dsh-tb-column' },
								roots.map(function (task) { return el('div', { key: task.id, ref: function (node) { rootCardRefs.current[task.id] = node; } }, el(TaskCard, { task: task, api: api, allowTemporary: true })); }),
								showRootCreator ? el('div', { className: 'dsh-tb-root-create' },
									el('input', { autoFocus: true, value: newTitle, onChange: function (e) { setNewTitle(e.target.value); }, onKeyDown: function (e) {
										if (e.key === 'Enter') {
											var t = newTitle.trim();
											if (t) { setManualTitle(t); setManualConfirm(''); setManual({ type: 'create', kind: 'main', parent: null }); setShowRootCreator(false); setNewTitle(''); }
										}
										if (e.key === 'Escape') { setShowRootCreator(false); setNewTitle(''); }
									}, placeholder: t('rootTitlePh') }),
									el('div', null,
										el('button', { type: 'button', onClick: function () {
											var t = newTitle.trim();
											if (t) { setManualTitle(t); setManualConfirm(''); setManual({ type: 'create', kind: 'main', parent: null }); setShowRootCreator(false); setNewTitle(''); }
										}, disabled: !newTitle.trim() || creating }, t('addRoot')),
										el('button', { type: 'button', className: 'dsh-tb-secondary', onClick: function () { setShowRootCreator(false); setNewTitle(''); } }, t('cancel')))) : el('button', { type: 'button', className: 'dsh-tb-add-root', title: t('addRoot'), onClick: function () { setShowRootCreator(true); } }, '+'))),
						childPanelPositions.map(function (item, index) {
							var root = item.root, position = item.position;
							var children = childrenOf(allTasks, root.id);
							var descendants = descendantsOf(root.id);
							var remaining = descendants.filter(function (t) { return !t.completed; }).length;
							var isCollapsed = panelCollapsed(root);
							return el('section', { key: root.id, className: 'dsh-tb-panel dsh-tb-child-panel' + (isCollapsed ? ' dsh-tb-collapsed' : ''), ref: function (node) { childPanelRefs.current[root.id] = node; }, style: { left: position.x, top: position.y, width: CHILD_WIDTH, zIndex: panelLayer(root, index) } },
								el('div', { className: 'dsh-tb-panel-head dsh-tb-drag-handle', onPointerDown: function (event) { beginDrag(event, root.id, { x: 12 + MAIN_WIDTH + GAP + index * (CHILD_WIDTH + GAP), y: 12 }); }, title: tc('childPanelDrag', root.code) },
									el('div', { className: 'dsh-tb-panel-head-row' },
										el('span', null, tc('childPanel', root.code)),
										el('div', { className: 'dsh-tb-head-actions' },
											!isCollapsed ? el('div', { className: 'dsh-tb-layer-actions' },
												el('button', { type: 'button', className: 'dsh-tb-collapse dsh-tb-layer-button', title: t('layerUp'), onPointerDown: function (e) { e.stopPropagation(); }, onClick: function (e) { e.stopPropagation(); adjustPanelLayer(root.id, 'up'); } }, el('svg', { className: 'dsh-tb-layer-icon', viewBox: '0 0 16 16' }, el('path', { d: 'M2.5 12.5 8 3l5.5 9.5Z' }))),
												el('button', { type: 'button', className: 'dsh-tb-collapse dsh-tb-layer-button', title: t('layerDown'), onPointerDown: function (e) { e.stopPropagation(); }, onClick: function (e) { e.stopPropagation(); adjustPanelLayer(root.id, 'down'); } }, el('svg', { className: 'dsh-tb-layer-icon', viewBox: '0 0 16 16' }, el('path', { d: 'M2.5 3.5 8 13l5.5-9.5Z' }))),
												el('button', { type: 'button', className: 'dsh-tb-collapse dsh-tb-layer-button', title: t('layerTop'), onPointerDown: function (e) { e.stopPropagation(); }, onClick: function (e) { e.stopPropagation(); adjustPanelLayer(root.id, 'top'); } }, el('svg', { className: 'dsh-tb-layer-icon dsh-tb-layer-icon-filled', viewBox: '0 0 16 16' }, el('path', { d: 'M2.5 12.5 8 3l5.5 9.5Z' })))) : null,
											el('button', { type: 'button', className: 'dsh-tb-collapse', title: isCollapsed ? t('expandPanel') : t('collapsePanel'), onPointerDown: function (e) { e.stopPropagation(); }, onClick: function (e) { e.stopPropagation(); togglePanelCollapsed(root); } }, isCollapsed ? '+' : '−'))),
									el('small', null, isCollapsed ? (remaining === 0 ? t('doneAll') : tn('remainExpanded', remaining)) : t('childPanelHint'))),
								!isCollapsed ? el('div', { className: 'dsh-tb-column' },
									children.map(function (task) { return el(TaskNode, { task: task, api: api, all: allTasks }); }),
									children.length === 0 ? el('p', { className: 'dsh-tb-column-empty' }, t('noSubtasks')) : null) : null);
						}),
						!error && roots.length === 0 ? el('div', { className: 'dsh-tb-empty' },
							el('strong', null, t('emptyTitle')),
							el('span', null, t('emptyHint'))) : null)),
				manual ? el('div', { className: 'dsh-tb-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget && !manualBusy) setManual(null); } },
					el('section', { className: 'dsh-tb-manual-dialog' + (manual.type === 'delete' ? ' dsh-tb-destructive' : ''), role: 'dialog' },
						el('div', { className: 'dsh-tb-warning-icon' }, '!'),
						el('div', null,
							el('h2', null, manual.type === 'create' ? (manual.kind === 'main' ? t('newMain') : manual.kind === 'temporary' ? t('newTmp') : t('newSub')) : tc('delTask', manual.task.code)),
							el('p', { className: 'dsh-tb-manual-warning' }, manual.type === 'create' ? t('warnCreate') : t('warnDelete')),
							manual.type === 'create' ? el('label', null, t('taskTitle'), el('input', { autoFocus: true, value: manualTitle, onChange: function (e) { setManualTitle(e.target.value); }, placeholder: t('titlePh') })) : null,
							manual.type === 'delete' ? el('div', { className: 'dsh-tb-delete-summary' },
								el('strong', null, manual.task.code + ' ' + manual.task.title),
								el('span', null, descendantsOf(manual.task.id).length > 0 ? tn('delDescendants', descendantsOf(manual.task.id).length) : t('delSelf'))) : null,
							el('label', null, tp('typePhrase', manual.type === 'create' ? t('confirmCreate') : t('confirmDelete')),
								el('input', { value: manualConfirm, onChange: function (e) { setManualConfirm(e.target.value); }, onKeyDown: function (e) {
									if (e.key === 'Enter') {
										if (manual.type === 'create') { if (!manualBusy && manualConfirm.trim() === t('confirmCreate') && manualTitle.trim()) confirmCreate(); }
										else { if (!manualBusy && manualConfirm.trim() === t('confirmDelete')) confirmDelete(); }
									}
									if (e.key === 'Escape' && !manualBusy) setManual(null);
								}, placeholder: manual.type === 'create' ? t('confirmCreate') : t('confirmDelete') })),
							el('div', { className: 'dsh-tb-manual-actions' },
								el('button', { type: 'button', className: manual.type === 'delete' ? 'dsh-tb-danger' : 'dsh-tb-primary', disabled: manualBusy || (manual.type === 'create' && !manualTitle.trim()) || manualConfirm.trim() !== (manual.type === 'create' ? t('confirmCreate') : t('confirmDelete')), onClick: function () { if (manual.type === 'create') confirmCreate(); else confirmDelete(); } }, manualBusy ? t('busy') : (manual.type === 'create' ? t('confirmCreateBtn') : t('confirmDeleteBtn'))),
								el('button', { type: 'button', disabled: manualBusy, onClick: function () { setManual(null); } }, t('cancel')))))) : null,
				editTask ? el('div', { className: 'dsh-tb-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget) setEditTask(null); } },
					el('section', { className: 'dsh-tb-manual-dialog', role: 'dialog' },
						el('div', { className: 'dsh-tb-warning-icon' }, '✎'),
						el('div', null,
							el('h2', null, tt('editPrefix', editTask.code + ' ' + editTask.title)),
							el('label', null, t('taskTitle'), el('input', { autoFocus: true, value: editTitle, onChange: function (e) { setEditTitle(e.target.value); }, placeholder: t('titlePh') })),
							el('label', null, t('boundaryLabel'), el('textarea', { value: editBoundary, onChange: function (e) { setEditBoundary(e.target.value); } })),
							el('div', { className: 'dsh-tb-manual-actions' },
								el('button', { type: 'button', className: 'dsh-tb-primary', disabled: !editTitle.trim() || manualBusy, onClick: function () { saveEdit(); } }, t('save')),
								el('button', { type: 'button', onClick: function () { setEditTask(null); } }, t('cancel')))))) : null);
		}

		var tbUnread = '', tbLastRev = null, tbViewActive = false, tbProjectPath = null;
		function tbDotSuffix() { return tbUnread === 'red' ? ' \u{1F534}' : (tbUnread === 'green' ? ' \u{1F7E2}' : ''); }
		function tbUpdateDot() {
			try {
				var header = document.querySelector('[data-slot="conversation.session.header"]') || document;
				var tablist = header.querySelector('[role="tablist"]');
				var root = tablist || header;
				var nodes = root.querySelectorAll('button, [role="tab"], [role="button"], [role="tablist"] *');
				var base = t('tabLabel');
				var suffix = tbDotSuffix();
				var found = 0;
				for (var i = 0; i < nodes.length; i += 1) {
					var n = nodes[i];
					var txt = String(n.textContent || '').trim();
					if (txt.indexOf(base) === -1) continue;
					if (tbUnread === 'red' || tbUnread === 'green') {
						n.innerHTML = base + ' <span style="font-size:8px;vertical-align:middle;line-height:1">' + (tbUnread === 'red' ? '\u{1F534}' : '\u{1F7E2}') + '</span>';
					} else {
						n.textContent = base;
					}
					found = 1;
					break;
				}
			} catch (e) { }
		}
		async function tbPollRevision() {
			if (typeof fetch !== 'function') return;
			try {
				var resp = await fetch('/api/task-board', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ op: 'revision' }) });
				if (!resp.ok) return;
				var data = await resp.json();
				var rev = data && data.revision;
				if (typeof rev !== 'number') return;
				if (tbLastRev === null) { tbLastRev = rev; return; }
				if (rev !== tbLastRev) {
					if (!tbViewActive) { tbUnread = 'red'; tbUpdateDot(); }
					tbLastRev = rev;
				}
			} catch (e) { }
		}
		var jumpActionsBySession = {};
		function TbUnreadHost(props) {
			React.useEffect(function () {
				var disposed = false;
				var dispose = null;
				try {
					var tctx2 = props.tctx;
					if (tctx2 && tctx2.timer && typeof tctx2.timer.interval === 'function') {
						dispose = tctx2.timer.interval(function () { tbPollRevision(); }, 2500);
					}
				} catch (e) { }
				tbPollRevision();
				return function () { disposed = true; if (typeof dispose === 'function') dispose(); };
			}, []);
			return null;
		}

		function apply(ctx) {
			var slots = ctx.get('slots');
			// 会话消息中的「查看任务看板」链接点击捕获：切换视图，无需刷新。
			function handleJump(event) {
				var node = event.target;
				var anchor = null;
				var href = '';
				while (node && node !== document) {
					if (node.getAttribute) {
						var maybe = node.getAttribute('href');
						if (maybe && maybe.indexOf('dsh-view-taskboard') !== -1) { anchor = node; href = maybe; break; }
					}
					if (node.tagName === 'A' && anchor === null) { anchor = node; href = String(node.getAttribute('href') || ''); }
					node = node.parentElement;
				}
				if (href.indexOf('dsh-view-taskboard') === -1) {
					var text = String(event.target && event.target.textContent || '').trim();
					if (text.indexOf(t('jumpText')) === -1 && text.indexOf('查看最新任务看板') === -1 && text.indexOf('View latest task board') === -1) return;
				}
				var m = href.match(/[?&]session=([A-Za-z0-9_-]+)/);
				var actions = m && jumpActionsBySession[m[1]] ? jumpActionsBySession[m[1]] : jumpActionsBySession['__current__'];
				if (event.preventDefault) event.preventDefault();
				if (event.stopPropagation) event.stopPropagation();
				if (actions && typeof actions.setView === 'function') actions.setView('taskboard');
				else activateTab(t('tabLabel'));
			}
			function tbClickCheck() { tbPollRevision(); }
			window.addEventListener('click', handleJump, true);
			window.addEventListener('click', tbClickCheck, true);
			ctx.effect(function () {
				window.removeEventListener('click', handleJump, true);
				window.removeEventListener('click', tbClickCheck, true);
			}, 'dsh-task-board: unread-click');

			if (slots === undefined) return;
			// 样式注入：双通道（data-plugin-css <style> + 构造式 adoptedStyleSheets，对抗严格 CSP/head 替换）。
			var cssText = TB_CSS;
			var styleEl = document.createElement('style');
			styleEl.setAttribute('data-plugin-css', '@etony668/dsh-task-board/task-board.css');
			styleEl.textContent = cssText;
			document.head.appendChild(styleEl);
			try {
				var ss = new CSSStyleSheet();
				ss.replaceSync(cssText);
				if (document.adoptedStyleSheets) {
					document.adoptedStyleSheets = document.adoptedStyleSheets.concat([ss]);
				}
			} catch (e) { /* 构造式样式表视为可选 */ }
			ctx.effect(function () {
				if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
			}, 'dsh-task-board: styles');

			// 会话头部常驻「任务看板」按钮：任何视图一键跳转，纯 onClick 不可被壳劫持。
			function activateTabBack() {
				if (tryLabelAny(['对话', 'Chat', 'Conversation'])) return true;
				var header = document.querySelector('[data-slot="conversation.session.header"]') || document;
				var nodes = header.querySelectorAll('*');
				for (var i = 0; i < nodes.length; i += 1) {
					var n = nodes[i];
					var tx = String(n.textContent || '').trim(); if ((tx === '对话' || tx === 'Chat' || tx === 'Conversation') && n.children.length === 0) {
						var types = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
						for (var t = 0; t < types.length; t += 1) {
							try { n.dispatchEvent(new MouseEvent(types[t], { bubbles: true, cancelable: true, view: window })); } catch (e) { }
						}
						return true;
					}
				}
				var target = jumpActionsBySession['__current__'];
				if (target && typeof target.setView === 'function') { target.setView('chat'); return true; }
				return false;
			}

			function tryLabelAny(labels) {
				for (var i = 0; i < labels.length; i += 1) { if (activateTab(labels[i])) return true; }
				return false;
			}

			function activateTab(label) {
				// 找到会话头部指定文字的视图 tab，派发与手动点击等价的完整事件序列。
				var header = document.querySelector('[data-slot="conversation.session.header"]') || document;
				var nodes = header.querySelectorAll('button, [role="tab"], [role="button"], [role="tablist"] *');
				for (var i = 0; i < nodes.length; i += 1) {
					var n = nodes[i];
					if (String(n.textContent || '').indexOf(label) === -1) continue;
					var types = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
					for (var t = 0; t < types.length; t += 1) {
						try {
							var ev = new MouseEvent(types[t], { bubbles: true, cancelable: true, view: window });
							n.dispatchEvent(ev);
						} catch (e) { }
					}
					return true;
				}
				return false;
			}

			slots.inject('conversation.session.header.utilities', function () {
				return slots.register({ name: 'conversation.session.header.utilities', id: 'dsh-task-board-unread', order: 9999 }, function () { return el(TbUnreadHost, { tctx: ctx }); });
			});
			slots.inject('conversation.view', function () {
				return slots.register({ name: 'conversation.view', id: 'taskboard', order: 20, label: function () { return t('tabLabel'); }, inject: function (sessionId, viewActions) { jumpActionsBySession[sessionId] = viewActions; jumpActionsBySession['__current__'] = viewActions; return { actions: viewActions }; } }, function (props) { return el(TaskBoardView, { sessionId: props.sessionId, tctx: ctx, actions: props.actions }); });
			});
		}

		exports.inject = ['slots', 'timer'];
		exports.apply = apply;
		return module.exports;
	}
});
