# Tổng quan công nghệ & logic hệ thống: Cardano Wallet Reputation Checker

---

## 1. Tech Stack (Công nghệ sử dụng)

### Frontend
- **ReactJS**: Xây dựng giao diện người dùng động, hiện đại.
- **Tailwind CSS**: Framework CSS tiện dụng, giúp phát triển UI nhanh chóng.
- **MeshJS**: Tích hợp ví Cardano (Nami, Eternl, Lace, Typhon, v.v.).
- **Axios**: Gửi request HTTP tới backend.
- **Material UI, Lucide React**: Bộ icon, component UI.
- **React Router**: Điều hướng client-side.

### Backend
- **Node.js**: Nền tảng chạy JavaScript phía server.
- **Express.js**: Framework xây dựng REST API.
- **Axios**: Gọi API Blockfrost, Gemini.
- **dotenv**: Quản lý biến môi trường.
- **fs**: Đọc/ghi file JSON lưu report.
- **Blockfrost API**: Lấy dữ liệu blockchain Cardano.
- **Google Gemini (tùy chọn)**: Phân tích AI cho ví.

### Lưu trữ dữ liệu
- **walletReports.json**: Lưu các báo cáo cộng đồng (scam/legit) dạng JSON.

### Dev Tools
- **Nodemon**: Tự động reload backend khi code thay đổi.
- **Concurrently**: Chạy đồng thời frontend & backend khi dev.

---

## 2. Kiến trúc tổng thể & Flow dữ liệu

```descii
+-------------------+         +-------------------+         +-------------------+
|   User Browser    +-------->+   Frontend (React)+-------->+   Backend (Node)  |
+-------------------+         +-------------------+         +-------------------+
        |                            |                                 |
        |  Connect Wallet            |                                 |
        |--------------------------->|                                 |
        |                            |                                 |
        |  Check/Report Wallet       |                                 |
        |--------------------------->|                                 |
        |                            |  POST /api/check-reputation     |
        |                            +-------------------------------> |
        |                            |  POST /api/report-wallet        |
        |                            +-------------------------------> |
        |                            |                                 |
        |                            |   Blockfrost API, Gemini, JSON  |
        |                            |<-------------------------------+
        |                            |                                 |
        |  Hiển thị kết quả          |                                 |
        |<--------------------------|                                 |
```

---

## 3. Logic chấm điểm (Scoring)

### Thành phần & điểm tối đa
| Thành phần                | Điểm tối đa |
|--------------------------|------------|
| Age Score                | +25        |
| Transaction Score        | +25        |
| Token Diversity Score    | +15        |
| NFT Activity Score       | +10        |
| Staking Score            | +10        |
| Reward Score             | +5         |
| Activity Score           | +10        |
| **Tổng điểm dương**      | **100**    |
| Spam Score               | -20        |
| Age Score (ví mới)       | -20        |
| Activity Score (spam)    | -5         |
| **Tổng điểm trừ**        | **-25**    |

### Công thức tổng điểm
```
Tổng điểm = Age Score + Transaction Score + Token Diversity Score + NFT Activity Score
          + Staking Score + Reward Score + Activity Score + Spam Score
Clamp từ 0 đến 100
```

### Ý nghĩa từng thành phần
- **Age Score**: Tuổi ví càng lâu càng uy tín.
- **Transaction Score**: Số lượng giao dịch càng nhiều càng tốt.
- **Token Diversity Score**: Đa dạng token thể hiện hoạt động thực.
- **NFT Activity Score**: Hoạt động NFT sôi động là điểm cộng.
- **Staking Score**: Đang staking hoặc từng staking là điểm cộng.
- **Reward Score**: Nhận nhiều thưởng staking là điểm cộng.
- **Activity Score**: Giao dịch đều đặn là tốt, spam bị trừ điểm.
- **Spam Score**: Nhiều asset bất thường bị trừ điểm.

---

## 4. Cơ chế voting (báo cáo/verify)

### Điều kiện
- Người dùng **phải kết nối ví** Cardano.
- Ví phải đạt **điểm danh tiếng tối thiểu** (có thể cấu hình, ví dụ ≥ 40).
- Chỉ khi đủ điều kiện, nút "Report / Verify Wallet" mới bật.

### Quy trình
1. Kết nối ví → kiểm tra điểm danh tiếng.
2. Người dùng tra cứu ví bất kỳ.
3. Nếu đủ điều kiện, có thể báo cáo (scam) hoặc xác thực (legit).
4. Gửi báo cáo gồm: walletAddress, reportType, reportedBy, description, timestamp.
5. Backend lưu vào `walletReports.json`.
6. Frontend tự động cập nhật số lượng báo cáo cộng đồng.

### Chống spam
- Một ví chỉ được vote 1 lần cho mỗi loại trên một ví khác (có thể kiểm tra trùng `reportedBy` và `walletAddress`).
- Chỉ ví đủ điểm mới được vote.

---

## 5. Xử lý các tình huống & lỗi

### Kết nối ví không thành công
- Hiển thị thông báo lỗi, hướng dẫn cài đặt/enable extension.

### Không lấy được dữ liệu từ Blockfrost
- Thông báo "Không tìm thấy ví trên blockchain" hoặc "Lỗi kết nối Blockfrost".

### Gửi báo cáo thiếu trường
- Backend trả về 400, frontend hiển thị "All fields are required".

### Spam voting
- Kiểm tra trùng lặp `reportedBy` + `walletAddress` trước khi lưu.

### Lỗi lưu file JSON
- Backend log lỗi, trả về 500, frontend hiển thị "Failed to submit report".

---

## 6. Mở rộng & bảo mật
- Có thể chuyển sang lưu DB (MongoDB, PostgreSQL) khi cần mở rộng.
- Có thể xác thực bằng chữ ký giao dịch (sign message) để chống giả mạo.
- Có thể thêm xác thực captcha khi gửi report.
- Có thể thêm dashboard quản trị để duyệt report.

---

## 7. Tổng kết luồng hoạt động
1. Người dùng truy cập app, kết nối ví.
2. App lấy địa chỉ ví, gọi backend tính điểm danh tiếng.
3. Hiển thị điểm, chi tiết, báo cáo cộng đồng.
4. Người dùng có thể tra cứu ví khác, gửi báo cáo nếu đủ điều kiện.
5. Báo cáo được lưu, cập nhật realtime.

---

**Mọi thắc mắc, liên hệ @Calvith (Telegram) hoặc dqv12908@gmail.com** 