"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

type Status = "unsupported" | "checking" | "denied" | "subscribed" | "idle";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function initialStatus(): Status {
  if (typeof window === "undefined") return "checking";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  return "checking";
}

export default function PushNotificationManager() {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== "checking") return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? "subscribed" : "idle"))
      .catch(() => setStatus("idle"));
  }, [status]);

  async function handleEnable() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      alert("Chưa cấu hình VAPID public key.");
      return;
    }

    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("Subscribe request failed");

      setStatus("subscribed");
    } catch {
      setStatus("idle");
      alert("Không thể bật thông báo. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  if (status === "denied") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-sm text-stone-500">
        <BellOff className="size-4 shrink-0" />
        Bạn đã chặn thông báo trình duyệt. Hãy bật lại trong cài đặt trình
        duyệt nếu muốn nhận nhắc nhở.
      </div>
    );
  }

  if (status === "subscribed") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
        <BellRing className="size-4 shrink-0" />
        Đã bật thông báo sinh nhật & ngày giỗ trên thiết bị này
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={busy}
      className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-60"
    >
      <Bell className="size-4 shrink-0" />
      {busy
        ? "Đang bật..."
        : "Bật thông báo sinh nhật & ngày giỗ trên điện thoại"}
    </button>
  );
}
