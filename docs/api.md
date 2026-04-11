# API 使用与设计

## 设计原则
- 一致性：遵循统一的请求/响应结构。
- 最小暴露：对外暴露的 API 封装层尽量简洁、稳定。
- 可测试性：便于单元测试和集成测试的设计。

## 目录与职责
- apis/：对后端公开 API 的最小化封装，负责构建请求、处理响应、暴露简洁方法。
- services/：将 API 封装与页面业务逻辑结合，提供更高层次的业务接口。
- utils/：通用工具，如 http 客户端、错误处理、请求拦截等。

## 请求客户端与约束
- 全局错误处理，统一返回结构：{ ok, data, error }
- 统一的超时与重试策略
- 鉴权信息通过请求头传递：Authorization: Bearer <token>
- 返回数据结构尽量简单，便于 UI 层处理

## 常用调用示例
```js
// 假设存在 apis/listApi.js 和 services/listService.js
import { fetchList } from '../apis/listApi'
import { wrapListService } from '../services/listService'

async function loadList(params) {
  const res = await fetchList(params)
  if (res.ok) return wrapListService(res.data)
  throw new Error(res.error || 'Failed to fetch list')
}
```

## 鉴权与会话管理
- tokens 应该通过安全存储获取并附带在每次请求中。
- 刷新策略按后端实现，不在前端硬编码刷新逻辑。

## 版本与向后兼容
- 新版本应尽量向后兼容，必要时提供迁移文档。
