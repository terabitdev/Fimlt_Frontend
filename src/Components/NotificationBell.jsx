


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
  writeBatch,
  getDoc,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

function NotificationBell({ adminCode, userData }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const unsubscribeRefs = useRef([]);
  
  // Track when listeners were established and if it's the initial load
  const listenerStartTime = useRef(null);
  const isInitialLoad = useRef(true);

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
      limit(50)
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

  // Create notification helper function
  const createNotification = async (notificationData) => {
    try {
      console.log('Creating notification:', notificationData);
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        timestamp: serverTimestamp()
      });
      console.log('Notification created successfully');
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Set up listeners for user and project collections
  const setupCollectionListeners = useCallback((adminCode, startTime) => {
    console.log('Setting up collection listeners for adminCode:', adminCode);
    console.log('Start time for filtering:', startTime.toDate());
    
    // Set up listener for users collection
    const usersQuery = query(
      collection(db, 'users'),
      where('adminCode', '==', adminCode),
      orderBy('creationDate', 'desc')
    );
    
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      console.log('=== USERS LISTENER FIRED ===');
      console.log('Users snapshot received, changes:', snapshot.docChanges().length);
      console.log('Is initial load:', isInitialLoad.current);
      
      // Skip processing on initial load
      if (isInitialLoad.current) {
        console.log('Skipping user notifications - initial load');
        return;
      }
      
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const userData = change.doc.data();
          const userId = change.doc.id;
          
          console.log('New user detected:', {
            userId,
            userName: userData.name,
            userEmail: userData.email,
            type: userData.type,
            hasCreationDate: !!userData.creationDate
          });
          
          // Only process if it's a regular user
          if (userData.type === 'User') {
            const notificationData = {
              adminCode: adminCode,
              type: 'registration',
              title: 'New User Registration',
              message: `${userData.name || 'A new user'} (${userData.email}) has registered using your admin code.`,
              metadata: { 
                userName: userData.name, 
                userEmail: userData.email,
                userId: userId,
                changeType: 'added'
              },
              read: false
            };

            console.log('Creating user registration notification');
            await createNotification(notificationData);
          }
        }
      });
    }, (error) => {
      console.error('Error in users listener:', error);
    });
    
    // Set up listener for projects collection
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('creationDate', 'desc'),
      limit(100)
    );
    
    const projectsUnsubscribe = onSnapshot(projectsQuery, async (snapshot) => {
      console.log('=== PROJECTS LISTENER FIRED ===');
      console.log('Projects snapshot received, total docs:', snapshot.docs.length);
      console.log('Projects snapshot changes:', snapshot.docChanges().length);
      console.log('Is initial load:', isInitialLoad.current);
      
      // Skip processing on initial load
      if (isInitialLoad.current) {
        console.log('Skipping project notifications - initial load');
        return;
      }

      for (const change of snapshot.docChanges()) {
        console.log('Processing project change:', change.type);
        
        if (change.type === 'added') {
          const projectData = change.doc.data();
          const projectId = change.doc.id;
          
          console.log('New project detected:', {
            projectId,
            projectName: projectData.name,
            creatorID: projectData.creatorID,
            hasCreatorID: !!projectData.creatorID
          });
          
          // Skip if no creatorID
          if (!projectData.creatorID) {
            console.log('No creatorID found - skipping project');
            continue;
          }
          
          // Check if the creator belongs to our adminCode
          try {
            console.log('Checking if creator belongs to adminCode:', adminCode);
            const creatorDoc = await getDoc(doc(db, 'users', projectData.creatorID));
            
            if (!creatorDoc.exists()) {
              console.log('Creator not found in users collection - skipping');
              continue;
            }
            
            const creatorData = creatorDoc.data();
            console.log('Creator data:', {
              creatorId: projectData.creatorID,
              creatorName: creatorData.name,
              creatorAdminCode: creatorData.adminCode,
              targetAdminCode: adminCode
            });
            
            // Check if creator belongs to our adminCode
            if (creatorData.adminCode !== adminCode) {
              console.log('Creator does not belong to our adminCode - skipping');
              continue;
            }
            
            console.log('Creator belongs to our adminCode - creating notification');
            
            const notificationData = {
              adminCode: adminCode,
              type: 'project_added',
              title: 'New Project Added',
              message: `${creatorData.name || 'A user'} has added a new project: ${projectData.name || 'Untitled Project'}`,
              metadata: { 
                projectName: projectData.name, 
                creatorID: projectData.creatorID,
                creatorName: creatorData.name,
                projectId: projectId
              },
              read: false
            };

            console.log('Creating project notification:', notificationData);
            await createNotification(notificationData);
            console.log('Project notification created successfully!');
            
          } catch (error) {
            console.error('Error processing project notification:', error);
          }
        }
      }
    }, (error) => {
      console.error('Error in projects listener:', error);
    });
    
    return [usersUnsubscribe, projectsUnsubscribe];
  }, []);

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
      
      // Reset initial load flag
      isInitialLoad.current = true;
      
      // Set the listener start time
      listenerStartTime.current = Timestamp.now();
      
      // Set up notification listeners first
      const notificationUnsubscribe = setupNotificationListeners(adminCode);
      unsubscribeRefs.current.push(notificationUnsubscribe);
      
      // Set up collection listeners
      const collectionUnsubscribes = setupCollectionListeners(adminCode, listenerStartTime.current);
      unsubscribeRefs.current.push(...collectionUnsubscribes);
      
      // After a short delay, mark as no longer initial load
      // This allows the initial snapshot to complete without triggering notifications
      const timer = setTimeout(() => {
        console.log('Marking as no longer initial load - new changes will trigger notifications');
        isInitialLoad.current = false;
      }, 2000); // 2 second delay
      
      return () => {
        clearTimeout(timer);
        unsubscribeRefs.current.forEach(unsubscribe => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
      };
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

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });
      await batch.commit();
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
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
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button 
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 border border-red-300 rounded"
                  onClick={clearAllNotifications}
                >
                  Clear All
                </button>
              )}
              {unreadCount > 0 && (
                <button 
                  className="text-sm text-blue-500 hover:text-blue-700"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
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
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;