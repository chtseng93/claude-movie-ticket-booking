# Product Requirements Document

核心實體：

• `Movie`（電影）
• `Theater`（影廳）
• `Seat`（座位）
• `Showtime`（場次）
• `Booking`（訂單）
• `BookingSeat`（訂單座位明細）

功能範圍：

1. 使用者可瀏覽電影與電影場次
2. 使用者可查看指定場次的座位狀態
3. 使用者可選擇一個或多個尚未售出的座位
4. 同一場次的同一座位不可被重複購買
5. 建立訂單時由伺服器計算總金額（不接受客戶端傳入）
6. 購票成功後座位即標記為已售出
7. 使用者可用訂單編號查詢訂單資訊(有假的QRCODE)
8. 初始電影、影廳、座位與場次資料寫在 `data.sql` 中 (使用)
9.電影名稱與圖片使用movieinfo_neon.html裡的資訊

UI/UX 設計依據

系統畫面設計需參考以下檔案：

首頁與電影列表頁面參考 movieinfo_neon.html。
日期選擇頁面參考 date_neon.html。
座位選擇與訂購流程參考 checkout_neon.html。
購買完成頁面參考 ticket_neon.html。
電影名稱與電影圖片需使用 movieinfo_neon.html 中提供的資訊。
開發限制
Design 資料夾底下的檔案不可修改。
