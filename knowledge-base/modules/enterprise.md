# enterprise 模块

包含 6 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| CollaborationManager | CollaborationManager 类 | joinSession, leaveSession, updateCursor, getSession, createSession... +14 |
| DistributedIndexer | DistributedIndexer 类 | initialize, start, stop, indexProject, scanFiles... +24 |
| NotificationManager | NotificationManager 类 | sendNotification, sendBatchNotifications, getNotifications, markAsRead, markAllAsRead... +16 |
| ProjectManager | ProjectManager 类 | createProject, getProject, updateProject, archiveProject, deleteProject... +18 |
| IndexManager | IndexManager 类 | createIndex, dropIndex, getIndex, getTableIndexes, addIndexData... +9 |
| QueryCache | QueryCache 类 | delete, clear, getStats, hashQuery, createIndex... +2 |
| QueryOptimizer | QueryOptimizer 类 | createIndex, getStats, clearCache, initStats |
| UserManager | UserManager 类 | createUser, getUser, getUserById, updateUser, deleteUser... +18 |

## 接口/类型

- `CollaborationSession` (19 字段: id, userId, nodeId, emoji, sessions... +14)
- `Collaborator` (19 字段: userId, nodeId, id, emoji, sessions... +14)
- `CursorPosition` (19 字段: nodeId, id, emoji, sessions, session... +14)
- `Comment` (18 字段: id, emoji, sessions, session, userId... +13)
- `CommentReply` (18 字段: id, emoji, sessions, session, userId... +13)
- `DiscussionThread` (18 字段: id, emoji, sessions, session, userId... +13)
- `DiscussionMessage` (18 字段: id, emoji, sessions, session, userId... +13)
- `MessageReaction` (18 字段: emoji, id, sessions, session, userId... +13)
- `EditOperation` (17 字段: id, sessions, session, userId, 0... +12)
- `ConflictResolution` (17 字段: id, sessions, session, userId, 0... +12)
- `EditType` (0 字段: )
- `DistributedIndexerConfig` (29 字段: maxWorkers, id, taskId, path, name... +24)
- `WorkerTask` (28 字段: id, taskId, path, name, from... +23)
- `WorkerResult` (28 字段: taskId, id, path, name, from... +23)
- `ShardInfo` (27 字段: id, path, name, from, config... +22)
- `IndexShard` (27 字段: id, path, name, from, config... +22)
- `FileInfo` (26 字段: path, name, from, config, taskQueue... +21)
- `SymbolInfo` (25 字段: name, from, config, taskQueue, return... +20)
- `DependencyInfo` (24 字段: from, config, taskQueue, return, 0... +19)
- `Notification` (16 字段: id, userId, notifications, notification, boolean... +11)
- `NotificationAction` (16 字段: id, userId, notifications, notification, boolean... +11)
- `NotificationSubscription` (16 字段: userId, id, notifications, notification, boolean... +11)
- `EmailTemplate` (16 字段: id, userId, notifications, notification, boolean... +11)
- `PushNotification` (16 字段: id, userId, notifications, notification, boolean... +11)
- `NotificationQueueItem` (16 字段: id, notifications, notification, userId, boolean... +11)
- `NotificationChannel` (0 字段: )
- `NotificationType` (0 字段: )
- `EnterpriseProject` (30 字段: id, autoSave, notifications, nodeCount, type... +25)
- `ProjectSettings` (30 字段: autoSave, notifications, nodeCount, id, type... +25)
- `ProjectStatistics` (28 字段: nodeCount, id, type, nodes, version... +23)
- `ProjectVersion` (27 字段: id, type, nodes, version, projects... +22)
- `VersionChange` (27 字段: type, nodes, version, id, projects... +22)
- `ProjectSnapshot` (26 字段: nodes, version, id, projects, project... +21)
- `ProjectExport` (25 字段: version, id, projects, project, updates... +20)
- `ProjectImport` (25 字段: id, projects, project, updates, updated... +20)
- `ProjectTemplate` (25 字段: id, projects, project, updates, updated... +20)
- `DefaultNode` (25 字段: id, projects, project, updates, updated... +20)
- `QueryPlan` (27 字段: query, field, left, name, queryHash... +22)
- `QueryFilter` (27 字段: field, left, name, queryHash, totalQueries... +22)
- `QueryJoin` (26 字段: left, name, queryHash, totalQueries, byType... +21)
- `IndexDefinition` (25 字段: name, queryHash, totalQueries, byType, indexes... +20)
- `QueryCacheEntry` (24 字段: queryHash, totalQueries, byType, indexes, index... +19)
- `QueryStatistics` (23 字段: totalQueries, byType, indexes, index, true... +18)
- `User` (21 字段: id, theme, editor, userId, visibility... +16)
- `UserPreferences` (21 字段: theme, editor, id, userId, visibility... +16)
- `Team` (19 字段: id, userId, visibility, users, email... +14)
- `TeamMember` (19 字段: userId, visibility, id, users, email... +14)
- `TeamSettings` (19 字段: visibility, id, users, email, user... +14)
- `Session` (18 字段: id, users, email, user, undefined... +13)
- `AuditLog` (18 字段: id, users, email, user, undefined... +13)
- `UserRole` (0 字段: )
- `UserStatus` (0 字段: )
- `Permission` (0 字段: )
- `AuditAction` (0 字段: )

## 核心流程

- **查询**: 39 个

## 依赖

### 外部依赖

- `module`
