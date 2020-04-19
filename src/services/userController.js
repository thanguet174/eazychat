import multer from "multer";
import {transErrors, transSuccess} from "./../lang/vi";
import uuidv4 from "uuid/v4";
import {user_Service} from "./index";
import fsExtra from "fs-extra";
import {validationResult} from "express-validator/check";

let storageAvatar = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/users");
    },
    filename: (req, file, callback) => {
        // kiểm tra file ảnh có hợp lệ hay không
        let math = ["image/png", "image/jpg", "image/jpeg"];
        if (math.indexOf(file.mimetype) === -1){
            return callback(transErrors.avatar_type, null);
        }

        // lưu tên file tránh trường hợp bị trùng tên
        let avatarName = Date.now() + uuidv4() + file.originalname;
        callback(null, avatarName);
       }
});

let avatarUploadFile = multer({
    storage: storageAvatar,
}).single("avatar");

// Cập nhập avatar
let updateAvatar = (req, res) => {
    avatarUploadFile(req, res, (error) =>{
        if (error){
            if (error.message){
                return res.status(500).send(transErrors.avatar_size);
            }
            return res.status(500).send(error);
        }else{
            try{
                let updateUserItem = {
                    avatar: req.file.filename,
                    updateAt: Date.now()
                };
                //Cập nhật người dùng
                let userUpdate = user_Service.updateUser(req.user._id, updateUserItem);

                // Xóa người dùng cũ đi
                //fsExtra.remove('src/public/images/users/${userUpdate.avatar}');
                let result = {
                    message: transSuccess.avatar_update,
                    imageSrc: '/images/users/' + req.file.filename
                };
                return res.status(200).send(result);
            }catch(error){
                return res.status(500).send(error);
            }
        }
    });
}

//Cập nhật thông tin
let updateInfo = (req, res) => {
    let errorArr = [];

    let validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()){
      let errors = Object.values(validationErrors.mapped());
        errors.forEach(item => {
          errorArr.push(item.msg);
        });

        return res.status(500).send(errorArr);
    }
    try{
        let updateUserItem = req.body;

        //ghi thông tin người dùng vào db
        let infoUpdate = user_Service.updateUser(req.user._id, updateUserItem);

        let result = {
            message: transSuccess.user_info_update
        };
        return res.status(200).send(result);
    }catch(error){
        return res.status(500).send(error);
    }
}

//Cập nhật password
let updatePassword = async (req, res) => {
    let errorArr = [];
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()){
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item => {
            errorArr.push(item.msg);
    });
    return res.status(500).send(errorArr);
    }   
    try{
        let updateUserItem = req.body;
        await user_Service.updatePassword(req.user._id, updateUserItem);
    
        let result = {
            message: "Cập nhật mật khẩu người dùng thành công"
        };

        return res.satus(200).send(result);

    }catch(error){
        return res.status(500).send(error); 
    }
}
module.exports = {
    updateAvatar: updateAvatar,
    updateInfo: updateInfo,
    updatePassword: updatePassword
}