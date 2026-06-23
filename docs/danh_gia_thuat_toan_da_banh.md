# Tài Liệu Đánh Giá Thuật Toán Dự Báo Đá Banh Bãi Biển (Vũng Tàu Tide App)

Tài liệu này phân tích chi tiết và đánh giá thuật toán đánh giá mức độ phù hợp cho hoạt động **Đá banh bãi biển** dựa trên dữ liệu thủy triều Vũng Tàu.

---

## 1. Tổng Quan Thuật Toán (Algorithm Overview)

Thuật toán dự báo đá banh bãi biển (`assessFootball`) được thiết kế để xác định xem một ngày cụ thể có thích hợp để chơi đá bóng trên bãi biển hay không. Khác với các hoạt động khác (như bắt ghẹ cần nước ròng/rút sâu), đá bóng bãi biển cần **khung giờ có ánh sáng ngày** và **phần cát khô đủ rộng** (thủy triều không quá cao làm ngập bãi cát).

### Các thông số cốt lõi (Core Parameters):
- **Khung giờ phân tích (Target Window)**: 16:30 - 18:30 hằng ngày. Đây là thời điểm lý tưởng vì trời mát mẻ, còn đủ ánh sáng tự nhiên và là giờ tan tầm phổ biến cho các hoạt động thể thao ngoài trời.
- **Ngưỡng nước giới hạn (Threshold)**: Mặc định dưới `3.0m` (có thể tùy chỉnh). Đặc biệt, nếu **triều đang dâng** trong khung giờ chơi (mực nước lúc 18:30 > 16:30), ngưỡng nước giới hạn sẽ tự động giảm đi `0.5m` (xuống còn `2.5m`) do sóng triều dâng lấn bãi mạnh hơn.
- **Tần suất lấy mẫu (Sampling)**: Lấy mẫu tại 5 thời điểm cách nhau 30 phút: `16:30`, `17:00`, `17:30`, `18:00`, `18:30`.

---

## 2. Chi Tiết Logic Tính Toán (Detailed Logic & Formulas)

### Bước 1: Nội suy mực nước (Tide Interpolation)
Vì dữ liệu đầu vào thủy triều chỉ có theo từng giờ chẵn (ví dụ: 16h, 17h, 18h, 19h), thuật toán sử dụng **nội suy hình sin/cosine (cosine interpolation)** để ước lượng mực nước chính xác hơn tại các phút lẻ (16:30, 17:30, 18:30). Cách này mô phỏng đường cong thủy triều chuẩn xác hơn so với nội suy tuyến tính.

Công thức nội suy tại phút lẻ `minute`:
$$x = \frac{minute - hour \times 60}{60}$$
$$cosRatio = \frac{1 - \cos(x \times \pi)}{2}$$
$$H_{minute} = H_{hour} + (H_{next\_hour} - H_{hour}) \times cosRatio$$

### Bước 2: Tính điểm thành phần (Sub-score Calculation)
Với mỗi điểm mẫu trong 5 điểm mẫu, thuật toán tính điểm độ phù hợp của mực nước qua hàm `scoreBelow`:
- Nếu mực nước $H \le \text{Threshold}$ ($3.0m$): Điểm = `100` (hoàn hảo).
- Nếu mực nước $H > \text{Threshold}$ (ví dụ nước dâng lên trên 3m): Điểm sẽ bị trừ dần dựa trên mức độ vượt ngưỡng với hệ số phạt (penalty coefficient) là `36` điểm/mét:
  $$\text{Score} = \max(0, 100 - (H - \text{Threshold}) \times 36)$$

*Ví dụ: Nếu nước cao 3.5m (vượt ngưỡng 0.5m), điểm tại thời điểm đó sẽ là $100 - 0.5 \times 36 = 82$.*

### Bước 3: Tính điểm tổng hợp cho ngày (Final Score Aggregation)
Thuật toán phân chia thành 2 trường hợp chính để tính điểm cuối cùng:

#### **Trường hợp A: Tất cả 5 điểm mẫu đều đạt yêu cầu ($H \le 3.0m$)**
Đây là trường hợp lý tưởng (`allOk = true`). Điểm số cơ bản bắt đầu từ `88%`, và được cộng thêm điểm thưởng (bonus) nếu mực nước càng thấp (giúp bãi cát rộng hơn):
$$\text{Score} = 88 + \min(12, (\text{Threshold} - H_{max}) \times 8)$$
- Nếu nước rút cực thấp (ví dụ tối đa chỉ $1.5m$): Điểm thưởng đạt tối đa $+12 \implies$ **Điểm cuối cùng = 100%**.
- Nếu nước mấp mé ngưỡng giới hạn (ví dụ tối đa $2.9m$): Điểm thưởng nhỏ $\implies$ **Điểm cuối cùng $\approx$ 88% - 89%**.

#### **Trường hợp B: Có ít nhất một điểm mẫu vượt ngưỡng ($H > \text{Threshold}$)**
Đây là trường hợp bãi cát sẽ bị ngập ở một số thời điểm trong khung giờ chơi.
Thay vì chặn cứng điểm tối đa ở mức `69%` (Cân nhắc), thuật toán mới sử dụng **cơ chế chấm điểm mềm dẻo dựa trên số giờ chơi được thực tế** (`belowCount` - số điểm mẫu dưới ngưỡng trong tổng số 5 điểm lấy mẫu):
- **Nếu chơi được $\ge 1$ tiếng (tương đương `belowCount >= 3`)**: Ngày đó vẫn được đánh giá là khá tốt vì người chơi chỉ cần lùi giờ đá lại một chút. Điểm số nằm trong vùng **Rất đáng đi (Green, 70% - 85%)**:
  $$\text{Score} = 70 + \left(\frac{belowCount}{\text{totalSamples}}\right) \times 15 + \text{margin} \times 5$$
  *Ví dụ: Hôm nay có 3/5 điểm đạt yêu cầu $\implies \text{Score} = 70 + 0.6 \times 15 + \text{margin} \times 5 = 79\% - 80\%$ (Vùng xanh lá, Rất đáng đi).*
- **Nếu chơi được < 1 tiếng (tương đương `belowCount < 3`)**: Thời gian chơi quá ngắn, ngày đó bị đánh giá thấp và phạt điểm sâu hơn dựa trên số lượng mẫu đạt chuẩn:
  - **Nếu `belowCount === 2`**: Phạt điểm về vùng dưới 25% (Không thuận):
    $$\text{Score} = 25 \times \left(\frac{\text{avgScore}}{100}\right)$$
  - **Nếu `belowCount === 1`**: Phạt điểm về vùng dưới 5% (Không thuận):
    $$\text{Score} = 5 \times \left(\frac{\text{avgScore}}{100}\right)$$
  - **Nếu `belowCount === 0`**: Đạt `0%` (Không thuận).

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
  - **18:00 (Nước nội suy 2.7m - triều đang dâng)**: Thực tế hoàn toàn không thể đá bóng (0%), bãi cát chỉ rộng khoảng nửa mét. Triều đang dâng từ 2.4m lên 2.8m khiến sóng biển đánh sát tường kè. Kết quả thuật toán mới (áp dụng giảm ngưỡng dâng 0.5m còn 2.5m và phạt belowCount = 1): **5%** (Không thuận).
- **Ngày 23/06/2026** (Thứ Ba):
  - **17:30 (Nước nội suy 2.2m - triều đang dâng nhẹ)**: Thực tế bãi cát rộng khoảng 5m, đá bóng khá thoải mái (`good`). Kết quả thuật toán mới: **89%** (Rất đáng đi).

