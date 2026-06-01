# AI Studio Classroom 🏫✨

**AI Studio Classroom** là một ứng dụng web học tập thực tế và sáng tạo dành riêng cho học sinh Trung học Cơ sở (lớp 6–9). Ứng dụng giúp các em phát triển tư duy sáng tạo, kỹ năng diễn đạt ý tưởng và nâng cao hiểu biết về công nghệ trí tuệ nhân tạo (AI) thông qua việc xây dựng câu lệnh (prompting) có cấu trúc để thiết kế tranh ảnh và video ngắn.

Dự án được xây dựng dựa trên sự tích hợp chặt chẽ giữa **Next.js** và bộ công cụ **Vidtory AI SDK**, đem lại trải nghiệm học tập an toàn, trực quan và chuyên nghiệp.

---

## 🚀 Tính năng nổi bật

### 1. Các Xưởng Sáng Tạo (Creative Studios)
Ứng dụng được chia thành nhiều không gian sáng tạo chuyên biệt được tối ưu hóa cho trẻ em:
* **Xưởng Truyện Tranh (Comic Studio):** Tạo hình phân cảnh nhiều ô hình, bối cảnh ngộ nghĩnh và kể chuyện bằng tranh.
* **Tạo Nhân Vật (Mascot Studio):** Tự thiết kế các chú Mascot dễ thương của riêng mình với các chi tiết về hình dáng, trang phục, và hành động.
* **Xưởng Khoa Học Vui (Science Studio):** Minh họa hiện tượng và phát minh khoa học thông qua bộ gợi ý mẫu (nước bốc hơi, núi lửa phun trào, sơ đồ cấu trúc ADN...).
* **Vẽ tranh cùng AI (Sketch-to-Image):** Tải lên bản vẽ nháp hoặc phác thảo trên giấy và nhờ AI tô màu, hoàn thiện thành tác phẩm nghệ thuật sắc nét.
* **Sáng tạo Infographic (Infographic Studio):** Thiết kế sơ đồ thông tin trực quan (Timeline, so sánh đối chiếu, sơ đồ cây phân cấp) với các quy tắc ràng buộc bố cục nghiêm ngặt đảm bảo chất lượng đầu ra.

### 2. Trình dựng Prompt Thông minh (Prompt Builder)
* Thay vì chỉ gõ tay tự do, học sinh được tiếp cận cách ra lệnh có cấu trúc qua 2 nhóm thông tin rõ ràng: **Ý tưởng của em** (chủ thể, nội dung chi tiết) và **Phong cách & Bối cảnh** (bố cục, phong cách vẽ, cảm xúc, ngôn ngữ chữ viết).
* **Công thức câu lệnh trực quan:** Hiển thị công thức câu lệnh cụ thể của từng phòng xưởng (ví dụ: `[Nhân vật] + [Hành động] + [Chia ô] + [Phong cách]`) cập nhật động thời gian thực khi chuyển đổi tab.

### 3. Bộ lọc An toàn cho Học đường (Safety Guards)
* **Keyword Blacklist:** Tự động chặn các từ khóa nhạy cảm liên quan đến bạo lực, người lớn, chất kích thích hoặc ngôn ngữ không phù hợp.
* **Chặn thông tin cá nhân (PII):** Cảnh báo học sinh khi cố tình nhập tên thật, trường học hoặc địa chỉ nhà. Bộ lọc có khả năng tự nhận diện và loại trừ các từ khoa học thông dụng như *"môi trường"*, *"từ trường"*, *"trường hợp"* để tránh báo động giả.
* **Cảnh báo tải ảnh mặt:** Yêu cầu học sinh cam kết không tải lên hình ảnh có chứa khuôn mặt người thật hoặc trẻ em để bảo vệ quyền riêng tư.

### 4. Chế độ So sánh "Đổi 1 chi tiết & Xem khác biệt"
* Cho phép lưu lại tác phẩm trước đó làm mốc tham chiếu. Khi tạo tác phẩm mới, ứng dụng sẽ so sánh song song hai hình ảnh và làm nổi bật (highlight) những từ ngữ thay đổi trong câu lệnh, giúp học sinh rút ra bài học về nguyên nhân - kết quả của việc điều chỉnh prompt.

### 5. Dashboard dành cho Giáo viên (Teacher Dashboard)
* Khi đăng nhập bằng tài khoản giáo viên, giáo viên sẽ truy cập được giao diện giám sát đặc quyền:
  * **Theo dõi thời gian thực:** Xem toàn bộ lịch sử tạo ảnh/video, tệp tham chiếu được tải lên của toàn bộ học sinh trong lớp.
  * **Đồng bộ hóa đám mây:** Tích hợp gọi trực tiếp danh sách công việc (`ai.jobs`) và tệp tin (`ai.media`) từ tài khoản Vidtory AI để đảm bảo dữ liệu hiển thị tuyệt đối chính xác.
  * **Bộ lọc và tìm kiếm:** Tìm nhanh theo tên học sinh, tài khoản, hoặc từ khóa trong prompt; lọc theo Studio hoặc loại sản phẩm (Ảnh/Video).
  * **Hành động quản lý:** Giáo viên có quyền xóa từng tác phẩm không phù hợp trên server đám mây, reset dọn sạch lịch sử lớp học hoặc xuất báo cáo chi tiết ra tệp Excel / CSV (hỗ trợ hiển thị tiếng Việt).

### 6. Nén và Tối ưu hóa Hình ảnh tải lên
* Hệ thống tự động chuyển đổi mọi định dạng ảnh học sinh tải lên (PNG, WebP, GIF...) sang **JPG** và nén ở chất lượng **85%** trước khi truyền lên máy chủ. Việc này giúp giảm hơn 75% băng thông truyền tải và tối ưu hóa dung lượng lưu trữ trên đám mây.

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

* **Frontend:** Vanilla HTML5, CSS3 hiện đại (Glassmorphism, CSS Variables, Responsive Sidebar), và JavaScript ES6 Modules.
* **Backend:** Next.js (API Route Handlers) đảm nhận vai trò cầu nối bảo mật để che giấu API Key đối với client.
* **Generative AI Core:** `@vidtory/ai-sdk` (v1.1.0) kết nối tới các mô hình AI tiên tiến (Gemini 3.1, Veo 3.1).
* **Lưu trữ Session:** `localStorage` phân tách theo từng tên đăng nhập học sinh (`ai_studio_session_${username}`).
* **Testing:** Playwright E2E Test Suite.

---

## 🔑 Danh sách Tài khoản đăng nhập

Tất cả tài khoản sử dụng chung một mật khẩu mặc định là: **`risupia123`**

### 1. Giáo viên (Có quyền quản lý)
* `giaovien1`
* `giaovien2`
* `teacher1`
* `teacher2`

### 2. Học sinh (Giới hạn quota tạo hình)
* `hocsinh1`, `hocsinh2`, `hocsinh3`
* `student1`, `student2`, `student3`

---

## 💻 Cài đặt và Chạy dưới Local

### Yêu cầu hệ thống
* Node.js >= 18.0.0
* Một API Key hợp lệ từ nền tảng Vidtory AI.

### Các bước khởi chạy

1. **Clone mã nguồn dự án về máy:**
   ```bash
   git clone https://github.com/0xAstroAlpha/panasonic-ai-studio.git
   cd panasonic-ai-studio
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường (Environment Variables):**
   Tạo tệp `.env` tại thư mục gốc của dự án với nội dung:
   ```env
   VIDTORY_API_KEY=key_cua_ban_tai_day
   ```

4. **Chạy server phát triển (Development mode):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000)

5. **Biên dịch sản phẩm (Production build):**
   ```bash
   npm run build
   npm start
   ```

---

## ☁️ Triển khai lên Vercel (Vercel Deployment)

Ứng dụng được thiết kế hoàn toàn tương thích và tối ưu hóa cho nền tảng đám mây **Vercel** thông qua Next.js:
1. Đảm bảo cấu hình dự án ở preset: **Next.js**.
2. Thêm biến môi trường `VIDTORY_API_KEY` trong mục cấu hình Environment Variables của Vercel Dashboard.
3. Vercel sẽ tự động build các API Route Handlers trong thư mục `app/api` thành các Serverless Functions và phục vụ tệp giao diện tĩnh từ thư mục `public` hiệu quả.
