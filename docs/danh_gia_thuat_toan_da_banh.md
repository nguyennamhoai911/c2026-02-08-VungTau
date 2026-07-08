# Tài Liệu Đánh Giá Thuật Toán Dự Báo Đá Banh Bãi Biển (Vũng Tàu Tide App)

Tài liệu này phân tích chi tiết và đánh giá thuật toán đánh giá mức độ phù hợp cho hoạt động **Đá banh bãi biển** dựa trên dữ liệu thủy triều Vũng Tàu.

---

## 1. Tổng Quan Thuật Toán (Algorithm Overview)

Thuật toán dự báo đá banh bãi biển (`assessFootball`) được thiết kế để xác định xem một ngày cụ thể có thích hợp để chơi đá bóng trên bãi biển hay không. Khác với các hoạt động khác (như bắt ghẹ cần nước ròng/rút sâu), đá bóng bãi biển cần **khung giờ có ánh sáng ngày** và **phần cát khô đủ rộng** (thủy triều không quá cao làm ngập bãi cát).

### Các thông số cốt lõi (Core Parameters):
- **Khung giờ phân tích chính (Target Window)**: **17:00 - 18:00** hằng ngày. Đây là thời điểm đá bóng thực tế chủ yếu. Mốc 18:30 không được kéo điểm lên quá cao.
- **Tần suất lấy mẫu (Sampling)**: Lấy mẫu tại 3 thời điểm: `17:00` (quyết định đi hay không), `17:30` (quyết định tốt hay tạm), và `18:00` (điểm cộng nhỏ).

---

## 2. Chi Tiết Logic Tính Toán (Detailed Logic & Formulas)

### Bước 1: Nội suy mực nước (Tide Interpolation)
Sử dụng công thức nội suy hình sin/cosine tại 3 phút lẻ:
- $H_{17}$ (Nước lúc 17:00)
- $H_{17.5}$ (Nước lúc 17:30)
- $H_{18}$ (Nước lúc 18:00)

### Bước 2: Phân loại triều dâng / triều rút
- **Triều đang dâng** ($H_{18} > H_{17}$): Phạt rất nặng vì bãi cát bị hẹp nhanh.
- **Triều đang rút** ($H_{18} \le H_{17}$): Thuận lợi hơn nhưng vẫn bị giới hạn nếu đẹp quá muộn.

### Bước 3: Hàm tính điểm mềm (Sigmoid)
Sử dụng hàm Sigmoid để làm mượt điểm số dựa trên ngưỡng chuyển tiếp:
$$\text{scoreHeight}(H, \text{Threshold}, \text{softness} = 0.12) = \frac{100}{1 + e^{(H - \text{Threshold}) / 0.12}}$$

### Bước 4: Công thức tính điểm cụ thể

#### **Trường hợp Triều Dâng (`isRising = true`)**:
- $H_{18} \ge 2.70m$: **0%** (ngập sát kè).
- $H_{18} \ge 2.60m$: **20%** (nước cao bãi hẹp).
- $H_{17.5} \ge 2.45m$ và $H_{18} \ge 2.55m$: **25%** (rất rủi ro).
- Toàn khung thấp ($H_{17} \le 2.10m$, $H_{17.5} \le 2.25m$, $H_{18} \le 2.40m$): **90%** (rất đẹp).
- Điểm mềm:
  $$\text{Score} = \text{scoreHeight}(H_{17}, 2.30) \times 0.45 + \text{scoreHeight}(H_{17.5}, 2.35) \times 0.40 + \text{scoreHeight}(H_{18}, 2.45) \times 0.15$$

#### **Trường hợp Triều Rút (`isRising = false`)**:
- $H_{17} \ge 3.10m$ và $H_{17.5} \ge 3.00m$: **0%** (nước quá cao).
- $H_{17} \ge 2.75m$ và $H_{17.5} \ge 2.50m$: **20%** (đẹp quá muộn - hiệu chuẩn ngày 03/07).
- $H_{17} \ge 2.65m$ và $H_{17.5} \ge 2.45m$: **35%** (hơi muộn).
- $H_{17} \ge 2.50m$ và $H_{17.5} \ge 2.35m$: **55%** (tạm được).
- Đẹp từ đầu khung ($H_{17} \le 2.40m$, $H_{17.5} \le 2.30m$): **90%** (hoàn hảo).
- Điểm mềm:
  $$\text{Score} = \text{scoreHeight}(H_{17}, 2.45) \times 0.50 + \text{scoreHeight}(H_{17.5}, 2.40) \times 0.35 + \text{scoreHeight}(H_{18}, 2.50) \times 0.15$$

---

## 3. Đánh Giá Chất Lượng Thuật Toán (Algorithm Evaluation)

### 3.1. Các điểm tốt (Strengths - "Được")
*   **Thực tế và thực tiễn (Practicality)**: Việc giới hạn cứng khung giờ `16:30 - 18:30` rất hợp lý cho hoạt động đá banh bãi biển. Nó tránh việc đề xuất những khung giờ nước rất thấp nhưng vào lúc 12:00 trưa (nắng nóng gay gắt) hoặc 02:00 sáng (tối mịt).
*   **Logic phạt mềm mượt (Soft Penalty)**: Sử dụng công thức trừ điểm tuyến tính thay vì đánh trượt kiểu True/False giúp phản ánh đúng thực tế. Nước vượt ngưỡng nhẹ (ví dụ 3.05m) vẫn có thể cố gắng đá được, điểm số giảm nhẹ thay vì rơi thẳng về 0.
*   **Cơ chế chặn điểm an toàn (Safety Cap)**: Việc khống chế điểm tối đa ở mức `69%` khi có bất kỳ thời điểm nào ngập nước giúp người dùng không chủ quan. Nếu thấy 69%, họ sẽ biết có khoảng thời gian nước dâng cao trong trận đấu.
*   **Thưởng cho nước ròng (Low Tide Reward)**: Việc cộng thêm điểm thưởng khi nước càng thấp là điểm cộng lớn, vì bãi cát rộng và khô hơn đá banh sẽ sướng hơn nhiều.

### 3.2. Điểm hạn chế (Limitations - "Chưa được")
*   **Nội suy tuyến tính chưa tối ưu**: Thủy triều chuyển động theo dạng sóng hình sin (sinusoidal). Việc nội suy tuyến tính (nối thẳng giữa các giờ) có thể gây sai lệch nhẹ (khoảng $0.05m - 0.15m$) tại các thời điểm chuyển pha nước lớn/nước ròng.
*   **Cố định khung giờ suốt năm**: Khung giờ `16:30 - 18:30` cố định cho mọi tháng. Thực tế tại Vũng Tàu, vào mùa đông (tháng 11 - tháng 1) trời tối rất nhanh (khoảng 17:45 đã bắt đầu nhập nhoạng tối), trong khi mùa hè có thể đá đến 18:30. Khung giờ cố định có thể hơi thiếu linh hoạt theo mùa.
*   **Chưa tích hợp thời tiết**: Thuật toán chỉ dựa hoàn toàn vào mực nước triều. Nếu trời mưa bão hoặc sóng lớn (gió mùa đông bắc hoạt động mạnh), bãi cát dù nước thấp vẫn không thể chơi được.
*   **Đặc thù từng bãi biển**: Vũng Tàu có nhiều bãi biển với độ dốc khác nhau. Bãi Sau cát bằng phẳng và rộng thì ngưỡng 3.0m là hợp lý, nhưng Bãi Trước hoặc Bãi Dứa dốc và nhiều đá thì ngưỡng 3.0m nước vẫn còn quá cao.

---

## 4. Đề Xuất Cải Tiến (Future Recommendations)

Để nâng cấp thuật toán này thông minh và chính xác hơn, chúng ta có thể implement các cải tiến sau:

1.  **Nội suy hình sin (Cosine/Harmonic Interpolation)**: Thay thế công thức tuyến tính bằng nội suy Cosine để đường cong mực nước mịn và sát thực tế thủy triều hơn.
2.  **Khung giờ động theo tháng (Seasonal Window)**: Điều chỉnh thời gian kết thúc sớm hơn vào các tháng mùa đông (ví dụ: kết thúc lúc 18:00 thay vì 18:30) để đảm bảo an toàn ánh sáng.
3.  **Hỗ trợ lựa chọn bãi biển (Beach-specific Thresholds)**: Cho phép người dùng chọn bãi biển cụ thể (Bãi Trước, Bãi Sau) và tự động thay đổi ngưỡng mặc định (ví dụ: Bãi Sau = 3.0m, Bãi Trước = 2.6m).

---

## 5. Cơ Chế Phản Hồi Thực Tế & Lưu Trữ Dữ Liệu Lâu Dài (Feedback-Loop & Long-term Research)

Để thuật toán dự đoán ngày càng khớp với thực tế bãi biển Vũng Tàu, dự án triển khai cơ chế **vòng lặp phản hồi (Feedback Loop)** dựa trên quan trắc thực tế của người chơi.

### 5.1. File Lưu Trữ Dữ Liệu Nghiên Cứu
Toàn bộ dữ liệu thực tế do người dùng báo cáo được lưu trữ cấu trúc chặt chẽ tại file:
[lich_su_thuc_te_da_banh.json](file:///c:/code/c2026-02-08-VungTau/docs/lich_su_thuc_te_da_banh.json) (dưới dạng JSON array). File này được thiết kế để lưu giữ lịch sử dài hạn, phục vụ nghiên cứu và hiệu chỉnh thuật toán sau 1 năm hoặc nhiều năm sau.

### 5.2. Cấu Trúc Dữ Liệu Feedback
Mỗi bản ghi feedback lưu lại các biến số quan trọng:
- `date`: Ngày quan trắc.
- `feedback_timestamp`: Thời gian gửi phản hồi.
- `tide_data_reference`: Trích xuất các mốc nước triều thô trong ngày từ bảng thủy triều gốc.
- `observations`: Danh sách các mốc giờ chơi thực tế kèm mực nước nội suy và đánh giá độ chơi được (`playability`: `good` / `marginal` / `bad`).

### 5.3. Bản Ghi Cơ Sở Đầu Tiên (Baseline Data - Ngày 17/06/2026)
Hệ thống đã lưu lại dữ liệu thực tế ngày 17/06/2026 làm mốc hiệu chuẩn đầu tiên:
- **17:15 (Nước nội suy 3.15m)**: Bắt đầu lộ bãi vừa đủ đá (`marginal`).
- **17:35 (Nước nội suy 2.95m)**: Nước xuống dưới 3.0m, bãi đá tốt bình thường (`good`).

*Đây là minh chứng thực tế khẳng định ngưỡng mặc định $3.0m$ của thuật toán là cực kỳ sát với thực tế.*

### 5.4. Các Bản Ghi Bổ Sung (Additional Records)

- **Ngày 18/06/2026**:
  - **17:45 (Nước nội suy 2.59m)**: Nước rút đủ rộng tương tự như hôm qua (`good`). Quan sát thực tế cho thấy bãi cát rộng rãi trễ hơn hôm qua khoảng 10 phút do sự lệch pha tự nhiên của đỉnh triều.
- **Ngày 19/06/2026**:
  - **17:30 (Nước nội suy 3.15m)**: Bãi cát ngập sâu hoàn toàn không thể đá bóng (`bad`). Thực tế 0%. Kết quả thuật toán mới: **23%** (Không thuận).
- **Ngày 20/06/2026**:
  - **17:30 (Nước nội suy 3.20m)**: Nước ngập sát bờ suốt cả khung giờ, hoàn toàn không thể đá bóng (`bad`). Thực tế 0%. Kết quả thuật toán mới: **5%** (Không thuận).
- **Ngày 22/06/2026** (Thứ Hai):
  - **18:00 (Nước nội suy 2.7m - triều đang dâng)**: Thực tế hoàn toàn không thể đá bóng (0%), bãi cát chỉ rộng khoảng nửa mét. Triều đang dâng từ 2.4m lên 2.8m khiến sóng biển đánh sát tường kè. Kết quả thuật toán mới (áp dụng giảm ngưỡng dâng 0.7m còn 2.3m): **0%** (Không thuận).
- **Ngày 23/06/2026** (Thứ Ba):
  - **17:30 (Nước nội suy 2.2m - triều đang dâng nhẹ)**: Thực tế bãi cát rộng khoảng 5m, đá bóng khá thoải mái (`good`). Kết quả thuật toán mới: **82%** (Rất đáng đi).
- **Ngày 08/07/2026** (Thứ Tư):
  - **18:00 (Nước nội suy 2.6m - triều đang dâng)**: Thực tế bãi cát rất hẹp, sóng đánh mạnh lên bãi và không thể chơi đá bóng (chỉ khoảng 20% khả năng chơi). Kết quả thuật toán mới (áp dụng giảm ngưỡng dâng 0.7m còn 2.3m, belowCount = 2): **23%** (Không thuận).

