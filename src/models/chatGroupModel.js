import mongoose from "mongoose";

let Schema = mongoose.Schema;

let chatGroupSchema = new Schema({
  name: String,
  userAmount: {type: Number, min: 3, max: 200},
  messageAmount: {type: Number, default: 0},
  userId: String,
  members:[{ userId: String}],
  createAt: {type: Number, default: Date.now},
  updateAt: {type: Number, default: null},
  deleteAt: {type: Number, default: null}

});

chatGroupSchema.statics = {
  createNew(item){
    return this.create(item);
  },
  getChatGroups(userId, limit){
    return this.find({
      "members": {$elemMatch: {"userId": userId}}
    }).sort({"updateAt": -1}).limit(limit).exec();
  },

  getChatGroupsById(id){
    return this.findById(id).exec();
  },

  updateWhenHasNewMessage(id, newMessageAmount){
    return this.findByIdAndUpdate( id, {
      "messageAmount": newMessageAmount,
      "updateAt": Date.now()
    }).exec();
  },

  getChatGroupIdsByUser(userId){
    return this.find({
      "members": {$elemMatch: {"userId": userId}}
    }, {_id: 1}).exec();
  },

  readMoreChatGroup(userId, skip, limit){
    return this.find({
      "members": {$elemMatch: {"userId": userId}}
    }).sort({"updateAt": -1}).skip(skip).limit(limit).exec();
  }
}
module.exports = mongoose.model("chat-group", chatGroupSchema);
