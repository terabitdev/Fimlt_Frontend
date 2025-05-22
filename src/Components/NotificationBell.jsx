import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  updateDoc, 
  addDoc, 
  where, 
  serverTimestamp, 
  doc,
  writeBatch
} from 'firebase/firestore';

function NotificationBell({ adminCode, userData }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const notificationRef = useRef(null);
  const unsubscribeRefs = useRef([]);

  // Handle clicks outside notification dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set up listeners for notifications
  const setupNotificationListeners = useCallback((adminCode) => {
    console.log('Setting up notification listeners for adminCode:', adminCode);
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('adminCode', '==', adminCode),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Received notifications:', newNotifications.length);
      setNotifications(newNotifications);
      
      // Count unread notifications
      const unread = newNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    }, (error) => {
      console.error('Error in notification listener:', error);
    });

    return unsubscribe;
  }, []);

  // Set up listeners for user and project collections
  const setupCollectionListeners = useCallback((adminCode) => {
    console.log('Setting up collection listeners for adminCode:', adminCode);
    
    // Set up listener for users collection
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      if (!isInitialized) {
        console.log('Skipping initial user data load');
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const userData = change.doc.data();
          const userId = change.doc.id;
          const userAdminCode = userData.adminCode || userData.refralCode;
          
          console.log('User change detected:', {
            type: change.type,
            userId,
            userAdminCode,
            targetAdminCode: adminCode,
            userType: userData.type
          });

          // Only create notification if user matches admin code and is a regular user
          if (userAdminCode === adminCode && userData.type === 'User') {
            try {
              const notificationData = {
                adminCode: adminCode,
                type: 'registration',
                title: 'New User Registration',
                message: change.type === 'modified' 
                  ? `${userData.name || 'A new user'} (${userData.email}) has been assigned to your admin code.`
                  : `${userData.name || 'A new user'} (${userData.email}) has registered using your admin code.`,
                metadata: { 
                  userName: userData.name, 
                  userEmail: userData.email,
                  userId: userId
                },
                read: false,
                timestamp: serverTimestamp()
              };

              console.log('Creating user notification:', notificationData);
              await addDoc(collection(db, 'notifications'), notificationData);
              console.log('User notification created successfully');
            } catch (error) {
              console.error('Error creating user notification:', error);
            }
          }
        }
      });
    }, (error) => {
      console.error('Error in users listener:', error);
    });
    
    // Set up listener for projects collection
    const projectsQuery = query(
      collection(db, 'projects'), 
      where('adminCode', '==', adminCode),
      orderBy('createdAt', 'desc')
    );
    
    const projectsUnsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      if (!isInitialized) {
        console.log('Skipping initial project data load');
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const projectData = change.doc.data();
          
          console.log('New project detected:', {
            projectId: change.doc.id,
            projectName: projectData.name,
            createdBy: projectData.createdBy
          });

          try {
            const notificationData = {
              adminCode: adminCode,
              type: 'project_added',
              title: 'New Project Added',
              message: `${projectData.createdBy || 'A user'} has added a new project: ${projectData.name || 'Untitled Project'}`,
              metadata: { 
                projectName: projectData.name, 
                createdBy: projectData.createdBy,
                projectId: change.doc.id
              },
              read: false,
              timestamp: serverTimestamp()
            };

            console.log('Creating project notification:', notificationData);
            await addDoc(collection(db, 'notifications'), notificationData);
            console.log('Project notification created successfully');
          } catch (error) {
            console.error('Error creating project notification:', error);
          }
        }
      });
    }, (error) => {
      console.error('Error in projects listener:', error);
    });
    
    return [usersUnsubscribe, projectsUnsubscribe];
  }, [isInitialized]);

  // Set up notification listeners when adminCode changes
  useEffect(() => {
    // Clean up previous listeners
    unsubscribeRefs.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    unsubscribeRefs.current = [];

    if (adminCode && adminCode !== 'N/A') {
      console.log('Setting up listeners for adminCode:', adminCode);
      
      // Set up notification listeners
      const notificationUnsubscribe = setupNotificationListeners(adminCode);
      unsubscribeRefs.current.push(notificationUnsubscribe);
      
      // Wait a bit before setting up collection listeners to avoid initial data triggering notifications
      const timer = setTimeout(() => {
        setIsInitialized(true);
        const collectionUnsubscribes = setupCollectionListeners(adminCode);
        unsubscribeRefs.current.push(...collectionUnsubscribes);
      }, 2000); // 2 second delay
      
      return () => {
        clearTimeout(timer);
        unsubscribeRefs.current.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
        setIsInitialized(false);
      };
    } else {
      setIsInitialized(false);
    }
  }, [adminCode, setupNotificationListeners, setupCollectionListeners]);

  // Toggle the notification dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      await batch.commit();
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // difference in seconds
      
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Just now';
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        className="p-2 bg-white rounded-md ml-3 md:ml-0 mr-4 relative"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <Bell size={20} className='text-black' />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm text-blue-500 hover:text-blue-700"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {notification.type === 'registration' && (
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-500">👤</span>
                        </div>
                      )}
                      {notification.type === 'project_added' && (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-500">📁</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;