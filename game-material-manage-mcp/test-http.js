#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function testHTTPGet() {
  console.log('🌐 测试HTTP GET请求...');
  
  const mcpProcess = spawn('node', [join(__dirname, 'index.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // 初始化
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };
  mcpProcess.stdin.write(JSON.stringify(initMessage) + '\n');

  // 发送HTTP GET请求
  setTimeout(() => {
    const httpGetMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'http_get',
        arguments: {
          url: 'https://httpbin.org/get'
        }
      }
    };
    mcpProcess.stdin.write(JSON.stringify(httpGetMessage) + '\n');
  }, 1000);

  mcpProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const response = JSON.parse(line);
        if (response.id === 2) {
          console.log('✅ HTTP GET 测试成功!');
          console.log('📨 响应:', response.result.content[0].text);
        }
      } catch (e) {
        console.log('📝 输出:', line);
      }
    });
  });

  mcpProcess.stderr.on('data', (data) => {
    console.log('🔍 服务器日志:', data.toString());
  });

  setTimeout(() => {
    mcpProcess.kill();
    process.exit(0);
  }, 10000);
}

testHTTPGet();