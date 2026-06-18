# UI 组件库选型分析

## 背景

项目当前使用 `taro-ui@^3.2.0`，但实际使用量很少（仅 AtTabs、AtSearchBar 等少量组件），41 个业务组件均为原生封装。需要评估是否继续使用 taro-ui、迁移至其他库，还是全面原生封装。

## 当前 taro-ui 使用情况

| 组件 | 使用位置 |
|------|----------|
| `AtTabs` / `AtTabsPane` | pages/library/index（文库 Tab 切换） |
| `AtSearchBar` | pages/search/index（搜索框） |

使用量极少，迁移成本低。

## 候选方案对比

### 1. taro-ui（现状）

| 维度 | 评价 |
|------|------|
| 维护状态 | 基本停更，最后活跃 2023 年 |
| Taro 兼容性 | 3.5+ 需手动排除 prebundle |
| 组件数量 | 60+ |
| 主题定制 | 支持但不灵活 |
| 包体积 | 偏大，tree-shaking 不完善 |
| 风格 | 固定，难以深度定制 |

**结论**：维护停滞是最大风险，建议替换。

### 2. NutUI React Taro（@nutui/nutui-react-taro）

| 维度 | 评价 |
|------|------|
| 维护状态 | 京东团队持续更新，与 Taro 版本同步 |
| Taro 兼容性 | 专为 Taro 设计，兼容性好 |
| 组件数量 | 70+，覆盖常用场景 |
| 主题定制 | CSS Variables，定制能力强 |
| 包体积 | 按需引入，支持 tree-shaking |
| 风格 | 偏现代电商，可定制 |

**优势**：
- 与 Taro 生态深度绑定
- 文档完善，社区活跃
- 提供 Toast、Modal、ActionSheet 等成熟交互组件

**劣势**：
- 默认风格偏电商，与古诗文应用调性需适配
- 部分组件 API 设计与 taro-ui 不同，需调整

### 3. 全面原生封装

| 维度 | 评价 |
|------|------|
| 可控性 | 完全自主 |
| 包体积 | 最小 |
| 风格统一 | 完全可控 |
| 开发成本 | 高（基础组件重复造轮子） |
| 交互质量 | 依赖自身水平，易遗漏细节 |

**优势**：
- 风格完全统一，无额外依赖
- 适合有明确设计稿和设计团队的项目

**劣势**：
- Toast/Modal/ActionSheet/Picker 等复杂交互组件开发成本高
- 无障碍支持、动画细节容易缺失
- 维护成本随组件数量增长

### 4. Taro 跨端组件库（如 Varlet、Vant Weapp 适配）

不推荐。Varlet 主要面向 Vue，Vant Weapp 是原生微信组件库，与 Taro/React 技术栈不匹配。

## 推荐方案：分层策略

### 原则

- **基础交互组件**：使用 NutUI（成熟、省力）
- **业务展示组件**：保持原生封装（已形成体系）
- **复杂表单组件**：评估 NutUI（如 DatePicker、Picker）

### 具体分工

| 层级 | 组件类型 | 方案 | 示例 |
|------|----------|------|------|
| 基础反馈 | Toast、Modal、ActionSheet、Dialog | NutUI | `@nutui/nutui-react-taro` |
| 基础展示 | Tabs、SearchBar、Tag、Badge | NutUI | 替换现有 taro-ui 用法 |
| 布局 | Layout、Grid、Sticky | NutUI 或原生 | 视需求定 |
| 业务卡片 | PoemCard、PoetCard、SentenceCard | 原生保留 | 现有 41 个组件 |
| 复杂交互 | DatePicker、Picker、Cascader | NutUI | 避免重复造轮子 |
| 业务弹窗 | ScheduleModal、CollectionModal | 原生保留 | 含业务逻辑 |

### 迁移步骤

1. **安装 NutUI**：`npm install @nutui/nutui-react-taro`
2. **移除 taro-ui**：`npm uninstall taro-ui`
3. **替换直接使用**：将 `AtTabs` → `Tabs`，`AtSearchBar` → `SearchBar`
4. **补充基础组件**：用 NutUI 的 Toast/Modal 替代 Taro 原生 API 调用
5. **验证构建**：确保 webpack5 兼容，prebundle 无需额外排除
6. **样式适配**：配置 NutUI 主题变量，与项目配色对齐

### 需要调整的代码

```js
// Before (taro-ui)
import { AtTabs, AtTabsPane } from 'taro-ui'

// After (NutUI)
import { Tabs, TabPane } from '@nutui/nutui-react-taro'
```

```js
// Before (taro-ui)
import { AtSearchBar } from 'taro-ui'

// After (NutUI)
import { SearchBar } from '@nutui/nutui-react-taro'
```

## 风险与注意事项

| 风险 | 应对 |
|------|------|
| NutUI 风格与古诗文调性不符 | 通过 CSS Variables 定制主题色、字体、圆角 |
| NutUI 版本更新引入 breaking change | 锁定版本，定期评估升级 |
| 迁移过程影响现有功能 | 分阶段迁移，先替换 taro-ui 直接使用的组件 |
| 包体积增加 | 按需引入，仅引入实际使用的组件 |

## 结论

**推荐使用 NutUI 替换 taro-ui，同时保留现有 41 个原生业务组件。**

理由：
1. taro-ui 维护停滞，长期来看是技术债务
2. NutUI 与 Taro 生态绑定，兼容性有保障
3. 现有业务组件已形成完整体系，无需推翻
4. 基础交互组件用 NutUI 省时省力，业务组件原生封装保证风格统一
