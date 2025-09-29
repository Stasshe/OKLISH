erudaのような、web
検証ツール.

現代のよりモダンなツール。
Reactで。

ウィンドウは、画面上どこへでも動かせるフロート。（react-dndを使う）

npmライブラリで、cdn読み込みさせようと思ってる。

indexeddbに、oklishで既存のセッション情報を含めておいたり。
あとは、ツールの拡張性も意識したい。


OKLISH - Modern Web Development Tool 仕様書

## 1. 概要

### 1.1 プロダクト概要

OKLISHは、Chrome DevToolsライクな機能を提供するモダンなWeb開発検証ツールです。React製のフローティングウィンドウとして動作し、既存のWebページに非侵入的に統合できます。

### 1.2 主要特徴

- **モダン設計**: React + TypeScript構成
- **CDN配信**: npm経由での簡単導入
- **拡張可能**: プラグインアーキテクチャ
- **永続化**: IndexedDBによるセッション管理(!important!)

## 2. アーキテクチャ

### 2.1 技術スタック

```
Frontend: React 18 + TypeScript
UI Framework: Tailwind CSS / Styled Components
State Management: Zustand / Redux Toolkit
Drag & Drop: interact.js
Storage: IndexedDB (idb-keyval)
Build: Vite / Webpack
Testing: Jest + React Testing Library
```

### 2.2 配布方式

```javascript
// CDN経由での導入
<script src="URL"></script>
<script>
  OKLISH.init({
    theme: 'dark',
  });
</script>
```

## 3. 機能仕様

### 3.1 コアパネル

#### 3.1.1 Elements（要素検証）

```typescript
interface ElementsPanel {
  // DOM Tree表示
  domTreeView: {
    expandable: boolean;
    searchable: boolean;
    highlightOnHover: boolean;
  };
  
  // スタイル編集
  stylesEditor: {
    computedStyles: boolean;
    liveEdit: boolean;
    cssRuleToggle: boolean;
  };
  
  // レイアウト情報
  layoutInfo: {
    boxModel: boolean;
    flexboxVisualizer: boolean;
    gridVisualizer: boolean;
  };
}
```

#### 3.1.2 Console（コンソール）

```typescript
interface ConsolePanel {
  // ログレベル
  logLevels: ['log', 'warn', 'error', 'info', 'debug'];
  
  // フィルタリング
  filters: {
    byLevel: boolean;
    bySource: boolean;
    byTimestamp: boolean;
  };
  
  // コマンド実行
  commandExecution: {
    jsEvaluation: boolean;
    autoComplete: boolean;
    history: boolean;
  };
}
```

#### 3.1.3 Network（ネットワーク）

```typescript
interface NetworkPanel {
  // リクエスト監視
  requestMonitoring: {
    xhr: boolean;
    fetch: boolean;
    websocket: boolean;
  };
  
  // パフォーマンス分析
  performanceMetrics: {
    timing: boolean;
    waterfall: boolean;
    resourceSize: boolean;
  };
  
  // フィルタリング
  requestFilters: {
    byType: string[];
    byStatus: number[];
    byDomain: string[];
  };
}
```

#### 3.1.4 Application（アプリケーション）

```typescript
interface ApplicationPanel {
  // ストレージ管理
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    cookies: boolean;
  };
  
  // Service Worker
  serviceWorker: {
    registration: boolean;
    cacheInspection: boolean;
    pushNotification: boolean;
  };
}
```

### 3.2 フローティングウィンドウ仕様

```typescript
interface FloatingWindow {
  // 基本プロパティ
  dimensions: {
    minWidth: number;    // 400px
    minHeight: number;   // 300px
    maxWidth: number;    // 90vw
    maxHeight: number;   // 90vh
    defaultWidth: number; // 800px
    defaultHeight: number; // 600px
  };
  
  // 位置制御
  positioning: {
    draggable: boolean;
    resizable: boolean;
    snapToEdges: boolean;
    constrainToViewport: boolean;
  };
  
  // 状態管理
  windowState: {
    minimized: boolean;
    maximized: boolean;
    docked: boolean;
    opacity: number;
  };
}
```

### 3.3 セッション管理

```typescript
interface SessionManager {
  // IndexedDB構造
  database: {
    name: 'OKLISH_Sessions';
    version: 1;
    stores: {
      sessions: {
        keyPath: 'id';
        indexes: ['timestamp', 'url'];
      };
      preferences: {
        keyPath: 'key';
      };
      plugins: {
        keyPath: 'name';
      };
    };
  };
  
  // セッションデータ
  sessionData: {
    windowPosition: { x: number; y: number };
    windowSize: { width: number; height: number };
    activePanel: string;
    panelStates: Record<string, any>;
    breakpoints: any[];
    watchExpressions: string[];
  };
}
```

## 4. 拡張システム

### 4.1 プラグインアーキテクチャ

```typescript
interface PluginSystem {
  // プラグインインターフェース
  pluginInterface: {
    register(plugin: Plugin): void;
    unregister(pluginName: string): void;
    getPlugin(name: string): Plugin | null;
    listPlugins(): Plugin[];
  };
  
  // プラグイン定義
  pluginDefinition: {
    name: string;
    version: string;
    dependencies: string[];
    hooks: PluginHooks;
    ui: React.ComponentType;
  };
}

interface Plugin {
  name: string;
  version: string;
  init(api: PluginAPI): void;
  destroy(): void;
  component: React.ComponentType;
}

interface PluginAPI {
  // DOM操作
  dom: {
    querySelector: (selector: string) => Element | null;
    addEventListener: (event: string, handler: Function) => void;
  };
  
  // UI拡張
  ui: {
    addPanel: (panel: PanelDefinition) => void;
    addMenuItem: (item: MenuItem) => void;
    showNotification: (message: string, type: 'info' | 'warning' | 'error') => void;
  };
  
  // データアクセス
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}
```

### 4.2 サンプルプラグイン

```typescript
// Performance Monitor Plugin
const PerformancePlugin: Plugin = {
  name: 'performance-monitor',
  version: '1.0.0',
  
  init(api: PluginAPI) {
    api.ui.addPanel({
      name: 'Performance',
      icon: '⚡',
      component: PerformanceMonitorComponent
    });
  },
  
  destroy() {
    // クリーンアップ処理
  },
  
  component: PerformanceMonitorComponent
};
```

## 5. 開発・配布

### 5.1 ディレクトリ構成

```
oklish/
├── src/
│   ├── core/           # コア機能
│   ├── panels/         # 各パネル実装
│   ├── plugins/        # 標準プラグイン
│   ├── utils/          # ユーティリティ
│   └── types/          # TypeScript型定義
├── dist/               # ビルド成果物
├── docs/               # ドキュメント
└── examples/           # 使用例
```

## 6. パフォーマンス要件

### 6.1 パフォーマンス目標

- 初期化時間: < 500ms
- メモリ使用量: < 10MB
- DOM操作レスポンス: < 16ms
- ネットワーク監視オーバーヘッド: < 5%

### 7.2 プライバシー保護

- ローカルストレージのみ使用
- 外部通信なし（オプション）
- データの暗号化（機密情報）
