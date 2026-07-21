NO KIDDING BAND MANAGER V9.1.1 PUBLIC SHARED
======================================

NO KIDDINGメンバー全員が、AndroidとiPhoneから同じデータを利用する共有版です。

構成
- GitHub：プログラムと画像を保管
- Cloudflare Pages：アプリを公開
- Cloudflare Pages Functions：共有API
- Cloudflare D1：予定、回答、商品、在庫、販売履歴を保存

共有される内容
- 確定スケジュール
- スタジオ候補日とメンバー別の○△×回答
- 物販商品、在庫、販売履歴、売上

端末内だけに保存される内容
- 最後に選択した月
- 最後に選択したメンバー名
- 通信できないときに表示する最終同期データ

重要
- GitHubへアップロードするだけでは共有機能は動きません。
- CLOUDFLARE_SETUP.htmlをブラウザで開き、D1とDB Bindingを設定してください。
- TXT版が文字化けする端末では、必ずHTML版を使用してください。
- ログインはありません。URLを知る人はデータの閲覧と編集ができます。
