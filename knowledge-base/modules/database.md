# database 模块

包含 1 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| SchemaGenerator | SchemaGenerator 类 | generatePrisma, generatePrismaModel, generatePrismaColumn, toPascalCase, generateDrizzle... +11 |
| MigrationGenerator | MigrationGenerator 类 | generateMigration |

## 接口/类型

- `DatabaseConfig` (15 字段: type, name, table, string, parts... +10)
- `DatabaseSchema` (15 字段: name, table, type, string, parts... +10)
- `TableDefinition` (15 字段: name, table, type, string, parts... +10)
- `ColumnDefinition` (15 字段: name, table, type, string, parts... +10)
- `Reference` (15 字段: table, type, name, string, parts... +10)
- `Constraint` (14 字段: type, name, string, parts, lines... +9)
- `IndexDefinition` (14 字段: name, type, string, parts, lines... +9)
- `Relationship` (13 字段: type, string, parts, lines, definition... +8)
- `TableOptions` (12 字段: string, parts, lines, definition, schema... +7)
- `DatabaseType` (0 字段: )
- `ColumnType` (0 字段: )

## 依赖

### 外部依赖

- `drizzle-orm/pg-core`
- `typeorm`
