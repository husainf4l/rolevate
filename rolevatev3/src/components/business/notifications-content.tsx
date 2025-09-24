"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  Archive,
  Mail,
  Clock,
  User,
  Briefcase,
  FileText
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'application' | 'interview' | 'system' | 'message';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationsContentProps {
  locale: string;
}

export default function NotificationsContent({ locale }: NotificationsContentProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications from API
  useEffect(() => {
    if (isAuthenticated && user) {
      // TODO: Replace with actual API call
      const fetchNotifications = async () => {
        try {
          // const response = await fetch('/api/notifications');
          // const data = await response.json();
          // setNotifications(data);
          
          // For now, show empty state
          setNotifications([]);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
          setNotifications([]);
          setLoading(false);
        }
      };

      fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'application':
        return <User className="w-4 h-4" />;
      case 'interview':
        return <Clock className="w-4 h-4" />;
      case 'message':
        return <Mail className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return locale === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return locale === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return locale === 'ar' ? `منذ ${days} يوم` : `${days}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notif.isRead;
    return notif.category === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'تتبع جميع التحديثات والرسائل المهمة' : 'Track all your important updates and messages'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {unreadCount} {locale === 'ar' ? 'جديد' : 'new'}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            {locale === 'ar' ? 'قراءة الكل' : 'Mark all read'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">
            {locale === 'ar' ? 'الكل' : 'All'}
          </TabsTrigger>
          <TabsTrigger value="unread">
            {locale === 'ar' ? 'غير مقروء' : 'Unread'}
          </TabsTrigger>
          <TabsTrigger value="application">
            {locale === 'ar' ? 'الطلبات' : 'Applications'}
          </TabsTrigger>
          <TabsTrigger value="interview">
            {locale === 'ar' ? 'المقابلات' : 'Interviews'}
          </TabsTrigger>
          <TabsTrigger value="message">
            {locale === 'ar' ? 'الرسائل' : 'Messages'}
          </TabsTrigger>
          <TabsTrigger value="system">
            {locale === 'ar' ? 'النظام' : 'System'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </h3>
                <p className="text-muted-foreground text-center">
                  {locale === 'ar' ? 'لا توجد إشعارات في هذه الفئة' : 'No notifications in this category'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-primary/10' : 'bg-muted'}`}>
                          {getNotificationIcon(notification.category)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                              {notification.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <Check className="w-4 h-4 mr-2" />
                                {locale === 'ar' ? 'تمييز كمقروء' : 'Mark as read'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {locale === 'ar' ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}