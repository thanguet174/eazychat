
export const transErrors = {
  account_in_use: "Email này đã được sử dụng",
  account_not_active: "Tài khoản chưa được kích hoạt, vui lòng xác nhận lại email",
  login_failed: "Sai tài khoản hoặc mật khẩu",
  server_error: "Lỗi Server",
  avatar_type: "Kiểu file không hợp lệ",
  avatar_size: "Dung lượng tối đa cho phép là 1MB",
  account_undefined: "Tài khoản không tồn tại",
  user_current_password_falied: "Mật khẩu hiện tại không chính xác"
};

export const transSuccess = {
  userCreated: (userEmail) =>{
      return "Tài khoản <strong> "+ userEmail + "</strong> đã được tạo vui lòng đăng nhập";
  },

  loginSuccess: (username) => {
    return "Đăng nhập thành công với tài khoản " + username;
  },

  logoutSuccess: "Đăng xuất thành công, mời đăng nhập lại",

  avatar_update: "Cập nhật thông tin người dùng thành công",
  user_info_update: "Cập nhật thông tin người dùng thành công",
  user_password_updated: "Cập nhật mật khẩu thành công"
};


export const transValidation = {
  update_username: "Tên người dùng tối đa 18 kí tự",
  update_gender: "Oops!",
  update_address: "Địa chỉ giới hạn trong 30 kí tự",
  update_phone: "Số điện thoại không hợp lệ, vui lòng kiểm tra lại"
}