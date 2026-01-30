import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  LogIn,
  Check,
  Trash2,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Notification = Tables<"notifications">;

const typeIcons: Record<string, React.ElementType> = {
  appointment: Calendar,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
};

const typeColors: Record<string, string> = {
  appointment: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <div className="max-w-md mx-auto">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">{t("nav.notifications")}</h1>
            <p className="text-muted-foreground mb-6">
              Please login to view your notifications.
            </p>
            <Button onClick={() => navigate("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              {t("auth.login")}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const IconComponent = typeIcons[notification.type || "info"] || Info;
    const colorClass = typeColors[notification.type || "info"] || typeColors.info;

    return (
      <Card
        className={`card-hover cursor-pointer transition-all ${
          !notification.is_read ? "border-primary/50 bg-primary/5" : ""
        }`}
        onClick={() => {
          if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${colorClass}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{notification.title}</h3>
                {!notification.is_read && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.body}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("nav.notifications")}</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3 max-w-2xl">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No notifications yet. We'll let you know when something happens!
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
