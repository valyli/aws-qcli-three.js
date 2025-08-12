#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

class GameMaterialMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'game-material-manage-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'http_get',
          description: '发送HTTP GET请求到远程接口',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: '请求的URL地址'
              },
              headers: {
                type: 'object',
                description: '请求头（可选）',
                additionalProperties: { type: 'string' }
              }
            },
            required: ['url']
          }
        },
        {
          name: 'http_post',
          description: '发送HTTP POST请求到远程接口',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: '请求的URL地址'
              },
              data: {
                type: 'object',
                description: '请求体数据'
              },
              headers: {
                type: 'object',
                description: '请求头（可选）',
                additionalProperties: { type: 'string' }
              }
            },
            required: ['url']
          }
        }
      ]
    }));

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'http_get':
            return await this.handleHttpGet(args);
          case 'http_post':
            return await this.handleHttpPost(args);
          default:
            throw new Error(`未知工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async handleHttpGet(args) {
    const { url, headers = {} } = args;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    const data = await response.text();
    
    return {
      content: [
        {
          type: 'text',
          text: `HTTP GET 请求成功\nURL: ${url}\n状态码: ${response.status}\n响应: ${data}`
        }
      ]
    };
  }

  async handleHttpPost(args) {
    const { url, data = {}, headers = {} } = args;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.text();
    
    return {
      content: [
        {
          type: 'text',
          text: `HTTP POST 请求成功\nURL: ${url}\n状态码: ${response.status}\n响应: ${responseData}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Game Material MCP Server 已启动');
  }
}

const server = new GameMaterialMCPServer();
server.run().catch(console.error);