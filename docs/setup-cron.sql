-- ==========================================
-- CẤU HÌNH CRONJOB THÔNG BÁO SINH NHẬT / NGÀY GIỖ
-- ==========================================
-- Chạy TAY 1 LẦN trong Supabase Dashboard > SQL Editor (không phải migration tự động).
-- Trước khi chạy, thay 2 chỗ:
--   1. <your-domain>   -> domain thật đã deploy app (vd: giapha.example.com)
--   2. <CRON_SECRET>   -> giá trị CRON_SECRET đã đặt trong .env.local / biến môi trường deploy
--
-- Lưu ý: pg_net không gọi được "localhost" — chỉ hoạt động với domain đã public.
-- Khi dev local, test route bằng: curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/notify-events

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'notify-events-daily',
  '0 1 * * *', -- 01:00 UTC = 08:00 giờ Việt Nam (UTC+7), chạy 1 lần/ngày
  $$
  select net.http_post(
    url := 'https://<your-domain>/api/cron/notify-events',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);

-- Kiểm tra job đã được tạo:
-- select * from cron.job;

-- Xoá job nếu cần sửa lại lịch (rồi chạy lại cron.schedule ở trên):
-- select cron.unschedule('notify-events-daily');
