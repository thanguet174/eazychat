import {check} from "express-validator/check";
import {transValidation} from "./../lang/vi"

let updateInfo = [

    check("gender", transValidation.update_gender)
      .optional()
      .isIn(["male","female"]),

    check("address", transValidation.update_address)
      .optional()
      .isLength({min: 3, max: 50}),

    check("phone", transValidation.update_phone)
      .optional()
      .isLength({min: 10, max: 10})
  ];

let updatePassword = [
  
  check("confirm_new_password", "Nhập lại mật khẩu không khớp")
    .custom((value,req) => value === req.body.newPassword)
];
  module.exports = {
      updateInfo: updateInfo,
      updatePassword: updatePassword
  }