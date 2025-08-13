# Game Material Manage MCP Server

一个用于游戏素材管理的MCP服务器，支持通过HTTP访问远程接口。

## 安装

```bash
cd game-material-manage-mcp
npm install
```

## 配置环境变量

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入您的API密钥：
```
API_KEY=your_actual_api_key_here
```

**重要**: `.env` 文件已添加到 `.gitignore`，不会被提交到版本控制系统。

## 使用

### 启动服务器
```bash
npm start
```

### 配置Amazon Q

#### 方法1: 项目级配置（推荐）
在项目根目录创建 `.amazonq/agents/default.json`：

```json
{
  "name": "default-agent",
  "version": "1.0.0",
  "description": "Default agent configuration",
  "mcpServers": {
    "game-material-manage": {
      "command": "node",
      "args": ["/Users/valyli/lj/pub-git/aws-qcli-three.js/game-material-manage-mcp/index.js"]
    }
  },
  "allowedTools": [
    "http_get",
    "http_post",
    "search",
    "download_first_result"
  ]
}
```

#### 方法2: VS Code全局配置
在VS Code设置文件中添加：

```json
{
  "amazonq.mcpServers": {
    "game-material-manage": {
      "command": "node",
      "args": ["/path/to/game-material-manage-mcp/index.js"]
    }
  }
}
```

**重要**: 配置完成后必须完全重启VS Code，MCP配置只在启动时加载。

## 可用工具

### http_get
发送HTTP GET请求到远程接口

参数：
- `url` (必需): 请求的URL地址
- `headers` (可选): 请求头对象

### http_post  
发送HTTP POST请求到远程接口

参数：
- `url` (必需): 请求的URL地址
- `data` (可选): 请求体数据对象
- `headers` (可选): 请求头对象

### search
搜索游戏素材标签

参数：
- `keywords` (必需): 搜索关键词
- `search_mode` (可选): 搜索模式，支持 'exact'（精确）或 'fuzzy'（模糊），默认为 'exact'

### download_first_result
搜索并下载第一个结果的图片文件到本地

参数：
- `keywords` (必需): 搜索关键词
- `search_mode` (可选): 搜索模式，支持 'exact' 或 'fuzzy'，默认为 'exact'
- `download_path` (可选): 下载文件保存路径，默认为当前目录

## 测试

### 1. 独立测试MCP服务器
```bash
# 测试服务器启动和工具列表
node test-mcp.js

# 测试HTTP GET功能
node test-http.js
```

### 2. 在Amazon Q中测试
配置完成并重启VS Code后，在聊天中输入：

```
请使用http_get工具访问 https://httpbin.org/get
```

或

```
使用http_post工具发送数据到 https://httpbin.org/post，数据为 {"test": "hello"}
```

```
使用search工具搜索关键词"手机"
```

```
使用download_first_result工具搜索并下载关键词"手机"的第一个结果
```

## 使用示例

### 在Amazon Q聊天中调用
```
请使用http_get工具访问 https://api.github.com/users/octocat
```

```
使用http_post工具：
- URL: https://httpbin.org/post
- 数据: {"message": "hello world", "timestamp": "2024-01-01"}
- Headers: {"Authorization": "Bearer token123"}
```

```
搜索游戏素材，关键词是"武器"，使用模糊搜索模式
```

```
下载手机相关的素材图片到Downloads文件夹
```

### JSON格式示例
```javascript
// GET请求示例
{
  "name": "http_get",
  "arguments": {
    "url": "https://api.example.com/materials",
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }
}

// POST请求示例
{
  "name": "http_post", 
  "arguments": {
    "url": "https://api.example.com/materials",
    "data": {
      "name": "新素材",
      "type": "texture"
    },
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }
}

// 搜索示例
{
  "name": "search",
  "arguments": {
    "keywords": "手机",
    "search_mode": "exact"
  }
}

// 下载示例
{
  "name": "download_first_result",
  "arguments": {
    "keywords": "手机",
    "search_mode": "exact",
    "download_path": "/Users/username/Downloads"
  }
}
```

## 故障排除

1. **工具无法调用**: 确保已完全重启VS Code
2. **服务器启动失败**: 检查Node.js版本和依赖安装
3. **配置不生效**: 验证配置文件路径和JSON格式
4. **权限问题**: 确保脚本文件有执行权限