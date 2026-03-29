# OKLISH

モダンなWeb開発向けのインスペクション／デバッグツールキット。Svelte + TypeScriptで実装され、ページ内にフローティングウィンドウとして組み込める開発検証ツールを目指しています。プラグイン拡張とセッション永続化を念頭に設計されています。

**プロジェクト概要**

OKLISHは、Chrome DevToolsのような操作感を目標としたモダンな開発者向け検証ツールです。Svelte 5を採用し、既存ページに非侵襲的に組み込み可能なフローティングUI、コンソール／要素ツリー／ネットワーク監視／アプリケーション（ストレージ等）パネルなどを備えます。ライブラリとして配布し、CDNやnpm経由での導入を想定しています。

**主要機能**

- 組み込みパネル（初期実装）: Elements（DOMツリー、スタイル編集）、Console（ログ表示・評価）、Network（リクエスト監視）、Application（Storage / ServiceWorker 情報） — 登録箇所: [src/App.svelte](src/App.svelte)
- プラグインアーキテクチャによる拡張性（プラグインの登録・管理が可能） — 実装の起点: [src/index.ts](src/index.ts), [src/plugins](src/plugins)
- フローティングウィンドウ（ドラッグ／リサイズ／ドッキング）と状態管理（セッション永続化）
- リクエスト／ログのインターセプト（fetch/xhr等の監視）
- sessionStorage による状態永続化（設定やウィンドウ配置を保持）

**使用方法（エンドユーザー向け）**

CDNから読み込む（例）:

```html
<script src="https://unpkg.com/oklish/dist/oklish.js"></script>
<script>
  OKLISH.init({ theme: 'dark' });
</script>
```

npmパッケージとして利用する場合（開発内で読み込む例）:

```js
import OKLISH from 'oklish';

OKLISH.init({
  theme: 'dark'
});

// 後で解除する場合:
// OKLISH.destroy();
```

利用可能な公開API（ソース参照）:

- `init(userConfig?: Partial<OKLISHConfig>)` — 初期化
- `destroy()` — 破棄、状態クリーンアップ
- `registerPlugin(plugin)` — ランタイムでプラグイン登録

（APIの実装は [src/index.ts](src/index.ts) を参照）

**動作環境**

- フロントエンド: Svelte 5 + TypeScript
- 開発ツール: Node.js と npm（Viteを開発用に、Rollupをライブラリビルドに使用）
- テスト: Vitest
- リント/フォーマット: Biome

**インストール・開発手順**

開発環境のセットアップと主要コマンド:

```bash
npm install

npm run dev

npm run build

npm run format
```

（スクリプト定義は [package.json](package.json) を参照）

**ファイル構成（主要）**

- [src/](src/) — ソースコードのルート
  - [src/index.ts](src/index.ts) — パブリックAPIとグローバル登録
  - [src/App.svelte](src/App.svelte) — アプリケーションのエントリ（パネル登録など）
  - [src/core/](src/core/) — 設定・イベント・マウント処理
  - [src/panels/](src/panels/) — 各種パネル実装（console, elements, network, application 等）
  - [src/plugins/](src/plugins/) — プラグイン関連
  - [src/window/](src/window/) — ウィンドウ管理（ドラッグ／リサイズ等）
- dev/ — 開発用サンプル・テストページ
- tests/ — テストセットアップ（Vitest）
- [SPECIFICATION.md](SPECIFICATION.md) — 仕様メモ・設計ノート
- [package.json](package.json) — スクリプトと依存

（完全なツリーはリポジトリルートを参照）

**制限事項・既知の問題**

- 現段階では開発中の実装が含まれており、すべての仕様（例: 全てのレイアウト可視化や高度なプラグインフック）は未完の可能性があります。
- 状態永続化は `sessionStorage` を利用するため、ブラウザ/セッションの性質により永続性に制約があります（クロスブラウザ同期や長期保存は保証されません）。
- 配布はライブラリ形式を想定しているため、ページ内での統合方法やCSSの競合に注意が必要です。

具体的な設計方針と未実装アイテムは [SPECIFICATION.md](SPECIFICATION.md) に記載されています。

**技術仕様（概略）**

- フレームワーク: Svelte 5
- 言語: TypeScript
- ビルド: Rollup（配布用）、Vite（開発用）
- テスト: Vitest
- Linter/Formatter: Biome
- アイコン: Lucide Svelte（仕様に記載）
- ストレージ: sessionStorage（セッション永続化）

**貢献・開発フロー**

PR歓迎。開発時は以下の流れが標準です。まずはIssueや仕様ファイルで提案してください。コーディングの際はテストとビルドが通ることを確認してください。

1. フォークしてブランチを作成
2. 変更を実装、テスト追加
3. `npm run test` と `npm run lint` を実行
4. PRを作成し簡単な説明を追加

**ライセンス**

このプロジェクトは [MIT](package.json) ライセンスです。

---

追加情報やドキュメントの要望があれば教えてください。READMEはリポジトリ状態に合わせて更に拡張できます。
