# Style hiện tại của giao diện gốc

Chỉ thay diện mạo và artwork; giữ nguyên bố cục, navigation, thao tác chọn ngày, nội dung và công thức dự báo.

- Navy #10243a: header và chữ chính.
- Blue #1858a5: điều hướng đang chọn, nhấn mạnh và ngày đang chọn.
- Canvas #f5f7fa, surface #ffffff, border #dce4ed.
- Good #207350, medium #946318, bad #b04449: màu điểm đánh giá.
- Giảm gradient và bóng đổ, giữ nguyên kích thước và vị trí component.
- Logo raster tạo bằng công cụ imagegen tích hợp, tại `tide-app/public/logo-maritime.png`. Prompt: biểu tượng sóng kết hợp la bàn, nền navy, màu trắng và xanh nhạt, hình học tối giản, không chữ, rõ khi thu nhỏ.
- Icon bóng đá, ghẹ, bãi đá và cảnh báo được vẽ SVG inline, cùng viewBox 32, nét 1.7, dùng currentColor; không còn emoji trong giao diện.
- Theme riêng tại `tide-app/public/brand-theme.css`, không sửa layout CSS gốc.

Kiểm tra: nội dung JavaScript giống bản gốc sau khi chuẩn hóa phần icon; cú pháp JavaScript hợp lệ; điểm hôm nay vẫn 92% đá banh / 57% bắt ghẹ. Kiểm tra Edge: logo load được; home, month, compare không tràn ngang ở 320px; không có lỗi console.

## Chuẩn hóa kích thước giao diện

Header 18px/24px; tiêu đề tháng 16px/22px; số ngày 16px/18px; điểm 11px/13px; tab hoạt động 14px/20px; nhãn navigation 11px/15px. Nút điều khiển 44px; ô ngày cao 56px; navigation cao 64px cộng safe-area. Khoảng cách 4/8/12/16px, thẻ bo 12px, nút bo 8–10px. Giữ nguyên JavaScript, dữ liệu và các luồng hiện có. Build thành công; kiểm tra trình duyệt cho lần thay đổi kích thước này bị timeout, chưa xác nhận trực quan.

## Bề mặt và chuyển động

Theme hiện tại: chữ #202734, nền #f2f3f7, accent #3478cf, trạng thái good #328267 / medium #a77528 / bad #b65b63. Thẻ trắng bo 20px; các khối icon bo 14px, segmented control nền xám với lựa chọn trắng. Header và navigation dùng bề mặt mờ nhẹ có fallback nền RGBA. Chỉ animate opacity/transform; nhấn 140ms, chuyển màn hình 180ms, mở lịch 200ms, thẻ xuất hiện 240ms. Không có animation lặp. `prefers-reduced-motion: reduce` tắt animation, transition và scale khi nhấn. Không đổi JavaScript hay công thức dự báo.

Nguồn tham khảo: https://developer.apple.com/design/human-interface-guidelines/motion và https://developer.samsung.com/one-ui/index.html . Đây là ứng dụng web lấy cảm hứng từ pattern native, không phải component UIKit/One UI thật.

## Activity image cards
Images generated with built-in imagegen. Prompts: football on exposed wet sand at Bai Dua, with Ha Long seawall, Nui Nho hillside and rocky shoreline, based on an actual location reference; blue swimming crab on wet coastal sand, natural editorial photography. Assets: tide-app/public/activity-football.png and activity-crab.png. These are AI illustrations, not documentary location photographs.
Reference: https://mia.vn/cam-nang-du-lich/bai-dua-vung-tau-dang-ve-e-ap-then-thung-cua-vung-bien-hoang-so-1136
UI hierarchy reference: https://developer.apple.com/design/human-interface-guidelines/
Calendar percentages carry semantic color directly; selected cells use a white percentage chip to retain the status color and contrast.
