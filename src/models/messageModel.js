import mongoose from "mongoose";

let Schema = mongoose.Schema;

let messageSchema = new Schema({
  senderId: String,
  receiverId: String,
  conversationType: String,
  messageType: String,
  sender: {
    id: String,
    name: String,
    avatar: String
  },
  receiver: {
    id: String,
    name: String,
    avatar: String
  },
  text: String,
  file: {data: Buffer, contentType: String, fileName: String},
  createAt: {type: Number, default: Date.now},
  updateAt: {type: Number, default: null},
  deleteAt: {type: Number, default: null}

});
messageSchema.statics = {
  getMessagesInPersonal(senderId, receiverId, limit){
    return this.find({
      $or: [
        {$and: [
          {"senderId": senderId},
          {"receiverId": receiverId}
        ]},
        {$and: [
          {"receiverId": senderId},
          {"senderId": receiverId}
        ]}
      ]
    }).sort({"createAt": -1}).limit(limit).exec();
  },
/**
 * 
 * @param {string} receiverId //id group chat nguoi nhan
 * @param {number} limit 
 */
  getMessagesInGroup(receiverId, limit){
    return this.find({"receiverId": receiverId}).sort({"createAt": -1}).limit(limit).exec();
  },

  createNew(item){
    return this.create(item);
  },

  readMoreMessagesInPersonal(senderId, receiverId,skip,  limit){
    return this.find({
      $or: [
        {$and: [
          {"senderId": senderId},
          {"receiverId": receiverId}
        ]},
        {$and: [
          {"receiverId": senderId},
          {"senderId": receiverId}
        ]}
      ]
    }).sort({"createAt": -1}).skip(skip).limit(limit).exec();
  },
  readMoreMessagesInGroup(receiverId, skip, limit){
    return this.find({"receiverId": receiverId}).sort({"createAt": -1}).skip(skip).limit(limit).exec();
  }
}
const MESSAGE_CONVERSATION_TYPES = {
  PERSONAL: "personal",
  GROUP: "group"
};
const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file"
};

module.exports ={
  model: mongoose.model("message", messageSchema),
  conversationTypes: MESSAGE_CONVERSATION_TYPES,
  messageTypes: MESSAGE_TYPES
}; 
