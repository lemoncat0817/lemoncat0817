# 外部排程觸發器

GitHub 內建 `schedule` 會被延遲或跳過，這個 Cloudflare Worker 每 10 分鐘呼叫一次 `workflow_dispatch` 當主要觸發，workflow 內的 `schedule` 只當備援。

建置結果是冪等的，同一時段重複觸發不會產生多餘 commit。

## 部署

1. GitHub → Settings → Developer settings → Fine-grained tokens：只選此 repo，Repository permissions 的 Actions 設 Read and write，到期日設最長並記在行事曆。
2. 在此資料夾執行：
   ```
   npx wrangler deploy
   npx wrangler secret put GITHUB_PAT
   ```
3. 驗證：`gh run list --workflow=update.yml --event=workflow_dispatch` 應每 10 分鐘出現一筆。

PAT 過期後觸發會靜默失效（只剩備援排程），到期前記得更換。
