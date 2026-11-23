# Hướng Dẫn Chung Dành Cho AI Agents (Vũng Tàu Tide App)

Tài liệu cấu hình chuẩn hóa dành cho các Agent thuộc mọi nền tảng (Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf, Roo Code,...).

---

## 1. Hiệu Chuẩn Thủy Triều Đá Banh & Lịch Sử Thực Địa

- Khi nhận phản hồi thực tế đá banh (Bãi Dứa vs Bãi Sau), cần hiệu chỉnh công thức hoặc tra cứu lịch sử quan trắc thực địa, đọc [football-tide-calibration](.agents/skills/football-tide-calibration/SKILL.md).
- File lưu trữ lịch sử quan trắc thực địa dài hạn: [`docs/lich_su_thuc_te_da_banh.json`](docs/lich_su_thuc_te_da_banh.json).
- Script tự động chạy kiểm chứng 100% mốc quan sát:
  ```powershell
  node .agents/skills/football-tide-calibration/scripts/verify_calibration.mjs
  ```

---

## 2. Lịch Sử Dự Án & Phục Hồi Dữ Liệu

- Khi cần brain, hội thoại cũ hoặc không tìm thấy dữ liệu, đọc [project-data-recovery](.agents/skills/project-data-recovery/SKILL.md).
- Script tra cứu: `python .agents/skills/project-data-recovery/scripts/find_history.py`.

---

## 3. Quy Tắc Cốt Lõi Khi Thao Tác Trong Dự Án

1. **Bảo toàn dữ liệu:** Không được xóa bất kỳ file hoặc nội dung nào trong máy nếu chưa có sự đồng ý bằng văn bản rõ ràng (`"được phép"`).
2. **Không chạy build check nặng:** Không tự ý chạy `npm run build`, `next build` sau khi sửa code trừ khi gặp lỗi hoặc có yêu cầu.
3. **Đồng bộ Content-Security-Policy (CSP):** Khi sửa inline script trong `tide-app/public/index.html`, luôn tính sha256 (LF `\n`) và cập nhật đồng thời ở `tide-app/vercel.json` và `vercel.json`.
4. **Kiểm tra unit tests:**
  ```powershell
  node --test tide-app/tests/calendar-navigation.test.mjs tide-app/tests/motion.test.mjs tide-app/tests/sau-football.test.mjs
  ```
