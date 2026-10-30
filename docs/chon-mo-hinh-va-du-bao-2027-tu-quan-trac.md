# Chọn mô hình bằng quan trắc 2026 và xuất dự báo 2027

Ngày thực hiện: 30/10/2026. Mục tiêu đầu ra: dự báo Vũng Tàu năm 2027. Không dùng bất kỳ bảng dự báo 2026 nào trên sản phẩm làm dữ liệu thực tế. Không sửa dữ liệu ứng dụng.

## Kết luận

Trong các mô hình đủ điều kiện kiểm tra độc lập đã thử, **Tide.is/TICON-4, với một hằng số bù nền chỉ học từ năm 2025**, đạt MAE thấp nhất 8,95 cm và RMSE thấp nhất 11,35 cm trên 5.786 giờ quan trắc hợp lệ tháng 1–8/2026. Mô hình điều hòa 19 thành phần tự khớp từ 2024–2025 đạt MAE 9,24 cm, RMSE 11,56 cm. Chênh lệch nhỏ (~3 mm MAE), không có cơ sở nói TICON vượt trội rõ rệt trong mọi mùa hoặc mọi năm.

JRC kém hơn trên tập giờ chung. Mặt khác, hệ số JRC hiện tại đã dùng dữ liệu đến tháng 10/2026; không đủ điều kiện coi là mô hình đóng băng trước năm kiểm tra. Chỉ đưa JRC vào bảng đối chiếu hồi cứu, không vào danh sách mô hình dự báo độc lập đủ điều kiện chọn.

Đã xuất `du-bao-2027-theo-mo-hinh-da-kiem-chung.csv`: 8.760 giá trị giờ, từ 01/01/2027 00:00 đến 31/12/2027 23:00 giờ Việt Nam. Đây là dự báo, không phải thực đo 2027. Chỉ được gọi là phương án có kết quả tốt nhất **trong các phương án và giai đoạn đã thử**.

## 1. Dữ liệu thực đo làm chuẩn

Nguồn: UHSLC trạm 383 Vũng Tàu, https://uhslc.soest.hawaii.edu/data/csv/fast/hourly/h383.csv . Tệp đầy đủ tải về: `uhslc-383-fast-hourly-raw.csv`. Metadata nguồn: `uhslc-383-fast-metadata.html`, https://uhslc.soest.hawaii.edu/opendap/fast/hourly/h383.nc.html . Danh mục liên kết trạm: https://www.ioc-sealevelmonitoring.org/ssc/stationdetails.php?id=SSC-vung .

Tệp CSV gồm năm, tháng, ngày, giờ UTC, mực nước mm. Chia 1.000 để đổi sang mét, cộng 7 giờ khi xuất giờ Việt Nam. Chỉ loại mã thiếu -32767, không coi mọi số âm là thiếu, không thay số thiếu bằng số dự báo. Không nội suy UHSLC. Đây là quan trắc fast-delivery, chưa tương đương dữ liệu Research Quality; việc đánh giá mốc trạm và các bước kiểm soát chất lượng đầy đủ của RQ chưa được khẳng định cho chuỗi này.

Phạm vi kiểm tra: 01/01/2026 00:00–31/08/2026 23:00 UTC, tương ứng 01/01/2026 07:00–01/09/2026 06:00 giờ Việt Nam. Có 5.832 vị trí giờ, thiếu 46, còn 5.786 quan trắc (99,21%). Tại thời điểm tải, đây là phần 2026 có trong tệp; không giả định đã kiểm tra cả năm 2026. Bản quan trắc tách riêng: `quan-trac-vung-tau-2026-uhslc.csv`.

SHA-256 bản nguồn UHSLC: `6842a0b2ff47ce9c820c0b538593346ae85b382b892d2f69c9aee2653889be88`.

## 2. Thiết kế kiểm tra, tách khớp mô hình và đánh giá

Không tối ưu bất kỳ hệ số, pha, biên độ, bù nền hay dịch giờ bằng dữ liệu kiểm tra 2026.

- **Tide.is/TICON-4:** dùng engine và hệ số trạm đã lưu, metadata nguồn ghi chuỗi đo đến 2025; tính trực tiếp tại timestamp quan trắc. Bù một hằng số từ trung bình (thực đo UHSLC − dự báo) của toàn bộ giờ hợp lệ năm 2025, cố định cho 2026 và 2027. Không điều chỉnh biên độ/pha. Độc lập với năm 2026 theo thông tin phiên bản nguồn; chưa kiểm toán độc lập quy trình tạo TICON.
- **Điều hòa tự khớp:** 19 thành phần cố định trước khi xem kết quả: SA, SSA, MM, MF, Q1, O1, P1, K1, 2N2, MU2, N2, NU2, M2, L2, S2, K2, M4, MS4, M6. Dùng các hàm cơ sở thiên văn và hiệu chỉnh nút của engine Tide.is; khớp 38 hệ số sin/cos cùng 1 hệ số nền bằng bình phương tối thiểu từ quan trắc 2024–2025. Không có xu hướng tuyến tính, không dò bộ thành phần theo kết quả 2026. Đây là bộ hệ số khác, cùng họ công thức điều hòa, không phải phương pháp vật lý hoàn toàn độc lập. Ma trận đủ hạng, condition number 1.71.
- **JRC:** gọi `field=tide` từ API tính mô hình JRC, không dùng trường thực đo `level`. Bù hằng số bằng các giờ 2025 có thể ghép, sau đó giữ cố định. Trong giai đoạn lịch sử API trả mẫu mô hình theo timestamp dữ liệu trạm, không đều giờ: lấy đúng giờ nếu có, còn lại chỉ nội suy giữa hai mẫu mô hình cách nhau tối đa 20 phút. Không lấp khoảng trống dài. Năm 2026 còn 5.111 giờ chung, 675 giờ có UHSLC nhưng thiếu JRC có thể ghép. Mức bù 2025 chỉ dùng 8.616 giờ có JRC. Hệ số JRC đã bao gồm 2026: nguy cơ trùng dữ liệu khớp và kiểm tra.

Mô hình điều hòa tự khớp dùng 17284 mẫu trước 2026, từ 2024-01-01T00:00:00 đến 2025-12-31T23:00:00 UTC. Định nghĩa sai số = dự báo − thực đo. Tiêu chí chọn: RMSE thấp nhất trên tất cả 5.786 mẫu của hai phương án độc lập đủ điều kiện; MAE bổ sung để diễn giải. Dữ liệu 2026 được dùng để lựa chọn mô hình nên vẫn cần giai đoạn tương lai mới để xác nhận lựa chọn; kết quả không là cam kết chính xác 2027.

## 3. Kết quả hai mô hình độc lập trên toàn bộ 5.786 giờ

| Mô hình | MAE | RMSE | Sai lệch trung bình dự báo − đo | 95% mẫu có sai số tuyệt đối ≤ |
|---|---:|---:|---:|---:|
| TICON-4 + bù nền 2025 | 8,95 cm | 11,35 cm | +1,91 cm | 22,98 cm |
| Điều hòa 19 thành phần, khớp 2024–2025 | 9,24 cm | 11,56 cm | +0,34 cm | 22,77 cm |

95% ở đây là phân vị mẫu đã kiểm tra, không phải khoảng tin cậy dự báo tương lai. Sai lệch trung bình nhỏ không tự đồng nghĩa MAE/RMSE thấp hơn.

| Tháng UTC | Mẫu hợp lệ | MAE TICON-4 (cm) | MAE điều hòa 19 (cm) |
|---|---:|---:|---:|
| 1 | 744 | 7.60 | 8.89 |
| 2 | 672 | 6.91 | 7.71 |
| 3 | 744 | 10.21 | 10.93 |
| 4 | 719 | 13.88 | 12.00 |
| 5 | 743 | 9.13 | 9.80 |
| 6 | 697 | 7.51 | 7.24 |
| 7 | 725 | 7.44 | 7.98 |
| 8 | 742 | 8.76 | 9.19 |

TICON tốt hơn theo MAE ở 6/8 tháng; mô hình tự khớp tốt hơn tháng 4 và 6. Chưa đánh giá tháng 9–12 trong phép kiểm tra UHSLC này.

## 4. So ba phương án trên đúng 5.111 giờ chung

| Phương án | MAE | RMSE | Tình trạng |
|---|---:|---:|---|
| TICON-4 + bù nền 2025 | 9,13 cm | 11,53 cm | Không khớp vào 2026 |
| Điều hòa 19 thành phần | 9,45 cm | 11,79 cm | Khớp đến hết 2025 |
| JRC + bù nền 2025 | 37,02 cm | 44,33 cm | Hồi cứu, có khả năng trùng dữ liệu khớp |

Không so MAE 37,02 cm của JRC với 8,95 cm của TICON như cùng tập mẫu: số liệu cùng tập ở bảng này là 37,02 so với 9,13 cm. JRC hiện không đem lại lợi thế trong thử nghiệm, kể cả khi được hưởng lợi tiềm tàng từ dữ liệu khớp 2026. Không suy rộng thành mọi phiên bản JRC đều kém.

## 5. Công thức và kết quả 2027

Dùng dạng tổng quát:

`h2027(t) = z0 + Σ fi(t) Ai cos[Vi(t) + ui(t) − gi] + delta2025`

Trong đó `z0 = 2,746 m`, Ai và gi là biên độ/pha TICON-4 của trạm Vũng Tàu; Vi là đối số thiên văn; fi, ui là hiệu chỉnh nút theo engine lưu. Tính trên UTC, xuất giờ Việt Nam. `delta2025 = 0.012039285089 m` (~1,20 cm), được ước lượng từ quan trắc 2025, không phải từ kết quả kiểm tra 2026.

Kết quả 2027 lưu theo **mốc tham chiếu UHSLC được căn chỉnh thực nghiệm qua mức nền năm 2025**. Phép cộng delta là bù nền thống kê, không chứng minh phép chuyển mốc LAT sang mốc cao độ quốc gia, và cũng có thể chứa sai lệch mực nước trung bình của riêng năm 2025. Vì vậy không ghi nhãn cột cuối là LAT chính thức. Không dùng ngay các ngưỡng mét đang có trong ứng dụng nếu chưa xác nhận quan hệ mốc.

Giữ nguyên toàn bộ tham số đã kiểm tra, không khớp lại bằng 2026 trước khi xuất 2027. Khoảng giá trị tại giờ tròn: -0.047 đến 4.241 m trên mốc căn chỉnh nói trên, không phải cực trị mọi phút. So với kết quả engine Tide.is gốc, toàn bộ giá trị được cộng đúng delta; giờ triều không đổi bởi bù hằng số. Sai khác với CSV sản phẩm 2027 còn có làm tròn 0,01 m.

Dự báo điều hòa không dự báo trước mọi tác động thời tiết. Chưa đánh giá sai số thời điểm triều lớn/ròng so với thực đo, nên kết luận lựa chọn ở đây dựa trên độ cao theo giờ. Kết quả trạm không tự chứng minh độ chính xác ở Bãi Sau hay các bãi khác.

## 6. File và tái lập

1. `uhslc-383-fast-hourly-raw.csv`: quan trắc gốc, không phải dự báo sản phẩm.
2. `fetch-jrc-backtest.py`, `jrc-backtest-download-manifest.json`, các `jrc-backtest-*-raw.json`: nguồn JRC và URL chính xác.
3. `generate-backtest-basis.cjs`: tạo dự báo TICON và hàm cơ sở thiên văn từ 2024 đến 2027, không đọc bảng dự báo sản phẩm.
4. `backtest-models-and-predict-2027.py`: khớp tham số trước 2026, kiểm tra trên 2026, chọn mô hình và xuất 2027. Cần Node và Python/numpy.
5. `mo-hinh-dieu-hoa-vung-tau-frozen2025.json`: hệ số, phạm vi khớp, bù nền.
6. `kiem-chung-mo-hinh-2026-full-hourly.csv`, `kiem-chung-mo-hinh-2026-full-monthly.csv`: hai mô hình độc lập, 5.786 giờ.
7. `kiem-chung-mo-hinh-2026-hourly.csv`, `kiem-chung-mo-hinh-2026-monthly.csv`: ba phương án trên 5.111 giờ chung.
8. `kiem-chung-mo-hinh-2026-summary.json`: toàn bộ thống kê.
9. `du-bao-2027-theo-mo-hinh-da-kiem-chung.csv`: kết quả 2027 được lựa chọn.

Chạy tại gốc dự án:

```powershell
node docs/generate-backtest-basis.cjs
python docs/backtest-models-and-predict-2027.py
```

Đã kiểm tra số giờ, số thiếu, hạng ma trận, mọi giá trị 2027 hữu hạn và đủ 8.760 mẫu. Cả hai script tính toán không đọc `tide-app/public/data.csv` hoặc bảng 2027 trên sản phẩm. Những kết luận cũ dựa riêng uy tín nguồn được thay bằng bằng chứng thực đo nêu trong báo cáo này.
