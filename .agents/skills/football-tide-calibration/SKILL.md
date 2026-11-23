---
name: football-tide-calibration
description: Quy trình hiệu chuẩn thuật toán dự báo đá banh bãi biển Vũng Tàu (Bãi Dứa vs Bãi Sau), ghi nhận lịch sử quan trắc thực địa dài hạn, quy tắc ngưỡng mực nước, và các bước cập nhật code/CSP/test an toàn.
---

# Hiệu Chuẩn Thuật Toán Dự Báo Đá Banh Bãi Biển (Vũng Tàu)

Tài liệu hướng dẫn chuẩn dành cho Agent và kỹ sư phát triển khi tiếp nhận dữ liệu thực địa, tinh chỉnh công thức dự báo đá banh, và ghi nhận lịch sử quan sát lâu dài cho ứng dụng Thủy Triều Vũng Tàu.

---

## 1. Đặc Thù Địa Hình & Nguyên Lý Thực Địa

Khác với các hoạt động như bắt ghẹ hay tắm biển, đá bóng bãi biển cần **khung giờ có ánh sáng mặt trời** (17:00 – 18:00) và **bãi cát khô đủ phẳng, rộng, không ngập nước**.

* **Bãi Dứa (Bãi chính ưa thích):**
  - Địa hình: Dốc hơn, hai đầu có ghềnh đá ngầm. Dải cát hẹp nên rất nhạy cảm với mực nước.
  - Ngưỡng lý tưởng: Nước $\le 2.20\text{m}$ (bãi cát rộng mênh mông, đá rất đẹp $\ge 90\%$).
  - Ngưỡng đá được: Nước $\le 2.40\text{m} - 2.50\text{m}$.
  - Ngưỡng nguy hiểm/chìm bãi: Nước $\ge 2.60\text{m}$ bãi chỉ còn vài mét; nước $\ge 2.70\text{m}$ ngập sát mép kè đá, **hoàn toàn không thể đá bóng (0%)**.
* **Bãi Sau (Bãi phụ dự phòng):**
  - Địa hình: Cực kỳ thoai thoải, bãi cát phẳng và rộng lớn.
  - Khi triều rút hoặc khi Bãi Dứa bị ngập chìm, Bãi Sau vẫn có thể đá được ở mực nước cao hơn (lên tới $2.8\text{m} - 3.2\text{m}$).

---

## 2. Quy Tắc Định Tuyến Bãi (Beach Routing Rule)

Quy tắc chuyển đổi địa điểm nằm trong hàm `calendarForecast` (`tide-app/public/index.html`):

$$\text{useDua} = (\text{score} \ge 15)$$

* **Điểm Bãi Dứa $\ge 15\%$:** Ưu tiên hiển thị **Bãi Dứa** (giữ nguyên điểm số Bãi Dứa đã tính).
* **Điểm Bãi Dứa $< 15\%$:** Tự động chuyển sang đề xuất **Bãi Sau** và tính điểm theo hàm `scoreSauFootball(day, score)`.

---

## 3. Bộ Quy Tắc Công Thức Mực Nước (`assessFootball`)

Khung giờ tính toán chuẩn: **17:00 – 18:00** hằng ngày với 3 mốc: $H_{17}$ (17:00), $H_{17.5}$ (17:30), $H_{18}$ (18:00).

### A. Triều Đang Dâng ($H_{18} > H_{17}$) – `scoreRisingFootball`
* **Phạt 0% (Không đá được):**
  - $H_{18} \ge 2.80\text{m}$ hoặc ($H_{18} \ge 2.70\text{m}$ và đầu trận đã ngập: $H_{17} \ge 2.40\text{m}$ hoặc $H_{17.5} > 2.55\text{m}$).
  - *Ví dụ mẫu:* Ngày 22/06/2026 ($H_{17}=2.6\text{m}, H_{17.5}=2.65\text{m}, H_{18}=2.7\text{m}$) $\rightarrow$ 0%.
* **Đá vớt nửa đầu trận (20%):**
  - $H_{18} \ge 2.60\text{m}$ nhưng đầu trận nước còn thấp ($H_{17} \le 2.35\text{m}, H_{17.5} \le 2.50\text{m}$). Người chơi đá được 30–40 phút đầu trước khi nước dâng ngập bãi.
  - *Ví dụ mẫu:* Ngày 08/07/2026 ($H_{17}=2.3\text{m}, H_{18}=2.6\text{m}$) $\rightarrow$ 20%.
  - *Ví dụ mẫu:* Ngày 19/11/2026 ($H_{17}=2.3\text{m}, H_{17.5}=2.5\text{m}, H_{18}=2.7\text{m}$) $\rightarrow$ 20%.

### B. Triều Đang Rút ($H_{18} \le H_{17}$) – `scoreFallingFootball`
* **Phạt 0% (Không đá được):**
  - Khi nước rút, $H_{18}$ là mức nước thấp nhất trong trận. Nếu đến 18:00 mà $H_{18} \ge 2.60\text{m}$ hoặc $H_{17.5} \ge 2.75\text{m}$ hoặc ($H_{17} \ge 3.00\text{m}$ và $H_{17.5} \ge 2.70\text{m}$) $\rightarrow$ cả trận đều ngập chìm dưới nước $\rightarrow$ **0% Bãi Dứa**, chuyển sang Bãi Sau!
  - *Ví dụ mẫu:* Ngày 23/11/2026 ($H_{17}=3.0\text{m}, H_{17.5}=2.85\text{m}, H_{18}=2.7\text{m}$) $\rightarrow$ Bãi Dứa 0%, Bãi Sau 73%.
* **Đá vớt cuối trận (20%):**
  - Đầu trận cao ($H_{17} \ge 2.75\text{m}, H_{17.5} \ge 2.50\text{m}$) nhưng cuối giờ **phải rút cạn** ($H_{18} \le 2.45\text{m}$) $\rightarrow$ đá vớt được 20–30 phút cuối trận.
  - *Ví dụ mẫu:* Ngày 03/07/2026 ($H_{17}=2.8\text{m}, H_{17.5}=2.55\text{m}, H_{18}=2.30\text{m}$) $\rightarrow$ 20%.

---

## 4. Cơ Chế Lưu Trữ Lịch Sử Thực Địa Lâu Dài (Permanent Ground-Truth Log)

Để phục vụ bài toán huấn luyện lại mô hình sau 1 năm hoặc nhiều năm, toàn bộ quan trắc thực tế từ người dùng **bắt buộc** phải được lưu trữ tại:
📂 [`docs/lich_su_thuc_te_da_banh.json`](file:///c:/code/c2026-02-08-VungTau/docs/lich_su_thuc_te_da_banh.json)

### Cấu trúc bản ghi JSON chuẩn:
```json
{
  "date": "YYYY-MM-DD",
  "activity": "football",
  "beach": "Bãi Dứa",
  "score": 20,
  "feedback_timestamp": "ISO-8601-string",
  "tide_data_reference": {
    "16:00": 2.1,
    "17:00": 2.3,
    "18:00": 2.7,
    "19:00": 3.0
  },
  "observations": [
    {
      "time": "17:30",
      "tide_height_interpolated_m": 2.5,
      "playability": "marginal",
      "description": "Mô tả thực tế người chơi ghi nhận..."
    }
  ]
}
```

Và đồng thời đăng ký ngày đó vào mảng khóa cứng trong code [`tide-app/public/index.html`](file:///c:/code/c2026-02-08-VungTau/tide-app/public/index.html):
```javascript
const FOOTBALL_OBSERVED_SCORES = {
  "2026-07-03": 20,
  "2026-11-03": 20,
  "2026-11-19": 20,
  "2026-11-23": 0,
  ...
};
```

---

## 5. Quy Trình 5 Bước Khi Người Dùng Báo Cáo Thực Địa Mới

Khi người dùng gửi phản hồi (ví dụ: *"hôm qua bãi dứa ngập không đá được"* hoặc *"thứ 5 vừa rồi bãi dứa đá ngon"*):

1. **Bước 1: Tra cứu dữ liệu thủy triều thực tế**
   Chạy script node kiểm tra $H_{17}, H_{17.5}, H_{18}$, triều dâng hay rút và điểm model hiện tại tính ra là bao nhiêu.
2. **Bước 2: Ghi nhận ngay vào file lịch sử**
   Thêm record vào [`docs/lich_su_thuc_te_da_banh.json`](file:///c:/code/c2026-02-08-VungTau/docs/lich_su_thuc_te_da_banh.json) và cập nhật `FOOTBALL_OBSERVED_SCORES` trong `tide-app/public/index.html`.
3. **Bước 3: Hiệu chỉnh công thức tổng quát (Generalization)**
   - Cập nhật đồng thời ở cả hai file:
     - [`tide-app/public/model.js`](file:///c:/code/c2026-02-08-VungTau/tide-app/public/model.js)
     - [`tide-app/public/index.html`](file:///c:/code/c2026-02-08-VungTau/tide-app/public/index.html)
4. **Bước 4: Chạy kiểm chứng chống hồi quy (Regression Test)**
   - Chạy script kiểm tra toàn bộ lịch sử:
     ```powershell
     node .agents/skills/football-tide-calibration/scripts/verify_calibration.mjs
     ```
   - Chạy unit tests:
     ```powershell
     node --test tide-app/tests/sau-football.test.mjs
     ```
5. **Bước 5: Cập nhật mã băm CSP & Triển khai**
   - Lấy sha256 Content-Security-Policy mới của script inline (chuẩn LF `\n`):
     ```powershell
     node -e "const fs=require('fs'), crypto=require('crypto'); const html=fs.readFileSync('./tide-app/public/index.html','utf8'); const sc=html.match(/<script>([\s\S]*?)<\/script>/)[1]; console.log(crypto.createHash('sha256').update(sc.replace(/\r\n/g,'\n'),'utf8').digest('base64'));"
     ```
   - Cập nhật hash mới vào [`tide-app/vercel.json`](file:///c:/code/c2026-02-08-VungTau/tide-app/vercel.json) và [`vercel.json`](file:///c:/code/c2026-02-08-VungTau/vercel.json).
   - Commit và push lên GitHub (`origin/main`) để Vercel tự động deploy.

---

## 6. Quy Tắc An Toàn Bắt Buộc (Strict Constraints)

1. **Tuyệt đối không xóa bất kỳ file nào trên máy** khi chưa có sự đồng ý rõ ràng bằng dòng chữ `"được phép"`.
2. **Không tự ý chạy lệnh build check nặng** (`npm run build`, `next build`,...) sau khi sửa code trừ khi có lỗi hoặc người dùng yêu cầu.
3. **Luôn giữ đồng bộ giữa `model.js` và `public/index.html`** để client và tests luôn có chung một nguồn chân lý toán học.
