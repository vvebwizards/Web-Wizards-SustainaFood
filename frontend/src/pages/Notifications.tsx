import { useEffect, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { CheckCircle, Bell } from "lucide-react";

const Notifications = () => {
    const { notifications, fetchNotifications, markAsRead } = useNotifications();
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const loadMore = () => {
        setVisibleCount((prev) => prev + 5);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Notifications</h2>
                <Bell className="w-6 h-6 text-gray-600" />
            </div>

            {notifications.length === 0 ? (
                <p className="text-gray-500 text-center">No new notifications</p>
            ) : (
                <div className="space-y-4">
                    {notifications.slice(0, visibleCount).map((notification) => (
                        <div 
                            key={notification._id} 
                            className={`flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-300 
                                ${notification.isRead ? "bg-gray-100" : "bg-white border border-gray-200 border-l-4 border-red-500"}`
                            }
                        >
                            <div>
                                <p className={`text-lg ${notification.isRead ? "font-normal" : "font-bold"}`}>
                                    {notification.message}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                            
                            {!notification.isRead && (
                                <button 
                                    onClick={() => markAsRead(notification._id)} 
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
                                >
                                    <CheckCircle className="w-4 h-4" /> Mark as Read
                                </button>
                            )}
                        </div>
                    ))}

                    {visibleCount < notifications.length && (
                        <button 
                            onClick={loadMore} 
                            className="w-full mt-4 py-2 text-center text-blue-600 font-semibold hover:text-blue-800 transition"
                        >
                            Load More
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
