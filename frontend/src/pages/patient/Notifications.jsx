import React from 'react';
import { Bell, CheckCheck, Calendar, FileText, Pill, ShieldCheck, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-primary" />;
      case 'record':
        return <FileText className="w-4 h-4 text-blue-700" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-gray-500 mt-1">
            Stay informed about your appointments, prescriptions, and medical updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1 text-primary" /> Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Bell}
            title="All Caught Up"
            description="You don't have any notifications at the moment."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`p-4 transition-all cursor-pointer ${
                notif.is_read
                  ? 'bg-white opacity-85 hover:opacity-100'
                  : 'bg-blue-50/40 border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-xs shrink-0">
                  {getIcon(notif.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{notif.title}</h4>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {notif.created_at?.split('T')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
