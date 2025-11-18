export default function NotificationsPage() {
  const notifications = [
    {
      id: "1",
      type: "like",
      user: { name: "Sarah Designer", username: "sarahdesign" },
      content: "liked your post",
      tweet: "Just shipped a new feature using Next.js 14! The app directory is a game changer...",
      time: "2h",
      read: false
    },
    {
      id: "2", 
      type: "retweet",
      user: { name: "Tech News", username: "technews" },
      content: "retweeted your post",
      tweet: "Building a startup is like solving a puzzle where the pieces keep changing...",
      time: "4h",
      read: false
    },
    {
      id: "3",
      type: "follow",
      user: { name: "React Developer", username: "reactdev" },
      content: "started following you",
      time: "1d",
      read: true
    },
    {
      id: "4",
      type: "reply",
      user: { name: "John Developer", username: "johndev" },
      content: "replied to your post",
      tweet: "Great insight! I've been using similar patterns in my projects...",
      time: "2d",
      read: true
    },
    {
      id: "5",
      type: "mention",
      user: { name: "Web Dev Tips", username: "webdevtips" },
      content: "mentioned you in a post",
      tweet: "Thanks @username for the amazing tutorial on React hooks!",
      time: "3d",
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>
        );
      case "retweet":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
        );
      case "follow":
        return (
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        );
      case "reply":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
        );
      case "mention":
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V9m0 4.5v4.5m0-4.5L8.25 15l1.35-1.5" />
            </svg>
          </div>
        );
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-black">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${
              !notification.read ? 'bg-pink-50/30' : ''
            }`}
          >
            <div className="flex space-x-3">
              {/* Notification Icon */}
              {getNotificationIcon(notification.type)}
              
              {/* User Avatar */}
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-semibold hover:underline cursor-pointer">
                        {notification.user.name}
                      </span>
                      <span className="text-gray-500 ml-1">@{notification.user.username}</span>
                      <span className="text-gray-700 ml-1">{notification.content}</span>
                    </p>
                    
                    {notification.tweet && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border-l-2 border-pink-500">
                        <p className="text-gray-700 text-sm">{notification.tweet}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 text-sm">{notification.time}</span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V9m0 4.5v4.5m0-4.5L8.25 15l1.35-1.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Nothing to see here — yet</h2>
          <p className="text-gray-500 max-w-sm">
            {"When someone likes, retweets, or follows you, you'll see it here."}
          </p>
        </div>
      )}
    </>
  );
}