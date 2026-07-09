# 商店後台 Phase 1 — 設定教學

這一步做完，你們就有一個可以自己新增/編輯/刪除商品的後台，加上一個顧客可以瀏覽（還不能購買）的商店頁面。

---

## Step 1：建立 Supabase 專案

1. 到 https://supabase.com 註冊帳號（免費）
2. 建立一個新專案（New Project），專案名稱隨意，資料庫密碼記得存起來
3. 等待專案建立完成（約 1-2 分鐘）

## Step 2：建立資料表

1. 進入專案後，左側選單點 **SQL Editor**
2. 開一個新的查詢（New query）
3. 把 `schema.sql` 這個檔案的內容整段貼上，按執行（Run）
4. 沒有錯誤訊息就代表資料表建立成功

## Step 3：取得連線金鑰

1. 左側選單點 **Settings → API**
2. 找到 **Project URL** 和 **anon public** 這兩個值
3. 打開 `config.js`，把這兩個值分別貼到：
   ```js
   const SUPABASE_URL = "貼上你的 Project URL";
   const SUPABASE_ANON_KEY = "貼上你的 anon public key";
   ```

## Step 4：建立你們自己的登入帳號

後台不開放自由註冊，帳號要由你們自己在 Supabase 後台建立：

1. 左側選單點 **Authentication → Users**
2. 點 **Add user → Create new user**
3. 輸入你們要用來登入後台的 Email 和密碼（建議兩人各建一組）
4. 完成後就可以用這組帳密登入 `admin.html`

## Step 5：把檔案放到網站裡

把這幾個檔案放進你們現有網站的資料夾（跟 index.html 同一層）：
- `schema.sql`（只是備份用，不需要放到網站上，僅上傳到 Supabase 執行過即可）
- `config.js`
- `admin.html`
- `shop.html`
- `common.js`（如果原本網站已經有這個檔案就不用重複放）

上傳到 GitHub Pages / Cloudflare Pages 之後：
- `你的網址/admin.html` → 你們自己用的後台，記得**不要把這個連結公開分享**
- `你的網址/shop.html` → 顧客看的商店頁面（目前只能瀏覽，還不能購買）

---

## 這階段能做到什麼

✅ 後台新增/編輯/刪除商品
✅ 設定價格、庫存、分類、圖片
✅ 庫存歸零時系統自動下架（前台自動隱藏）
✅ 商店頁面會即時顯示所有「上架中」的商品

## 這階段還不能做什麼（之後的 Phase）

❌ 加入購物車、結帳（Phase 2）
❌ 綠界金流/超商取貨付款串接（Phase 3）
❌ 會員登入、訂單查詢（Phase 4）

---

## 安全提醒

- `admin.html` 目前沒有做「隱藏網址」，只要知道網址就能看到登入畫面（但沒有帳密登入不了後台，商品資料也看不到）。之後如果在意，可以請我幫忙加上更嚴謹的存取限制。
- **不要**把 Supabase 專案的 **service_role key** 放進任何前端檔案，只用 **anon public key** 就好（`config.js` 裡已經是正確的那把）。
