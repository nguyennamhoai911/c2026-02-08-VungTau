# Hướng Dẫn Dành Cho Claude Code (Vũng Tàu Tide App)

Dự án tra cứu thủy triều Vũng Tàu (2026–2027) phục vụ người dân địa phương và các hoạt động thể thao/bắt ghẹ/tắm biển.

---

## 1. Các Kỹ Năng / Skills Cốt Lõi Của Dự Án

Dự án có các skills chuẩn được lưu trữ trong `.agents/skills/`:

1. **Hiệu Chuẩn Dự Báo Đá Banh Bãi Biển (Bãi Dứa vs Bãi Sau):**
   - Đọc hướng dẫn đầy đủ tại: [`.agents/skills/football-tide-calibration/SKILL.md`](.agents/skills/football-tide-calibration/SKILL.md)
   - Lưu trữ lịch sử quan trắc thực địa: [`docs/lich_su_thuc_te_da_banh.json`](docs/lich_su_thuc_te_da_banh.json)
   - Script tự động kiểm chứng 100% mốc quan trắc:
     ```powershell
     node .agents/skills/football-tide-calibration/scripts/verify_calibration.mjs
     ```

2. **Truy Tìm Dữ Liệu & Khôi Phục Lịch Sử Dự Án:**
   - Đọc hướng dẫn tại: [`.agents/skills/project-data-recovery/SKILL.md`](.agents/skills/project-data-recovery/SKILL.md)
   - Script tra cứu: `python .agents/skills/project-data-recovery/scripts/find_history.py`

---

## 2. Quy Tắc Dự Báo Đá Banh (Bãi Dứa & Bãi Sau)

* **Nguyên lý thực địa:**
  - **Bãi Dứa:** Bãi đá dốc, dải cát hẹp. Nước $\le 2.2\text{m}$ rất đẹp; $\le 2.4\text{m}-2.5\text{m}$ đá tốt; $\ge 2.6\text{m}$ bãi hẹp; $\ge 2.7\text{m}$ chìm bãi cát (0%).
  - **Bãi Sau:** Thoai thoải, cát rộng, đá được khi triều rút hoặc khi Bãi Dứa bị ngập (lên đến $2.8\text{m}-3.2\text{m}$).
* **Định tuyến bãi (`calendarForecast`):**
  - Điểm Bãi Dứa $\ge 15\% \rightarrow$ Ưu tiên chọn **Bãi Dứa**.
  - Điểm Bãi Dứa $< 15\% \rightarrow$ Tự động chuyển sang **Bãi Sau** (`scoreSauFootball`).
* **Công thức triều dâng / triều rút (17h - 17h30 - 18h):**
  - Triều dâng: $H_{18} \ge 2.8\text{m}$ hoặc ($H_{18} \ge 2.7\text{m} \& H_{17} \ge 2.4\text{m}$) $\rightarrow$ 0%. Đầu trận thấp ($H_{17} \le 2.35\text{m}, H_{17.5} \le 2.50\text{m}$) $\rightarrow$ 20% (đá vớt nửa đầu trận).
  - Triều rút: $H_{18} \ge 2.60\text{m}$ hoặc $H_{17.5} \ge 2.75\text{m}$ $\rightarrow$ 0% (ngập cả trận). Cuối trận rút cạn $\le 2.45\text{m}$ $\rightarrow$ 20%.

---

## 3. Quy Tắc Kỹ Thuật Bắt Buộc (Critical Rules)

1. **KHÔNG xóa bất kỳ file/nội dung nào trong máy** trừ khi được người dùng đồng ý bằng lệnh rõ ràng `"được phép"`.
2. **KHÔNG tự ý chạy lệnh build check nặng** (`npm run build`, `next build`,...) sau khi sửa code vì tốn thời gian.
3. **Đồng bộ mã băm Content-Security-Policy (CSP):** Mỗi khi sửa đổi inline `<script>` trong `tide-app/public/index.html`, bắt buộc phải tính lại sha256 hash (chuẩn LF `\n`) và cập nhật đồng thời vào cả `tide-app/vercel.json` và `vercel.json`:
   ```powershell
   node -e "const fs=require('fs'), crypto=require('crypto'); const html=fs.readFileSync('./tide-app/public/index.html','utf8'); const sc=html.match(/<script>([\s\S]*?)<\/script>/)[1]; console.log(crypto.createHash('sha256').update(sc.replace(/\r\n/g,'\n'),'utf8').digest('base64'));"
   ```
4. **Luôn đồng bộ logic** giữa `tide-app/public/model.js` và `tide-app/public/index.html`.
5. **Chạy tests kiểm chứng sau khi sửa code:**
   ```powershell
   node --test tide-app/tests/calendar-navigation.test.mjs tide-app/tests/motion.test.mjs tide-app/tests/sau-football.test.mjs
   node .agents/skills/football-tide-calibration/scripts/verify_calibration.mjs
   ```
