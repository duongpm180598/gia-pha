Dự án ra đời từ nhu cầu thực tế: cần một hệ thống Cloud để con cháu ở nhiều nơi có thể cùng cập nhật thông tin (kết hôn, sinh con...), thay vì phụ thuộc vào một máy cục bộ. Việc tự triển khai mã nguồn mở giúp gia đình bạn nắm trọn quyền kiểm soát dữ liệu nhạy cảm, thay vì phó mặc cho các dịch vụ bên thứ ba. Ban đầu mình chỉ làm cho gia đình sử dụng, nhưng vì được nhiều người quan tâm nên mình quyết định chia sẻ công khai.

Phù hợp với người Việt Nam.

## Các tính năng chính

- **Sơ đồ trực quan**: Xem gia phả dạng Cây (Tree) và Sơ đồ tư duy (Mindmap).
- **Tìm danh xưng**: Tự động xác định cách gọi tên (Bác, Chú, Cô, Dì...) chính xác.
- **Quản lý thành viên**: Lưu trữ thông tin, avatar và sắp xếp thứ tự nhánh dòng họ.
- **Thống kê & Sự kiện**: Theo dõi ngày giỗ và các chỉ số nhân khẩu học của dòng họ.
- **Sao lưu dữ liệu**: Xuất/nhập file JSON để lưu trữ hoặc di chuyển dễ dàng.
- **Bảo mật**: Phân quyền Admin và bảo vệ dữ liệu bằng Supabase.
- **Đa thiết bị**: Giao diện hiện đại, tối ưu cho cả máy tính và điện thoại.

## 1. Tạo Database (Miễn phí với Supabase)

1. Tạo tài khoản miễn phí tại https://github.com nếu chưa có.
2. Tạo tài khoản miễn phí tại https://supabase.com nếu chưa có (khuyên dùng đăng ký bằng tài khoản GitHub cho nhanh).
3. Tạo **New Project**. Đợi khoảng 1 -> 2 phút để hệ thống khởi tạo xong.
4. Vào **Project Settings → API**, giữ lại 2 giá trị này để dùng ở bước tiếp theo:
   - `Project URL`
   - `Project API Keys`

---

## Cách 1: Deploy nhanh lên Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhomielab%2Fgiapha-os&env=SITE_NAME,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)

1. Tạo tài khoản miễn phí tại https://vercel.com nếu chưa có (khuyên dùng đăng ký bằng tài khoản GitHub cho nhanh).
2. Nhấn nút Deploy bên trên.
3. Điền các biến môi trường đã lưu ở **bước 1**:
   - `NEXT_PUBLIC_SUPABASE_URL` = `Project URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` = `Project API Keys`
4. Nhấn **Deploy** và chờ 2 -> 3 phút.

Bạn sẽ có một đường link website để sử dụng ngay.

---

## Cách 2: Chạy trên máy cá nhân

Yêu cầu: máy đã cài [Node.js](https://nodejs.org/en) và [Bun](https://bun.sh/)

1. Clone hoặc tải project về máy.
2. Đổi tên file `.env.example` thành `.env.local`.
3. Mở file `.env.local` và điền các giá trị đã lưu ở **bước 1**.

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-anon-key"
```

4. Cài thư viện

```bash
bun install
```

5. Chạy dự án

```bash
bun run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

---

## Tài khoản đầu tiên

- Đăng ký tài khoản mới khi vào web lần đầu.
- Người đăng ký đầu tiên sẽ tự động có quyền **admin**.
- Các tài khoản đăng ký sau sẽ mặc định là **member**.

## Đóng góp (Contributing)

Dự án này là mã nguồn mở, hoan nghênh mọi đóng góp, báo cáo lỗi (issues) và yêu cầu sửa đổi (pull requests) để phát triển ứng dụng ngày càng tốt hơn.

## Tuyên bố từ chối trách nhiệm & Quyền riêng tư

> **Dự án này chỉ cung cấp mã nguồn (source code). Không có bất kỳ dữ liệu cá nhân nào được thu thập hay lưu trữ bởi tác giả.**

- **Tự lưu trữ hoàn toàn (Self-hosted):** Khi bạn triển khai ứng dụng, toàn bộ dữ liệu gia phả (tên, ngày sinh, quan hệ, thông tin liên hệ...) được lưu trữ **trong tài khoản Supabase của chính bạn**. Tác giả dự án không có quyền truy cập vào database đó.

- **Không thu thập dữ liệu:** Không có analytics, không có tracking, không có telemetry, không có bất kỳ hình thức thu thập thông tin người dùng nào được tích hợp trong mã nguồn.

- **Bạn kiểm soát dữ liệu của bạn:** Mọi dữ liệu gia đình, thông tin thành viên đều nằm hoàn toàn trong cơ sở dữ liệu Supabase mà bạn tạo và quản lý. Bạn có thể xóa, xuất hoặc di chuyển dữ liệu bất cứ lúc nào.

## Giấy phép (License)

Dự án được phân phối dưới giấy phép MIT.
