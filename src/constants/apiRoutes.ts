export const API_ROUTES = {

  //login api
  LOGIN: "/api/users/login",
  LOGOUT: "/api/users/logout",


  // post api
  ANNOUNCEMENTS: "/api/announcement/list",
  ANNOUNCEMENT_LIKE: "/api/announcement/like",
  ANNOUNCEMENT_REMOVE_LIKE: "/api/announcement/like/delete",
  UPDATE_ANNOUNCEMENT: "/api/announcement",
  CREATE_ANNOUNCEMENT: "/api/announcement",
  POLL_RESPONSE: "/api/announcement/answer/response",
  BOOKMARK_LIST: "/api/announcement/bookmark",
  SEND_COMMENT: "/api/announcement/comment",

  //other
  ATTENDANCE: "/api/attendance/list",
  ATTENDANCEDETAILS: "/api/attendance/details",
  CREATEATTENDANCE: "/api/attendance/create",
  LEAVE: "/api/leave/list",
  PROFILE: "/api/users/profile",

  //users
  userNamesList: '/api/users/profile',


  //leave
  USER_LEAVE_LIST: "/api/leaves/request/list",
  USER_LEAVE_QUOTA_LIST: "/api/leaves/type/list",
  USER_LEAVE_DETAILS: "/api/leaves/request/details",
  USER_LEAVE_COMMENTS_LIST: "/api/leaves/comments/list",
  CREATE_LEAVE_COMMENT: "/api/leaves/comments",
  UPDATE_LEAVE_COMMENT: "/api/leaves/comments/update",
  DELETE_LEAVE_COMMENT: '/api/leaves/comments',
  CREATE_LEAVE: "/api/leaves/request",
};
