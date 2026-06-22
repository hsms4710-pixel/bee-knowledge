import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// 数据存储
const DATA_FILE = path.join(process.cwd(), 'data', 'gdd-games.json');
const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData(): any {
  if (!fs.existsSync(DATA_FILE)) {
    return { graphs: {}, sessions: {} };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data: any): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 工具定义
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
    inputSchema: { type: 'object', properties: {} },
  },
];

// 工具处理
async function handleToolCall(name: string, args: any): Promise<any> {
  const data = loadData();
  
  switch (name) {
    case 'gdd_create_graph': {
      const { graph_id, name, description } = args;
      const now = Date.now();
      data.graphs[graph_id] = {
        id: graph_id,
        name,
        description: description || '',
        nodes: [],
        edges: [],
        created_at: now,
        updated_at: now,
      };
      saveData(data);
      return { success: true, graph_id, name, message: `图谱 "${name}" 创建成功` };
    }
    
    case 'gdd_add_node': {
      const { graph_id, layer, label, properties } = args;
      if (!data.graphs[graph_id]) {
        return { success: false, error: `图谱 "${graph_id}" 不存在` };
      }
      const nodeId = `node_${uuidv4().slice(0, 8)}`;
      const node = {
        id: nodeId,
        layer,
        label,
        properties: properties || {},
        status: 'draft',
        created_at: Date.now(),
      };
      data.graphs[graph_id].nodes.push(node);
      data.graphs[graph_id].updated_at = Date.now();
      saveData(data);
      return { success: true, node_id: nodeId, layer, label, message: `节点 "${label}" 添加成功` };
    }
    
    case 'gdd_add_edge': {
      const { graph_id, source_id, target_id, label } = args;
      if (!data.graphs[graph_id]) {
        return { success: false, error: `图谱 "${graph_id}" 不存在` };
      }
      const edgeId = `edge_${uuidv4().slice(0, 8)}`;
      const edge = {
        id: edgeId,
        source_id,
        target_id,
        label: label || '',
        created_at: Date.now(),
      };
      data.graphs[graph_id].edges.push(edge);
      data.graphs[graph_id].updated_at = Date.now();
      saveData(data);
      return { success: true, edge_id: edgeId, message: `边 "${label || ''}" 添加成功` };
    }
    
    case 'gdd_smart_start_session': {
      const { user_input, graph_id } = args;
      const sessionId = `session_${uuidv4().slice(0, 8)}`;
      const now = Date.now();
      
      // 简单的 Brainstorm 逻辑
      const questions = [
        { id: `q1_${sessionId}`, question: '请选择技术栈', options: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
        { id: `q2_${sessionId}`, question: '项目类型是什么', options: ['Web应用', 'CLI工具', '游戏', '库/框架'] },
        { id: `q3_${sessionId}`, question: '需要哪些核心功能', options: ['认证授权', '数据库', 'API接口', '实时通信'] },
      ];
      
      data.sessions[sessionId] = {
        id: sessionId,
        graph_id: graph_id || null,
        user_input,
        questions,
        answers: {},
        created_at: now,
        updated_at: now,
      };
      saveData(data);
      
      return { 
        success: true, 
        session_id: sessionId, 
        message: 'Brainstorm 会话已启动',
        questions: questions
      };
    }
    
    case 'gdd_smart_get_next_question': {
      const { session_id } = args;
      const session = data.sessions[session_id];
      if (!session) {
        return { success: false, error: `会话 "${session_id}" 不存在` };
      }
      
      const unanswered = session.questions.filter(q => !session.answers[q.id]);
      if (unanswered.length === 0) {
        return { success: true, has_more: false, message: '所有问题已回答完毕' };
      }
      
      return { 
        success: true, 
        has_more: true,
        question: unanswered[0]
      };
    }
    
    case 'gdd_smart_answer_question': {
      const { session_id, question_id, answer } = args;
      const session = data.sessions[session_id];
      if (!session) {
        return { success: false, error: `会话 "${session_id}" 不存在` };
      }
      
      session.answers[question_id] = answer;
      session.updated_at = Date.now();
      saveData(data);
      return { success: true, message: '答案已记录' };
    }
    
    case 'gdd_get_graph': {
      const { graph_id } = args;
      const graph = data.graphs[graph_id];
      if (!graph) {
        return { success: false, error: `图谱 "${graph_id}" 不存在` };
      }
      return { success: true, graph };
    }
    
    case 'gdd_list_graphs': {
      const graphs = Object.values(data.graphs);
      return { success: true, graphs };
    }
    
    default:
      return { success: false, error: `未知工具: ${name}` };
  }
}

// MCP 端点
const transports = new Map<string, any>();

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string || uuidv4();
  res.setHeader('mcp-session-id', sessionId);
  
  // 处理 JSON-RPC 请求
  const { id, method, params } = req.body;
  
  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, resources: { subscribe: true } },
        serverInfo: { name: 'gdd-http', version: '0.1.0' }
      },
      id
    });
  }
  
  if (method === 'tools/list') {
    return res.json({ jsonrpc: '2.0', result: { tools: TOOLS }, id });
  }
  
  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    try {
      const result = await handleToolCall(name, args || {});
      return res.json({ jsonrpc: '2.0', result: { content: [{ type: 'text', text: JSON.stringify(result) }] }, id });
    } catch (error) {
      return res.json({ jsonrpc: '2.0', error: { code: -32603, message: String(error) }, id });
    }
  }
  
  res.json({ jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${method}` }, id });
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
  console.log(`🚀 GDD MCP Server running at http://localhost:${PORT}`);
  console.log(`   MCP Endpoint: http://localhost:${PORT}/mcp`);
  console.log(`   Tools Endpoint: http://localhost:${PORT}/tools`);
});
