# Nguồn dữ liệu thủy triều Vũng Tàu 2027

Ngày thu thập: 30/10/2026. Phạm vi: 01/01–31/12/2027, đủ 365 ngày, 8.760 giá trị 00:00–23:00 theo giờ Việt Nam, kèm triều lớn/ròng.

## Bản đang áp dụng sau kiểm chứng thực đo

Bộ 2027 trên ứng dụng dùng TICON-4 với **bù nền +0,012039285088561707 m**, chỉ ước lượng từ quan trắc UHSLC năm 2025. Trên 5.786 giờ thực đo tháng 1–8/2026, phương án đạt MAE 8,95 cm và RMSE 11,35 cm. Đây là kết quả kiểm tra lịch sử, không phải cam kết sai số năm 2027.

Nguồn tham số đã chọn: `du-bao-2027-da-kiem-chung-metadata.json`. Toàn bộ 8.760 giá trị giờ xuất vào ứng dụng khớp bộ `du-bao-2027-theo-mo-hinh-da-kiem-chung.csv` sau làm tròn 0,01 m. Cả độ cao triều lớn/ròng được cộng cùng bù nền; giờ sự kiện giữ nguyên. Xem `chon-mo-hinh-va-du-bao-2027-tu-quan-trac.md` để đọc dữ liệu thực đo, tách giai đoạn khớp và kiểm tra, phương án so sánh và giới hạn.

**Mốc của bản đang áp dụng là mốc căn chỉnh thực nghiệm UHSLC qua mức nền 2025, không ghi là LAT nguyên bản.** Bù nền thống kê chưa xác minh phép chuyển mốc cao độ chính thức hoặc mốc bảng 2026; điểm hoạt động tiếp tục mang tính tham khảo. Không thay ngưỡng hoạt động trong lượt cập nhật dữ liệu này.

Các thông tin LAT và giá trị đối chiếu bên dưới mô tả **mô hình nguồn trước bù nền**, để giữ căn cứ tái lập. Script nhập hiện đọc thêm metadata kiểm chứng và cộng bù nền trước khi làm tròn.

## Nguồn và bản chất dữ liệu gốc

- Nguồn trạm và bộ dự báo: https://tide.is/en/tides/vietnam/vung-tau/
- Trạm `vung-tau-vn`: 10.340°N, 107.072°E; Asia/Ho_Chi_Minh (UTC+7). Metadata nguồn ghi chuỗi đo 19 năm đến 2025.
- Hằng số: TICON-4, Hart-Davis, M., Dettmering, D., Seitz, F. (2025), DGFI-TUM; CC BY 4.0; https://doi.org/10.17882/109129. Nguồn nghiên cứu: https://openadb.dgfi.tum.de/en/ocean-tides/ ; phương pháp TICON: Piccioni et al. (2019), https://doi.org/10.1002/gdj3.72.
- Mốc độ cao: mét trên LAT (lowest astronomical tide), dùng z0 = 2.746 m như metadata Tide.is. Nguồn mốc: Hart-Davis, Sulzbach & Talke (2026), CC BY 4.0, https://doi.org/10.17882/111620.
- Đây là **dữ liệu dự báo thiên văn tính từ hằng số trạm bằng bộ tính công khai của Tide.is**, không phải chuỗi đo thực tế 2027, không phải bảng 2027 chính thức của Việt Nam, cũng không phải nội suy từ một vài điểm triều lớn/ròng hay sao chép lịch 2026.
- Tại thời điểm tìm kiếm, chưa xác minh được bản 2027 chính thức của Việt Nam. Trang Viện Kỹ thuật Biển kiểm tra vẫn công bố bảng 2026: https://www.icoe.org.vn/index.php?action=view&gid=1002&id=1013&mod=list . Không suy ra rằng mọi nơi đều chưa xuất bản 2027.
- Chưa xác minh mốc của PDF 2026 có trùng LAT; không tự bù cao độ hay hiệu chỉnh dữ liệu 2026. Điểm hoạt động 2027 áp dụng công thức hiện có và chỉ mang tính tham khảo. Ứng dụng ghi rõ nguồn trong phần giới thiệu và khi xem chi tiết 2027.
- Dự báo không bao gồm tác động thời tiết/gió; không dùng cho hàng hải.

## Cách tạo và tái lập

Đọc ghi chú này → `tide-is-vung-tau-metadata.json` → `tide-is-vn-harmonics.json` → `tide-is-harmonic-source.js` → `../tide-app/public/data-2027.csv`.

Các URL chính xác của bản nguồn nằm trong metadata. File HTML lưu bản trang được tải khi thực hiện. File engine là phần TideHarmonic được trích nguyên từ đầu app.js của Tide.is; không sửa thuật toán. Các gói dữ liệu hằng số vẫn theo thứ tự constituent trong metadata.

Chạy từ thư mục gốc:

```powershell
node tide-app/scripts/import-tides-2027.mjs
node --test tide-app/tests/tides-2027.test.mjs
```

Script tính từng giờ tại đúng thời điểm UTC tương ứng với giờ Việt Nam; cộng z0 theo nguồn; lưu độ cao làm tròn 0,01 m. Triều lớn/ròng dùng hàm events của nguồn với minRange=0,02 m, lấy giờ/phút địa phương, dấu `-` nếu không có lần thứ hai. Dữ liệu 2026 giữ nguyên trong data.csv; dữ liệu bổ sung ở data-2027.csv. Parser nhận năm riêng để không nhầm hai năm.

## Kiểm chứng

- Đủ 12 tháng, không thiếu hoặc trùng ngày; tất cả 8.760 giá trị theo giờ hữu hạn.
- Cả parser giao diện và parser module cho cùng kết quả.
- Giờ địa phương và chiều cao đối chiếu với bảng Tide.is ngày 29/10/2026: lớn 02:02 / 4,1 m và 16:35 / 4,2 m; ròng 09:17 / 0,6 m và 21:41 / 3,0 m (bảng nguồn làm tròn 0,1 m).
- Đối chiếu tham khảo độc lập ngày 01/01/2027 với SeaTemperatu.re: triều lớn 08:37 / 3,21 m, 20:09 / 3,80 m; bộ được nhập cho 08:44 / 3,16 m, 20:19 / 3,85 m. Khác mô hình nên không ép số liệu khớp nhau. https://www.seatemperatu.re/southeast-asia/vietnam/v-ng-tau/tides/month/all/
- Kiểm tra chuyển 31/12/2026 → 01/01/2027 và ngày ngoài phạm vi không trả nhầm ngày đầu năm.

## SHA-256 của bản nguồn đã lưu

- `tide-is-vung-tau-source.html`: `5bbff03529a4619d35bb1646ee4b8507a240d4457dcf2393fa356fca59e3ea41`
- `tide-is-vung-tau-metadata.json`: `f9be1207197e411df2abfb328c9d81be4826b6bf7fc52f034fda0d9ef0295ef7`
- `tide-is-vn-harmonics.json`: `4cb5c11fde6183884af963241b61fb3a00c3b0917db9a06db68c0ac81fc757cd`
- `tide-is-harmonic-source.js`: `312ca458d8726c74fbbd7f8d15e3bc45dd6f09cd3a704b169f9c9601ace2b158`
