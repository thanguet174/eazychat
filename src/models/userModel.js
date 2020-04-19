import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { param } from "express-validator/check";
let Schema = mongoose.Schema;

let userSchema = new Schema({
  username: String,
  gender: {type: String, default: "male"},
  phone: {type:String, default: null},
  address: {type: String, default: "Việt Nam"},
  avatar: {type: String, default:"avatar-default.jpg"},
  role: {type: String, default: "user"},
  local: {
    email: {type: String, trim: true},
    password: String,
    isActive: {type: Boolean, default: true},
    verifyToken: String
  },
  createAt: {type: Number, default: Date.now},
  updateAt: {type: Number, default: null}

});

userSchema.statics = {
  createNew(item){
    return this.create(item);
  },
  findByEmail(email){
    return this.findOne({"local.email": email}).exec();
  },
  findUserByIdToUpdatePassword(id){
    return this.findById(id).exec();
  },
  findUserByIdForSessionToUse(id){
    return this.findById(id, {"local.password": 0}).exec();
  },
  updateUser(id, item){
    return this.findByIdAndUpdate(id, item).exec();
  },
  updatePassword(id, hashedPassword){
    return this.findByIdAndUpdate(id,{"local.password": hashedPassword}).exec();
  },
  findAllForAddContact(deprecatedUserIds, keyword){
    return this.find({
      $and: [
        {"_id": {$nin: deprecatedUserIds}},
        {$or: [
          {"username": {"$regex": new RegExp(keyword,"i")}},
          {"email": {"$regex": new RegExp(keyword,"i")}}
        ]}
      ]
    }, {_id: 1, username: 1, address: 1 , avatar: 1}).exec();
  },

  getNormalUserDataById(id){
    return this.findById(id, {_id: 1, username: 1, address: 1 , avatar: 1}).exec();
  },

  fillAllToAddGroupChat(friendIds, keyword){
    return this.find({
      $and: [
        {"_id": {$in: friendIds}},
        {"username": {"$regex": new RegExp(keyword,"i")}}
      ]
    }, {_id: 1, username: 1, address: 1 , avatar: 1}).exec();
  },
};


userSchema.methods = {
  comparePassword(password){
    return bcrypt.compareSync(password, this.local.password);
  }
};
module.exports = mongoose.model("user", userSchema);
