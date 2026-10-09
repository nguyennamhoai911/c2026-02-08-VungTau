# Kết quả kiểm thử

- Node test: 4/4 pass. 365 ngày không trùng, ngày hợp lệ, 24 giá trị/ ngày; điểm đá banh hữu hạn trong 0–100, các nhánh biên nước lên/rút; giá trị thiếu không biến thành 0; output chỉ gồm 5 file public, không có ghi chú/lịch sử cá nhân/API.
- Edge thực tế: chọn ngày, mở bảng đủ 24 dòng, nút trước/sau vô hiệu ở 01/01 và 31/12, nhập ngày rỗng báo lỗi và giữ ngày hợp lệ, 12 tháng có đúng số ngày, đổi hoạt động, chọn ngày từ lịch, so sánh cùng ngày có thông báo, Hôm nay theo UTC+7.
- Ba màn hình đều không tràn ngang ở viewport 320, 375, 390, 430px. Tại 1280px, thân app vẫn 430px, cùng bố cục một cột. Console không có lỗi JavaScript trong các luồng đã kiểm tra.
- Build output giữ tài liệu và dữ liệu cá nhân ngoài dist. Cấu hình Vercel chưa được kiểm thử bằng một deployment thật.

Giới hạn: kiểm thử Edge với viewport điện thoại, chưa chạy trên thiết bị iOS/Safari và Android vật lý. Không thể bảo đảm mọi tình huống ngoài môi trường đã kiểm thử. Chưa mô phỏng lỗi mạng trong trình duyệt; app có trạng thái tải lỗi và nút thử lại. Không có backend/database để kiểm thử.

## Khôi phục theo yêu cầu người dùng

Giao diện đã được khôi phục nguyên bản từ `archive/tide-app/legacy-index.html`. Các kết quả kiểm thử và style guide ở trên mô tả bản thiết kế đã bị hủy, không áp dụng cho giao diện hiện tại. Đã xác nhận bằng Edge: trang chủ, gợi ý đá banh/bắt ghẹ và thanh điều hướng gốc hiển thị lại. Không áp dụng logo AI mới.
