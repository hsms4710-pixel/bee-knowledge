# templates 模块

包含 1 个文件

## 类

| 类名 | 功能 | 方法 |
|------|------|------|
| TemplateManager | TemplateManager 类 | getAllTemplates, getTemplate, getTemplatesByLanguage, getTemplatesByCategory, searchTemplates... +4 |

## 接口/类型

- `ProjectTemplate` (11 字段: id, path, projectName, padding, templates... +6)
- `TemplateFile` (10 字段: path, projectName, padding, templates, string... +5)
- `TemplateContext` (10 字段: projectName, path, padding, templates, string... +5)
- `GeneratedProject` (9 字段: path, padding, templates, string, 0... +4)

## 核心流程

- **查询**: 4 个

## 依赖

### 内部依赖

- `@vitejs/plugin-react`
- `./App`

### 外部依赖

- `vite`
- `react`
- `react-dom/client`
- `next`
