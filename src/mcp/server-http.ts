/**
 * Graph-Driven Development - MCP Server (HTTP Mode)
 * 
 * 提供 HTTP/SSE 模式的 MCP 协议实现
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { smartBrainstormEngine, SmartClarificationSession } from '../brainstorm/SmartBrainstormEngine';

// ==================== 数据库初始化 ====================

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'gdd.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS graphs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    graph_id TEXT NOT NULL,
    layer TEXT NOT NULL,
    label TEXT NOT NULL,
    properties TEXT,
    status TEXT DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    graph_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    label TEXT,
    properties TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (graph_id) REFERENCES graphs(id) ON DELETE CASCADE
  );
  
  CREATE TABLE IF NOT EXISTS brainstorm_sessions (
    id TEXT PRIMARY KEY,
    graph_id TEXT,
    user_input TEXT,
    context TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS clarifications (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT,
    answer TEXT,
    resolved INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES brainstorm_sessions(id) ON DELETE CASCADE
  );
`);

// ==================== 辅助函数 ====================

function now(): number {
  return Date.now();
}

// ==================== MCP Server ====================

const server = new Server(
  {
    name: 'graph-driven-development',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: { subscribe: true },
    },
  }
);

// ==================== 工具定义 ====================

const TOOLS = [
  {
    name: 'gdd_create_graph',
    description: '创建新的项目图谱',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: '图谱 ID' },
        name: { type: 'string', description: '图谱名称' },
        description: { type: 'string', description: '图谱描述' },
      },
      required: ['graph_id', 'name'],
    },
  },
  {
    name: 'gdd_load_graph',
    description: '加载已有图谱',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: '图谱 ID' },
      },
      required: ['graph_id'],
    },
  },
  {
    name: 'gdd_add_node',
    description: '添加节点到图谱',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: '图谱 ID' },
        layer: { type: 'string', description: '层级 (L1_Constitution, L2_TechStack, L3_Epic, L4_Story, L5_Task)' },
        label: { type: 'string', description: '节点标签' },
        properties: { type: 'object', description: '节点属性' },
      },
      required: ['graph_id', 'layer', 'label'],
    },
  },
  {
    name: 'gdd_add_edge',
    description: '添加边（连接）到图谱',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: '图谱 ID' },
        source_id: { type: 'string', description: '源节点 ID' },
        target_id: { type: 'string', description: '目标节点 ID' },
        label: { type: 'string', description: '边标签' },
      },
      required: ['graph_id', 'source_id', 'target_id'],
    },
  },
  {
    name: 'gdd_smart_start_session',
    description: '启动智能 Brainstorm 会话',
    inputSchema: {
      type: 'object',
      properties: {
        user_input: { type: 'string', description: '用户需求描述' },
        graph_id: { type: 'string', description: '关联图谱 ID（可选）' },
      },
      required: ['user_input'],
    },
  },
  {
    name: 'gdd_smart_get_next_question',
    description: '获取下一个澄清问题',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: '会话 ID' },
      },
      required: ['session_id'],
    },
  },
  {
    name: 'gdd_smart_answer_question',
    description: '回答澄清问题',
    inputSchema: {
      type: 'object',
      properties: {
        session_id: { type: 'string', description: '会话 ID' },
        question_id: { type: 'string', description: '问题 ID' },
        answer: { type: 'array', items: { type: 'string' }, description: '答案' },
      },
      required: ['session_id', 'question_id', 'answer'],
    },
  },
  {
    name: 'gdd_get_graph',
    description: '获取图谱完整数据',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: '图谱 ID' },
      },
      required: ['graph_id'],
    },
  },
  {
    name: 'gdd_list_graphs',
    description: '列出所有图谱',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// ==================== 工具处理 ====================

async function handleToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case 'gdd_create_graph': {
      const { graph_id, name, description } = args;
      const now = Date.now();
      db.prepare('INSERT INTO graphs VALUES (?, ?, ?, ?, ?)').run(
        graph_id, name, description || '', now, now
      );
      return { success: true, graph_id, name, message: `图谱 "${name}" 创建成功` };
    }
    
    case 'gdd_load_graph': {
      const { graph_id } = args;
      const graph = db.prepare('SELECT * FROM graphs WHERE id = ?').get(graph_id);
      if (!graph) {
        return { success: false, error: `图谱 "${graph_id}" 不存在` };
      }
      return { success: true, graph };
    }
    
    case 'gdd_add_node': {
      const { graph_id, layer, label, properties } = args;
      const nodeId = `node_${uuidv4().slice(0, 8)}`;
      const now = Date.now();
      db.prepare('INSERT INTO nodes VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        nodeId, graph_id, layer, label, JSON.stringify(properties || {}), 'draft', now, now
      );
      return { success: true, node_id: nodeId, layer, label, message: `节点 "${label}" 添加成功` };
    }
    
    case 'gdd_add_edge': {
      const { graph_id, source_id, target_id, label } = args;
      const edgeId = `edge_${uuidv4().slice(0, 8)}`;
      const now = Date.now();
      db.prepare('INSERT INTO edges VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        edgeId, graph_id, source_id, target_id, label || '', now
      );
      return { success: true, edge_id: edgeId, message: `边 "${label || ''}" 添加成功` };
    }
    
    case 'gdd_smart_start_session': {
      const { user_input, graph_id } = args;
      const sessionId = `session_${uuidv4().slice(0, 8)}`;
      const now = Date.now();
      
      // 保存会话
      db.prepare('INSERT INTO brainstorm_sessions VALUES (?, ?, ?, ?, ?)').run(
        sessionId, graph_id || null, user_input, '{}', now, now
      );
      
      // 简单的 Brainstorm 逻辑
      const questions = [
        { id: `q1_${sessionId}`, question: '请选择技术栈', options: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
        { id: `q2_${sessionId}`, question: '项目类型是什么', options: ['Web应用', 'CLI工具', '游戏', '库/框架'] },
        { id: `q3_${sessionId}`, question: '需要哪些核心功能', options: ['认证授权', '数据库', 'API接口', '实时通信'] },
      ];
      
      questions.forEach(q => {
        db.prepare('INSERT INTO clarifications VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          q.id, sessionId, q.question, JSON.stringify(q.options), null, 0, now
        );
      });
      
      return { 
        success: true, 
        session_id: sessionId, 
        message: 'Brainstorm 会话已启动',
        questions: questions
      };
    }
    
    case 'gdd_smart_get_next_question': {
      const { session_id } = args;
      const unanswered = db.prepare(`
        SELECT * FROM clarifications WHERE session_id = ? AND resolved = 0
      `).all(session_id);
      
      if (unanswered.length === 0) {
        return { success: true, has_more: false, message: '所有问题已回答完毕' };
      }
      
      const next = unanswered[0];
      return { 
        success: true, 
        has_more: true,
        question: { id: next.id, question: next.question, options: JSON.parse(next.options) }
      };
    }
    
    case 'gdd_smart_answer_question': {
      const { session_id, question_id, answer } = args;
      db.prepare('UPDATE clarifications SET answer = ?, resolved = 1 WHERE id = ?').run(
        JSON.stringify(answer), question_id
      );
      db.prepare('UPDATE brainstorm_sessions SET updated_at = ? WHERE id = ?').run(
        Date.now(), session_id
      );
      return { success: true, message: '答案已记录' };
    }
    
    case 'gdd_get_graph': {
      const { graph_id } = args;
      const graph = db.prepare('SELECT * FROM graphs WHERE id = ?').get(graph_id);
      const nodes = db.prepare('SELECT * FROM nodes WHERE graph_id = ?').all(graph_id);
      const edges = db.prepare('SELECT * FROM edges WHERE graph_id = ?').all(graph_id);
      
      return { 
        success: true, 
        graph: { ...graph, nodes, edges }
      };
    }
    
    case 'gdd_list_graphs': {
      const graphs = db.prepare('SELECT * FROM graphs').all();
      return { success: true, graphs };
    }
    
    default:
      return { success: false, error: `未知工具: ${name}` };
  }
}

// ==================== HTTP 服务器 ====================

const app = express();
app.use(cors());
app.use(express.json());

// MCP 端点
const transports = new Map<string, StreamableHTTPServerTransport>();

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string || uuidv4();
  
  let transport = transports.get(sessionId);
  if (!transport) {
    transport = new StreamableHTTPServerTransport();
    await server.connect(transport);
    transports.set(sessionId, transport);
  }
  
  res.setHeader('mcp-session-id', sessionId);
  await transport.handleRequest(req, res);
});

app.get('/mcp', (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string || uuidv4();
  res.setHeader('mcp-session-id', sessionId);
  res.json({ 
    jsonrpc: '2.0', 
    result: { 
      protocolVersion: '2024-11-05', 
      capabilities: { tools: {}, resources: { subscribe: true } },
      serverInfo: { name: 'gdd-http', version: '0.1.0' }
    },
    id: 0 
  });
});

app.delete('/mcp', (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  if (sessionId) {
    const transport = transports.get(sessionId);
    if (transport) {
      transport.close();
      transports.delete(sessionId);
    }
  }
  res.status(204).send();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

// 工具列表（直接 HTTP 调用）
app.get('/tools', (req, res) => {
  res.json({ tools: TOOLS });
});

// 工具调用（直接 HTTP 调用）
app.post('/tools/invoke', async (req, res) => {
  const { name, arguments: args } = req.body;
  try {
    const result = await handleToolCall(name, args || {});
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, error: String(error) });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`🚀 GDD MCP Server (HTTP) running at http://localhost:${PORT}`);
  console.log(`   MCP Endpoint: http://localhost:${PORT}/mcp`);
  console.log(`   Tools Endpoint: http://localhost:${PORT}/tools`);
});
