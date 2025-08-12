#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试MCP服务器
function testMCPServer() {
  console.log('🧪 开始测试MCP服务器...');
  
  const mcpProcess = spawn('node', [join(__dirname, 'index.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // 发送初始化消息
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  mcpProcess.stdin.write(JSON.stringify(initMessage) + '\n');

  // 发送工具列表请求
  setTimeout(() => {
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };
    mcpProcess.stdin.write(JSON.stringify(listToolsMessage) + '\n');
  }, 1000);

  // 监听响应
  mcpProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const response = JSON.parse(line);
        console.log('📨 收到响应:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📝 输出:', line);
      }
    });
  });

  mcpProcess.stderr.on('data', (data) => {
    console.log('🔍 服务器日志:', data.toString());
  });

  // 5秒后结束测试
  setTimeout(() => {
    mcpProcess.kill();
    console.log('✅ 测试完成');
    process.exit(0);
  }, 5000);
}

testMCPServer();