# PRODUCT BRIEF — AI IMAGE STUDIO FOR MIDDLE SCHOOL

\---

## 1\. Tổng quan sản phẩm

**Tên dự kiến:** AI Studio Classroom  
**Đối tượng:** Học sinh THCS (lớp 6–9), \~100 người dùng đồng thời  
**Mục tiêu giáo dục:** Cho học sinh trải nghiệm thực tế cách AI tạo ảnh được ứng dụng trong các ngành nghề khác nhau, phát triển tư duy sáng tạo và kỹ năng diễn đạt ý tưởng qua prompt.  
**Tech stack dự kiến:** Google Antigravity (vibe code), backend đơn giản xoay quanh system prompt, không cần database phức tạp.

\---

## 2\. User Flow tổng quát

```
Vào web
→ Đăng nhập (tài khoản/mật khẩu do giáo viên cấp)
→ Thiết lập profile (nhập nickname + chọn avatar AI-generated)
→ Dashboard chọn module
→ Vào Studio của module đó
→ Dùng Prompt Builder
→ Gen ảnh / Gen video
→ Xem Gallery cá nhân
```

\---

## 3\. Authentication \& Profile

**Đăng nhập:** Tài khoản + mật khẩu đơn giản, do giáo viên/admin tạo sẵn. Không cần email, không cần xác thực phức tạp.

**Profile setup (lần đầu đăng nhập):**

* Nhập nickname tự chọn (có filter tên không phù hợp)
* Chọn avatar từ bộ \~20–30 avatar thú vị được tạo sẵn bằng AI (style dễ thương, đa dạng — robot, nhân vật hoạt hình, động vật phi thường...)
* Avatar và nickname hiển thị trên gallery, leaderboard (nếu có)

\---

## 4\. Các Module Studio

Mỗi module là một "studio nhỏ" với giao diện, chip gợi ý, và system prompt riêng biệt.

### A. Comic Studio — Truyện tranh

**Ngành nghề:** Họa sĩ truyện tranh, nhà thiết kế đồ họa, storyteller  
**Flow đặc biệt:** Học sinh định nghĩa nhân vật trước (tên, ngoại hình, trang phục) → lưu lại như "character card" → dùng character card đó làm anchor khi gen từng cảnh tiếp theo.  
**Chips đặc trưng:** Panel layout (1 cảnh / 2 cảnh / 4 cảnh dạng lưới), góc máy, thoại/hiệu ứng âm thanh.

### B. Fashion Studio — Thời trang

**Ngành nghề:** Nhà thiết kế thời trang, stylist, marketing thương hiệu  
**Flow đặc biệt:** Upload ảnh tham khảo (người mẫu hoặc trang phục) → AI tổng hợp thành ảnh quảng cáo sản phẩm.  
**Chips đặc trưng:** Phong cách chụp (lookbook / editorial / street style), bối cảnh (studio trắng / outdoor / urban), ánh sáng.

### C. Film Poster Studio — Điện ảnh

**Ngành nghề:** Đạo diễn, nhà thiết kế poster, marketing phim  
**Flow đặc biệt:** Học sinh tạo "film card" trước (tên phim, thể loại, nhân vật chính, tagline) → từ đó gen poster hoặc gen cảnh phim cụ thể.  
**Chips đặc trưng:** Thể loại phim, mood màu sắc, kiểu typography trên poster.

### D. Game Studio — Trò chơi điện tử

**Ngành nghề:** Game designer, concept artist, 3D artist  
**Flow đặc biệt:** Character builder riêng (class/role, trang bị, màu sắc chủ đạo) + Environment builder (biome, thời tiết, thời gian trong ngày).  
**Chips đặc trưng:** Thể loại game (RPG / pixel art / 3D realistic / chibi), biome, góc nhìn camera.

### E. Book Cover Studio — Xuất bản sách

**Ngành nghề:** Nhà thiết kế bìa sách, nhà xuất bản, illustrator  
**Flow:** Flow đơn giản nhất, phù hợp người mới. Học sinh nhập tên sách + design bìa mong muốn + tên tác giả (của mình) → gen bìa.  
**Chips đặc trưng:** Thể loại sách, palette màu, kiểu minh họa, kiểu chữ.

### K. Social Post Studio — Mạng xã hội \& Marketing

**Ngành nghề:** Content creator, social media marketer, nhà quảng cáo  
**Flow đặc biệt:** Học sinh chọn "sản phẩm ngẫu nhiên" từ danh sách vui (trà sữa, sneaker, cây cảnh...) → lấy idea phong cách từ board Pinterest gợi ý sẵn → gen ảnh social post theo style đó.  
**Chips đặc trưng:** Tỉ lệ ảnh (1:1 / 9:16 / 16:9), mood, màu nền chủ đạo.

### I. Interior Studio — Thiết kế nội thất

**Ngành nghề:** Kiến trúc sư nội thất, nhà thiết kế không gian  
**Flow:** Chọn loại phòng → phong cách nội thất → gen. Có thêm tùy chọn "phòng trong mơ của tôi" để tự do hơn.  
**Chips đặc trưng:** Phong cách (minimalist / cozy / futuristic / Japanese), ánh sáng, vật liệu chủ đạo.

### J. Infographic Studio — Thiết kế thông tin

**Ngành nghề:** Nhà giáo dục, báo chí, data visualization designer  
**Flow đặc biệt:** Học sinh nhập chủ đề muốn học → AI suggest cấu trúc infographic (timeline / so sánh / quy trình / mind map) → học sinh chọn → gen.  
**Chips đặc trưng:** Môn học, màu sắc, kiểu layout thông tin.

Có thêm input thông tin để thành infographic

\---

## 5\. Prompt Builder — Core Component

Dùng chung cho tất cả module, được customize chips theo từng module.

### Cơ chế hoạt động

```
Học sinh nhìn thấy 6 block xếp theo thứ tự
→ Block 1 (Chủ thể): bắt buộc, chỉ gõ tay
→ Block 2–6: optional, mỗi block có hàng chip gợi ý phía trên ô text

Với mỗi block optional, học sinh làm 1 trong 2:
  A. Click chip → text chip điền vào ô text của block đó
  B. Bỏ qua chip → gõ tay trực tiếp vào ô text

→ Ô prompt tổng hợp phía dưới tự động cập nhật realtime
   (các block nối bằng dấu phẩy theo thứ tự, block trống bị bỏ qua)
→ Bấm "Gen ảnh" → gửi đến API
```

### 6 Block \& Chips gợi ý (Note rõ đây là các chip gợi ý, học sinh có thể tự ra lệnh theo ý ngoài các chip cho sẵn)

**Block 1 — Chủ thể** *(bắt buộc, gõ tay)*  
Câu hỏi gợi ý: "Bạn muốn vẽ cái gì hoặc ai?"  
Không có chip, chỉ có placeholder text theo từng module.

\---

**Block 2 — Hành động / Tư thế** *(optional)*  
Chips theo module. Tất cả chip về style kèm **ảnh minh họa thumbnail** để học sinh nhận biết bằng hình ảnh thay. 

|Chip|Minh họa cần có|
|-|-|
|standing|Ảnh nhân vật đứng thẳng|
|sitting|Ảnh nhân vật ngồi|
|running|Ảnh nhân vật đang chạy|
|flying|Ảnh nhân vật đang bay|
|fighting|Ảnh cảnh chiến đấu|
|talking|Ảnh nhân vật đang trò chuyện|

\---

**Block 3 — Bối cảnh / Môi trường** *(optional)*  
Chips theo module, kèm ảnh minh họa thumbnail.

|Chip|Minh họa cần có|
|-|-|
|forest|Ảnh rừng cây|
|city street|Ảnh phố thị|
|white studio|Ảnh studio nền trắng|
|bedroom|Ảnh phòng ngủ|
|classroom|Ảnh lớp học|
|outer space|Ảnh vũ trụ|

\---

**Block 4 — Phong cách / Chất liệu** *(optional)*  
⚠️ Block quan trọng nhất cần ảnh minh họa — học sinh khó hình dung nhất ở block này.

|Chip|Minh họa cần có|
|-|-|
|anime|Ảnh style anime Nhật Bản|
|watercolor|Ảnh tranh màu nước|
|oil painting|Ảnh tranh sơn dầu|
|flat design|Ảnh style vector phẳng|
|3D render|Ảnh render 3D|
|pixel art|Ảnh pixel art|
|sketch|Ảnh phác thảo bút chì|
|chibi|Ảnh style chibi dễ thương|
|photorealistic|Ảnh siêu thực|

\---

**Block 5 — Ánh sáng / Màu sắc** *(optional)*  
Chips kèm ảnh minh họa thumbnail.

|Chip|Minh họa cần có|
|-|-|
|golden hour|Ảnh ánh nắng vàng hoàng hôn|
|neon lights|Ảnh ánh đèn neon tím/hồng|
|studio lighting|Ảnh ánh sáng studio trắng đều|
|pastel|Ảnh màu pastel nhẹ nhàng|
|monochrome|Ảnh đen trắng|
|dark \& moody|Ảnh tối, có chiều sâu|

\---

**Block 6 — Cảm xúc / Atmosphere** *(optional)*  
Chips kèm ảnh minh họa thumbnail.

|Chip|Minh họa cần có|
|-|-|
|dreamy|Ảnh mờ ảo, mơ mộng|
|dramatic|Ảnh dramatic, cảm xúc mạnh|
|cheerful|Ảnh vui tươi, sáng sủa|
|mysterious|Ảnh bí ẩn, sương mù|
|calm|Ảnh yên tĩnh, thư giãn|
|epic|Ảnh hoành tráng, hùng tráng|

\---

### Cách hiển thị chip có ảnh minh họa

Mỗi chip được render dạng **card nhỏ** gồm:

* Thumbnail ảnh minh họa (vuông \~60x60px hoặc 80x80px)
* Label tên chip phía dưới (tiếng Anh + có thể thêm tiếng Việt nhỏ hơn)
* Khi hover: viền highlight
* Khi selected: nền màu accent, checkmark nhỏ góc trên

Ảnh minh họa được chuẩn bị sẵn dạng bộ ảnh tĩnh đặt trong `/public/chips/` — không gọi API để gen ảnh chip realtime.

\---

### Ô Prompt tổng hợp

* Realtime update khi bất kỳ block nào thay đổi
* Format: `\[Block1], \[Block2], \[Block3], \[Block4], \[Block5], \[Block6]` (block trống bị bỏ qua)
* Học sinh có thể edit trực tiếp ô này
* Nút "Dịch sang tiếng Anh" ẩn, tự động xử lý ở backend trước khi gửi API — học sinh gõ tiếng Việt thoải mái
* Nút **"Gen ảnh"** màu nổi bật, kích thước lớn

\---

## 6\. Content Safety Filter

Đây là lớp bảo vệ quan trọng nhất với đối tượng THCS. Hoạt động ở **backend**, học sinh không thấy cơ chế hoạt động.

### 3 Lớp lọc

**Lớp 1 — Keyword blacklist (tiếng Việt + tiếng Anh)**  
Danh sách từ khóa bao gồm: bạo lực, tình dục, ma túy, vũ khí, nội dung chính trị nhạy cảm, ngôn ngữ thù ghét. Lọc trước khi gửi đến AI. List được cập nhật bởi admin.

**Lớp 2 — System prompt cứng per module**  
Mỗi module có system prompt bắt đầu bằng đoạn instruction rõ ràng:

* Chỉ tạo nội dung phù hợp học sinh dưới 15 tuổi
* Từ chối mọi yêu cầu không liên quan đến chủ đề module
* Không tạo nội dung bạo lực / tình dục / quá kinh dị (style mysterious chấp nhận được) / chính trị

**Lớp 3 — Response check**  
Nếu AI từ chối hoặc ảnh bị flag, hiển thị thông báo thân thiện:

> \*"Ý tưởng này chưa phù hợp, thử mô tả khác nhé!"\*

Không giải thích lý do chi tiết để tránh học sinh tìm cách bypass.

\---

## 7\. Gallery \& Lưu trữ

**Gallery cá nhân (không có gallery lớp):**

* Ảnh gen ra lưu tạm trong session (localStorage hoặc in-memory)
* Xóa cache = mất ảnh — học sinh được thông báo rõ khi đăng nhập
* Nút download ảnh về máy ở mỗi ảnh trong gallery

\---

## 8\. Image to Video

Tính năng bổ sung, nằm trong gallery của từng ảnh đã gen.

**Flow:**

1. Học sinh chọn 1 ảnh trong gallery
2. Nhấn nút "🎬 Tạo video từ ảnh này"
3. Chọn kiểu chuyển động: nhẹ nhàng / dramatic / zoom in / parallax
4. Đợi gen (thời gian lâu hơn gen ảnh — hiển thị progress bar)
5. Download clip \~3–5 giây 

**Lưu ý:** Tính năng này tốn thời gian gen hơn — phù hợp giao về nhà, không dùng trong tiết học chính.

\---

## 9\. Dashboard \& UX tổng thể

**Dashboard chính:**

* Grid 8 module, mỗi ô có: icon minh họa + tên module + 1 câu mô tả ngắn ngành nghề tương ứng
* Ví dụ: *"Fashion Studio — Người làm marketing dùng AI để tạo ảnh sản phẩm nhanh hơn 10 lần"*

**Header:**

* Góc trái: Avatar + nickname học sinh + số ảnh đã tạo hôm nay
* Góc phải: Nút giáo viên (login riêng) để xem log, bật/tắt gallery lớp, reset session

**Ngôn ngữ \& Tone:**

* 100% tiếng Việt
* Tone nhẹ nhàng, khuyến khích, dùng emoji vừa phải
* Tránh ngôn ngữ kỹ thuật — ưu tiên ngôn ngữ học sinh quen dùng

\---

## 10\. Scope kỹ thuật

### Trong scope (v1)

* Frontend single-page app, responsive (tablet + laptop)
* Auth đơn giản (session cookie, không cần JWT phức tạp)
* Gọi API gen ảnh
* System prompt per module với safety instruction cứng
* Keyword filter ở server-side function
* localStorage cho gallery tạm
* Image-to-video API 

### Ngoài scope (v1)

* Lưu lịch sử lâu dài vào database
* Tính năng social (like, comment)
* Mobile app native
* Đa ngôn ngữ

\---

