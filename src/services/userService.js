import UserModel from "./../models/userModel";
import bcrypt from "bcryptjs";


const saltRound = 7;

let updateUser = (id, item) => {
    return UserModel.updateUser(id, item);
}

//update password to db
// id: userId
//item: data update
let updatePassword = (id, data) => {
    return new Promise(async(resolve, reject) => {
        let currentUser = await UserModel.findUserByIdForSessionToUse(id);

        if (!currentUser){
            return reject("Không tìm thấy người dùng");
        }

        let checkCurrentPassword = currentUser.comparePassword(data.currentPassword);
        if (!checkCurrentPassword){
            return reject("Mật khẩu hiện tại không chính xác");
        }

        let salt = bcrypt.genSaltSync(saltRound);
        await UserModel.updatePassword(id, bcrypt.hashSync(data.newPassword, salt));
        resolve(true);
    });
}
module.exports = {
    updateUser: updateUser,
    updatePassword: updatePassword
}