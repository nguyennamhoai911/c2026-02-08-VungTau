# Lịch thủy triều Vũng Tàu

Ứng dụng chỉ đọc, giao diện app điện thoại duy nhất (tối đa 430px). Máy tính hiển thị cùng khung điện thoại ở giữa. Không có backend, database, đăng nhập, ghi chú hay thông báo; sử dụng Lucide/Chart.js qua CDN và font Be Vietnam Pro qua Google Fonts.

## Chạy

- `npm --prefix tide-app run dev` → http://127.0.0.1:3133
- `npm --prefix tide-app run build`
- `npm --prefix tide-app test`

## Vercel

Import repository với Root Directory là thư mục gốc repository. `vercel.json` đã đặt build command và output directory `tide-app/dist`. Không dùng `public` hay thư mục gốc làm output. Không có function/serverless, chỉ static files.

Build chỉ xuất 10 file trong danh sách cho phép, gồm mã giao diện, dữ liệu hiển thị và ảnh tài nguyên. Dữ liệu thủy triều cần cho việc hiển thị là public và có thể tải xuống; không thể giấu dữ liệu đã đưa vào trình duyệt.

Tài liệu gốc tại thư mục gốc, `docs/`, và bản cũ tại `archive/` được giữ trong repository, không được đưa vào dist. Dữ liệu gốc được lưu trong archive; dữ liệu và quy tắc có trong mã giao diện public vẫn có thể được đọc từ trình duyệt. File untracked của người dùng được giữ nguyên. Cần commit/push các thay đổi thì phần lưu trữ mới có trên GitHub.

Không đưa vào deploy khác với bảo mật trên GitHub: nếu repository public, tài liệu và lịch sử Git vẫn có thể đọc trên GitHub. Muốn giữ riêng tư phải dùng repository private. Chưa kiểm tra hoặc thay đổi visibility GitHub, chưa publish lên Vercel.

## Căn cứ thiết kế

Nhãn tiếng Việt trực tiếp, 3 luồng tra cứu, bảng 24 giờ thay thế biểu đồ cho người cần số liệu. Nút và ô nhập chính cao tối thiểu 44px; ô lịch có nhãn điểm bằng chữ/số, không chỉ phân biệt bằng màu. Focus bàn phím rõ, input 16px tránh tự zoom trên iOS, dùng giờ Việt Nam cho ngày hiện tại.

Tham khảo: https://www.w3.org/WAI/WCAG21/Understanding/reflow và https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html ; cấu hình static deployment: https://vercel.com/docs/builds/configure-a-build .

Cấu hình Vercel hỗ trợ Root Directory ở gốc repository hoặc `tide-app`: mỗi thư mục có vercel.json tương ứng và build bằng Node trực tiếp, không cần npm install.
