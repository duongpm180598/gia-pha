# Thông báo đẩy (Web Push) — Sinh nhật & Ngày giỗ

Nhắc người dùng Android bằng thông báo đẩy tới điện thoại vào **8h sáng mỗi ngày**, kể cả khi trình duyệt đang đóng, dựa trên sinh nhật (dương lịch) và ngày giỗ (âm lịch) đã có sẵn trong gia phả.

Code đã được implement đầy đủ trong repo (xem danh sách file bên dưới) — file này chỉ ghi lại **các bước setup còn thiếu** để tính năng chạy được trong thực tế.

## Kiến trúc

```
Supabase pg_cron (08:00 VN = 01:00 UTC, 1 lần/ngày)
   → pg_net http_post → /api/cron/notify-events  (Authorization: Bearer CRON_SECRET)
       → admin client (service role) đọc persons + push_subscriptions
       → computeEvents() lọc daysUntil === 0
       → gom thành 1 thông báo digest chung
       → web-push gửi tới từng subscription (tự xoá nếu 404/410 — hết hạn)

Trình duyệt Android (Chrome):
   Trang /dashboard/events → nút "Bật thông báo"
       → đăng ký Service Worker (public/sw.js)
       → Notification.requestPermission()
       → pushManager.subscribe(VAPID public key)
       → POST /api/push/subscribe → lưu vào bảng push_subscriptions (RLS: chỉ chủ sở hữu)
   Khi có push đến (kể cả app đóng): sw.js hiển thị notification, click → mở /dashboard/events
```

Đây là Web Push chuẩn (VAPID + Service Worker) — **không cần Firebase**, hoạt động trên Chrome Android ngay cả khi chưa cài PWA. Supabase chỉ đóng vai trò lên lịch + gọi HTTP; việc ký VAPID và gửi push thực sự do route `/api/cron/notify-events` (Node, thư viện `web-push`) đảm nhiệm.

## Các file liên quan

| File | Vai trò |
|---|---|
| `docs/schema.sql` | Bảng `push_subscriptions` + RLS (mỗi user chỉ quản lý subscription của mình) |
| `utils/supabase/admin.ts` | Service-role client, bỏ qua RLS — chỉ dùng server-side (cron) |
| `public/sw.js` | Service worker: nhận `push`, hiển thị notification, xử lý click |
| `public/site.webmanifest`, `app/layout.tsx` | Manifest cho trình duyệt |
| `components/PushNotificationManager.tsx` | Nút "Bật thông báo" trên trang Events |
| `app/api/push/subscribe/route.ts` | Lưu subscription của user đăng nhập |
| `app/api/cron/notify-events/route.ts` | Route cron: tính sự kiện hôm nay, gửi push, dọn subscription hết hạn |
| `docs/setup-cron.sql` | Script chạy tay trong Supabase SQL Editor để bật `pg_cron`/`pg_net` |

## Việc cần làm để chạy được (chưa hoàn tất)

1. **Áp bảng mới lên Supabase** — chạy phần `push_subscriptions` trong `docs/schema.sql` (SQL Editor, Supabase Dashboard).
2. **Điền `SUPABASE_SERVICE_ROLE_KEY`** trong `.env` — lấy tại Supabase Dashboard → Settings → API → `service_role` (secret, không lộ ra client).
3. **VAPID keys & `CRON_SECRET`** — đã được sinh sẵn và điền vào `.env` local (không commit git). Nếu deploy môi trường khác (Vercel...), copy các biến sau từ `.env` sang biến môi trường của môi trường đó:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `CRON_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy app** để có domain public (`pg_net` không gọi được `localhost`).
5. **Chạy `docs/setup-cron.sql`** trong Supabase SQL Editor — nhớ thay `<your-domain>` và `<CRON_SECRET>` bằng giá trị thật trước khi chạy.
6. **Test**: vào `/dashboard/events` bằng Chrome Android → bấm "Bật thông báo" → kiểm tra có row mới trong bảng `push_subscriptions`. Gọi tay `curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/notify-events` để bắn thử (chỉ gửi nếu có sự kiện đúng hôm nay).

## Ghi chú

- Mỗi người dùng phải tự bấm "Bật thông báo" trên thiết bị của họ — không thể bật hộ hàng loạt vì Web Push cần quyền cấp từ chính trình duyệt/thiết bị đó.
- Thông báo được gửi **chung cho mọi người đã bật**, không phân biệt admin/member (vì sinh nhật/ngày giỗ là sự kiện chung của dòng họ).
- Muốn đổi lịch 8h sáng: sửa cron expression trong `docs/setup-cron.sql` rồi `select cron.unschedule('notify-events-daily');` job cũ trước khi `cron.schedule` lại.
