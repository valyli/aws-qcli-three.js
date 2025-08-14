#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ 
  path: join(__dirname, '.env'),
  override: true,
  debug: true 
});

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
        },
        {
          name: 'search',
          description: '搜索游戏素材标签',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'string',
                description: '搜索关键词'
              },
              search_mode: {
                type: 'string',
                description: '搜索模式',
                enum: ['exact', 'fuzzy'],
                default: 'exact'
              }
            },
            required: ['keywords']
          }
        },
        {
          name: 'download_first_result',
          description: '搜索并下载第一个结果的图片文件到本地',
          inputSchema: {
            type: 'object',
            properties: {
              keywords: {
                type: 'string',
                description: '搜索关键词'
              },
              search_mode: {
                type: 'string',
                description: '搜索模式',
                enum: ['exact', 'fuzzy'],
                default: 'exact'
              },
              download_path: {
                type: 'string',
                description: '下载文件保存路径（可选，默认为当前目录）'
              }
            },
            required: ['keywords']
          }
        },
        {
          name: 'image_search',
          description: '使用AI智能搜索技术搜索游戏素材',
          inputSchema: {
            type: 'object',
            properties: {
              search_text: {
                type: 'string',
                description: '自然语言搜索描述，如“一辆红色的赛车”或“现代风格的手机”'
              },
              embedding_model_type: {
                type: 'string',
                description: '嵌入模型类型',
                default: 'twelvelabs.marengo-embed-2-7-v1'
              },
              media_type: {
                type: 'string',
                description: '媒体类型',
                enum: ['text', 'image'],
                default: 'text'
              },
              s3uri: {
                type: 'string',
                description: 'S3 URI（可选）',
                default: ''
              }
            },
            required: ['search_text']
          }
        },
        {
          name: 'download_first_material',
          description: '使用AI智能搜索并下载第一个结果的游戏素材文件到本地',
          inputSchema: {
            type: 'object',
            properties: {
              search_text: {
                type: 'string',
                description: '自然语言搜索描述，如“一辆红色的赛车”或“现代风格的手机”'
              },
              embedding_model_type: {
                type: 'string',
                description: '嵌入模型类型',
                default: 'twelvelabs.marengo-embed-2-7-v1'
              },
              media_type: {
                type: 'string',
                description: '媒体类型',
                enum: ['text', 'image'],
                default: 'text'
              },
              s3uri: {
                type: 'string',
                description: 'S3 URI（可选）',
                default: ''
              },
              download_path: {
                type: 'string',
                description: '下载文件保存路径（可选，默认为当前目录）'
              }
            },
            required: ['search_text']
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
          case 'search':
            return await this.handleSearch(args);
          case 'download_first_result':
            return await this.handleDownloadFirstResult(args);
          case 'image_search':
            return await this.handleImageSearch(args);
          case 'download_first_material':
            return await this.handleDownloadFirstMaterial(args);
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

  async handleSearch(args) {
    const { keywords, search_mode = 'exact' } = args;
    
    const encodedKeywords = encodeURIComponent(keywords);
    const baseUrl = process.env.API_BASE_URL;
    
    if (!baseUrl) {
      throw new Error('API_BASE_URL 环境变量未设置');
    }
    const url = `${baseUrl}/public/tag-searchs/keyword-search?search_mode=${search_mode}&keywords=${encodedKeywords}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.API_KEY
      }
    });

    const data = await response.text();
    
    return {
      content: [
        {
          type: 'text',
          text: `搜索结果\n关键词: ${keywords}\n搜索模式: ${search_mode}\n状态码: ${response.status}\n结果: ${data}`
        }
      ]
    };
  }

  async handleDownloadFirstResult(args) {
    const { keywords, search_mode = 'exact', download_path = '.' } = args;
    
    try {
      // 调用search接口
      const searchResult = await this.handleSearch({ keywords, search_mode });
      const searchData = searchResult.content[0].text;
      
      // 提取JSON数据
      const jsonMatch = searchData.match(/结果: (.+)$/);
      if (!jsonMatch) {
        return {
          content: [
            {
              type: 'text',
              text: `下载失败\n关键词: ${keywords}\n错误: 无法解析搜索结果\n原始数据: ${searchData.substring(0, 500)}...`
            }
          ]
        };
      }
      
      const jsonData = JSON.parse(jsonMatch[1]);
      
      // 检查是否有结果
      if (!jsonData.body || !jsonData.body.hits || !jsonData.body.hits.hits || jsonData.body.hits.hits.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `下载失败\n关键词: ${keywords}\n原因: 未找到匹配的结果`
            }
          ]
        };
      }
      
      // s3_presigned_url在最外层的jsonData中
      let presignedUrl = null;
      
      // 从最外层获取s3_presigned_url
      if (jsonData.body && jsonData.body.hits && jsonData.body.hits.hits && jsonData.body.hits.hits.length > 0) {
        const firstResult = jsonData.body.hits.hits[0];
        
        // 先尝试从_source中获取
        if (firstResult._source && firstResult._source.s3_presigned_url) {
          presignedUrl = firstResult._source.s3_presigned_url;
        }
      }
      
      // 如果_source中没有，尝试从最外层获取
      if (!presignedUrl && jsonData.body && jsonData.body.hits && jsonData.body.hits.hits && jsonData.body.hits.hits.length > 0) {
        // 查看完整的数据结构，从搜索结果中可以看到s3_presigned_url在最外层
        const fullData = jsonData.body.hits.hits[0];
        if (fullData.s3_presigned_url) {
          presignedUrl = fullData.s3_presigned_url;
        }
      }
      
      // 最后尝试从最外层的jsonData获取
      if (!presignedUrl) {
        // 从搜索结果可以看到，s3_presigned_url在最外层
        if (jsonData.body && jsonData.body.hits && jsonData.body.hits.hits && jsonData.body.hits.hits.length > 0) {
          // 直接从整个结果中查找
          const resultStr = JSON.stringify(jsonData);
          const urlMatch = resultStr.match(/"s3_presigned_url":"([^"]+)"/);
          if (urlMatch) {
            presignedUrl = urlMatch[1];
          }
        }
      }
      
      if (!presignedUrl) {
        return {
          content: [
            {
              type: 'text',
              text: `下载失败\n关键词: ${keywords}\n错误: 未找到s3_presigned_url\n第一个结果结构: ${JSON.stringify(firstResult._source, null, 2).substring(0, 500)}...`
            }
          ]
        };
      }
      
      // 下载文件
      const fileResponse = await fetch(presignedUrl);
      if (!fileResponse.ok) {
        throw new Error(`下载失败: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      // 从 URL 中提取文件扩展名
      let fileExtension = '.png'; // 默认扩展名
      
      // 从 S3 URL 中提取文件扩展名
      const urlParts = presignedUrl.split('/');
      const fileName_from_url = urlParts[urlParts.length - 1].split('?')[0]; // 移除查询参数
      const extensionMatch = fileName_from_url.match(/\.([^.]+)$/);
      
      if (extensionMatch) {
        fileExtension = '.' + extensionMatch[1];
      }
      
      // 生成文件名
      const fileName = `${keywords}_${Date.now()}${fileExtension}`;
      const filePath = path.join(download_path, fileName);
      
      // 保存文件
      const buffer = await fileResponse.buffer();
      fs.writeFileSync(filePath, buffer);
      
      return {
        content: [
          {
            type: 'text',
            text: `下载成功\n关键词: ${keywords}\n文件路径: ${filePath}\n文件大小: ${buffer.length} bytes\nS3 URL: ${presignedUrl}`
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `下载失败\n关键词: ${keywords}\n错误: ${error.message}`
          }
        ]
      };
    }
  }

  async handleImageSearch(args) {
    const { 
      search_text, 
      embedding_model_type = 'twelvelabs.marengo-embed-2-7-v1',
      media_type = 'text',
      s3uri = ''
    } = args;
    
    const baseUrl = process.env.API_BASE_URL;
    
    if (!baseUrl) {
      throw new Error('API_BASE_URL 环境变量未设置');
    }
    
    const encodedSearchText = encodeURIComponent(search_text);
    const url = `${baseUrl}/tag-searchs/image-search?embedding_model_type=${embedding_model_type}&media_type=${media_type}&s3uri=${s3uri}&search_text=${encodedSearchText}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.text();
    
    return {
      content: [
        {
          type: 'text',
          text: `AI智能搜索结果\n搜索描述: ${search_text}\n模型类型: ${embedding_model_type}\n媒体类型: ${media_type}\n状态码: ${response.status}\n结果: ${data}`
        }
      ]
    };
  }

  async handleDownloadFirstMaterial(args) {
    const { 
      search_text, 
      embedding_model_type = 'twelvelabs.marengo-embed-2-7-v1',
      media_type = 'text',
      s3uri = '',
      download_path = '.'
    } = args;
    
    try {
      // 调用image_search接口
      const searchResult = await this.handleImageSearch({ search_text, embedding_model_type, media_type, s3uri });
      const searchData = searchResult.content[0].text;
      
      // 提取JSON数据
      const jsonMatch = searchData.match(/结果: (.+)$/);
      if (!jsonMatch) {
        return {
          content: [
            {
              type: 'text',
              text: `下载失败\n搜索描述: ${search_text}\n错误: 无法解析搜索结果\n原始数据: ${searchData.substring(0, 500)}...`
            }
          ]
        };
      }
      
      const jsonData = JSON.parse(jsonMatch[1]);
      
      // 检查是否有结果
      if (!jsonData.body || !jsonData.body.results || jsonData.body.results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `下载失败\n搜索描述: ${search_text}\n原因: 未找到匹配的结果`
            }
          ]
        };
      }
      
      // 获取第一个结果的s3_presigned_url
      const firstResult = jsonData.body.results[0];
      const presignedUrl = firstResult.s3_presigned_url;
      
      if (!presignedUrl) {
        return {
          content: [
            {
              type: 'text',
              text: `下载失败\n搜索描述: ${search_text}\n错误: 未找到s3_presigned_url`
            }
          ]
        };
      }
      
      // 下载文件
      const fileResponse = await fetch(presignedUrl);
      if (!fileResponse.ok) {
        throw new Error(`下载失败: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      // 从 URL 中提取文件扩展名
      let fileExtension = '.png'; // 默认扩展名
      
      // 从 S3 URL 中提取文件扩展名
      const urlParts = presignedUrl.split('/');
      const fileName_from_url = urlParts[urlParts.length - 1].split('?')[0]; // 移除查询参数
      const extensionMatch = fileName_from_url.match(/\.([^.]+)$/);
      
      if (extensionMatch) {
        fileExtension = '.' + extensionMatch[1];
      }
      
      // 生成文件名
      const fileName = `${search_text}_${Date.now()}${fileExtension}`;
      const filePath = path.join(download_path, fileName);
      
      // 保存文件
      const buffer = await fileResponse.buffer();
      fs.writeFileSync(filePath, buffer);
      
      return {
        content: [
          {
            type: 'text',
            text: `AI智能搜索下载成功\n搜索描述: ${search_text}\n文件路径: ${filePath}\n文件大小: ${buffer.length} bytes\n相似度: ${firstResult.similarity_percentage}\nS3 URL: ${presignedUrl}`
          }
        ]
      };
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `下载失败\n搜索描述: ${search_text}\n错误: ${error.message}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Game Material MCP Server 已启动');
  }
}

const server = new GameMaterialMCPServer();
server.run().catch(console.error);