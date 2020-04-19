import userModel from "./../models/userModel";
import bcrypt from "bcryptjs";
import uuidv4 from "uuid/v4";
import {transErrors,transSuccess} from "./../lang/vi";
let saltRounds = 7;

let register = (email, username, gender, password) => {
  return new Promise(async (resolve, reject) =>{
    let userByEmail = await userModel.findByEmail(email);
    if (userByEmail){
      if (!userByEmail.local.isActive){
        return reject(transErrors.account_not_active);
      }
      return reject(transErrors.account_in_use);
    }
    let salt = bcrypt.genSaltSync(saltRounds);

    let userItem = {
      username: username,
      gender: gender,
      local: {
        email: email,
        password: bcrypt.hashSync(password, salt),
        verifyToken: uuidv4()
      }
    };
      let user = await userModel.createNew(userItem);
      resolve(transSuccess.userCreated(user.local.email));
  });
};

module.exports = {
  register : register
};
