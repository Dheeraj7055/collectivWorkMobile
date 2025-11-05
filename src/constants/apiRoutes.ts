export const API_ROUTES = {
  //login api
  LOGIN: '/api/users/login',
  LOGOUT: '/api/users/logout',

  // post api
  ANNOUNCEMENTS: '/api/announcement/list',
  ANNOUNCEMENT_LIKE: '/api/announcement/like',
  ANNOUNCEMENT_REMOVE_LIKE: '/api/announcement/like/delete',
  UPDATE_ANNOUNCEMENT: '/api/announcement',
  CREATE_ANNOUNCEMENT: '/api/announcement',
  POLL_RESPONSE: '/api/announcement/answer/response',
  BOOKMARK_LIST: '/api/announcement/bookmark',
  SEND_COMMENT: '/api/announcement/comment',
  UPDATE_POST_COMMENT: '/api/announcement/comment/update',
  DELETE_POST_COMMENT: '/api/announcement/comment/delete',
  COMMENTS_LIKE: '/api/announcement/comment/like',
  REMOVE_BOOKMARK_POST: '/api/announcement/bookmark/remove',
  BOOKMARK_POST: '/api/announcement/bookmark',
  REPOST_ANNOUNCEMENT: '/api/announcement/repost',
  ANNOUNCEMENT_DELETE: '/api/announcement/delete',
  PIN_USER: '/api/announcement/pin/user',
  REMOVE_PIN_USER: '/api/announcement/remove/pin/user',
  PIN_USER_LIST: '/api/announcement/pin/user',
  REPORT_ANNOUNCEMENT: '/api/announcement/report',


  //other
  LEAVE: '/api/leave/list',
  PROFILE: '/api/users/profile',

  //users
  userNamesList: '/api/users/profile',

  //attendance
  ATTENDANCE: '/api/attendance/list',
  ATTENDANCEDETAILS: '/api/attendance/details',
  PUNCHIN: '/api/attendance/punchIn',
  PUNCHOUT: '/api/attendance/punchOut',
  ATTENDANCERANGE: "/api/attendance/range",
  USER_ATTENDANCE_DETAIL: '/api/attendance/user/detail',
  HOLIDAYLIST: '/api/admin/holiday/names',
  RAISE_ATTENDANCE_REQUEST: '/api/attendance/request',

  //leave
  USER_LEAVE_LIST: '/api/leaves/request/list',
  USER_LEAVE_QUOTA_LIST: '/api/leaves/type/list',
  USER_LEAVE_DETAILS: '/api/leaves/request/details',
  USER_LEAVE_COMMENTS_LIST: '/api/leaves/comments/list',
  CREATE_LEAVE_COMMENT: '/api/leaves/comments',
  UPDATE_LEAVE_COMMENT: '/api/leaves/comments/update',
  DELETE_LEAVE_COMMENT: '/api/leaves/comments',
  CREATE_LEAVE: '/api/leaves/request',
  WITHDRAW_LEAVE: '/api/leaves/withdraw/status',
  UPDATE_LEAVE: '/api/leaves/request',

  //profile
  UPLOAD_COVER_IMAGE: '/api/users/cover/image/upload',
  REMOVE_COVER_IMAGE: '/api/users/cover/image/remove',
  UPLOAD_PROFILE_IMAGE: '/api/users/image/upload',
  REMOVE_PROFILE_IMAGE: '/api/users/image/remove',

  //notification
  USER_NOTIFICATION_LIST: '/api/users/notification/list',
  USER_NOTIFICATION_COUNT: '/api/users/notification/count',
  USER_NOTIFICATION_READ: '/api/users/notification/read',
  USER_NOTIFICATION_VIEW: '/api/users/notification/view',
};
