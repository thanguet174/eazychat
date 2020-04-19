import ContactModel from "./../models/contactModel";
import UserModel from "./../models/userModel";
import ChatGroupModel from "./../models/chatGroupModel";
import MessageModel from "./../models/messageModel";
import fsExtra from "fs-extra";
import _ from "lodash";

const LIMIT_CONVERSATION_TAKEN = 30;
const LIMIT_MESSAGES_TAKEN = 10000;

let getAllConversationItems = (currentUserId) => {
    return new Promise( async(resolve, reject) => {
        try{
            let contacts = await ContactModel.getContacts(currentUserId, LIMIT_CONVERSATION_TAKEN);
            let userConversationsPromise = contacts.map(async(contact) =>{
                if (contact.contactId == currentUserId){
                    let getUserContact = await UserModel.getNormalUserDataById(contact.userId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }else{
                    let getUserContact = await UserModel.getNormalUserDataById(contact.contactId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }
            });
            let userConversations = await Promise.all(userConversationsPromise);
            let groupConversations = await ChatGroupModel.getChatGroups(currentUserId,LIMIT_CONVERSATION_TAKEN);
            let allConversations = userConversations.concat(groupConversations);
            
            allConversations = _.sortBy(allConversations, (item) => {
                return -item.updateAt;
            });

            // get message to apply screen chat
            let allConversationWithMessagesPromise = allConversations.map(async (conversation) => {
                conversation = conversation.toObject();
                if (conversation.members){
                    let getMessages = await MessageModel.model.getMessagesInGroup( conversation._id, LIMIT_MESSAGES_TAKEN);

                    conversation.messages = _.reverse(getMessages);
                }else{
                    let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGES_TAKEN);

                    conversation.messages = _.reverse(getMessages);
                }

                return conversation;
            });
            let allConversationWithMessages = await Promise.all
            (allConversationWithMessagesPromise);
            //sort by updateAt dsc
            
            allConversationWithMessages = _.sortBy(allConversationWithMessages, (item) => {
                return -item.updateAt;
            });

            resolve({
                userConversations: userConversations,
                groupConversations: groupConversations,
                allConversations: allConversations,
                allConversationWithMessages: allConversationWithMessages
            });
        }catch(error){
            reject(error);
        }
    });
};

/**
 * 
 * @param {object} sender current user
 * @param {string} receiverId id user or group
 * @param {string} messageVal 
 * @param {boolean} isChatGroup 
 */
let addNewTextEmoji = (sender, receiverId, messageVal, isChatGroup) => {
    return new Promise(async(resolve, reject) => {
        try{
            if (isChatGroup){
                let getChatGroupsReceiver = await ChatGroupModel.getChatGroupsById(receiverId);
                if (!getChatGroupsReceiver){
                    return reject("Cuộc trò chuyện không tồn tại");
                }
                let receiver  = {
                    id: getChatGroupsReceiver._id,
                    name: getChatGroupsReceiver.name,
                    avatar: "group-avatar-trungquandev.com"
                }
                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: MessageModel.conversationTypes.GROUP,
                    messageType: MessageModel.messageTypes.TEXT,
                    sender: sender,
                    receiver: receiver,
                    text: messageVal,
                    createAt: Date.now()
                }
                let newMessage = await MessageModel.model.createNew(newMessageItem);
                //update group chat
                await ChatGroupModel.updateWhenHasNewMessage(getChatGroupsReceiver._id, getChatGroupsReceiver.messageAmount + 1);

                resolve(newMessage);
            }else{
                let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);
                if (!getUserReceiver){
                    return reject("Cuộc trò chuyện không tồn tại");
                }
                let receiver  = {
                    id: getUserReceiver._id,
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar
                }
                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: MessageModel.conversationTypes.PERSONAL,
                    messageType: MessageModel.messageTypes.TEXT,
                    sender: sender,
                    receiver: receiver,
                    text: messageVal,
                    createAt: Date.now()
                }
                //create new message
                let newMessage = await MessageModel.model.createNew(newMessageItem);

                //update contact
                await ContactModel.updateWhenHasNewMessage(sender.id,getUserReceiver._id);
                resolve(newMessage);
            }
        }catch(error){
            reject(error);
        }
    });
}

let addNewImage = (sender, receiverId, messageVal, isChatGroup) => {
    return new Promise(async(resolve, reject) => {
        try{
            if (isChatGroup){
                let getChatGroupsReceiver = await ChatGroupModel.getChatGroupsById(receiverId);
                if (!getChatGroupsReceiver){
                    return reject("Cuộc trò chuyện không tồn tại");
                }
                let receiver  = {
                    id: getChatGroupsReceiver._id,
                    name: getChatGroupsReceiver.name,
                    avatar: "group-avatar-trungquandev.com"
                }

                let imageBuffer = await fsExtra.readFile(messageVal.path);
                let imageContentType = messageVal.mimetype;
                let imageName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: MessageModel.conversationTypes.GROUP,
                    messageType: MessageModel.messageTypes.IMAGE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: imageBuffer, contentType: imageContentType, fileName:imageName},
                    createAt: Date.now()
                }
                let newMessage = await MessageModel.model.createNew(newMessageItem);
                //update group chat
                await ChatGroupModel.updateWhenHasNewMessage(getChatGroupsReceiver._id, getChatGroupsReceiver.messageAmount + 1);

                resolve(newMessage);
            }else{
                let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);
                if (!getUserReceiver){
                    return reject("Cuộc trò chuyện không tồn tại");
                }
                let receiver  = {
                    id: getUserReceiver._id,
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar
                }
                let imageBuffer = await fsExtra.readFile(messageVal.path);
                let imageContentType = messageVal.mimetype;
                let imageName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: MessageModel.conversationTypes.PERSONAL,
                    messageType: MessageModel.messageTypes.IMAGE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: imageBuffer, contentType: imageContentType, fileName:imageName},
                    createAt: Date.now()
                }
                //create new message
                let newMessage = await MessageModel.model.createNew(newMessageItem);

                //update contact
                await ContactModel.updateWhenHasNewMessage(sender.id,getUserReceiver._id);
                resolve(newMessage);
            }
        }catch(error){
            reject(error);
        }
    });
}

let addNewAttactment = (sender, receiverId, messageVal, isChatGroup) => {
    return new Promise(async(resolve, reject) => {
        try{
            if (isChatGroup){
                let getChatGroupsReceiver = await ChatGroupModel.getChatGroupsById(receiverId);
                if (!getChatGroupsReceiver){
                    return reject("Cuộc trò chuyện không tồn tại");
                }
                let receiver  = {
                    id: getChatGroupsReceiver._id,
                    name: getChatGroupsReceiver.name,
                    avatar: "group-avatar-trungquandev.com"
                }

                let attachmentBuffer = await fsExtra.readFile(messageVal.path);
                let attachmentContentType = messageVal.mimetype;
                let attachmentName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: MessageModel.conversationTypes.GROUP,
                    messageType: MessageModel.messageTypes.FILE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: attachmentBuffer, contentType: attachmentContentType, fileName:attachmentName},
                    createAt: Date.now()
                }
                let newMessage = await MessageModel.model.createNew(newMessageItem);
                //update group chat
                await ChatGroupModel.updateWhenHasNewMessage(getChatGroupsReceiver._id, getChatGroupsReceiver.messageAmount + 1);

                resolve(newMessage);
            }else{
                let getUserReceiver = await UserModel.getNormalUserDataById(receiverId);
                if (!getUserReceiver){
                    return reject("Cuộc trò chuyện không tồn tại");
                }
                let receiver  = {
                    id: getUserReceiver._id,
                    name: getUserReceiver.username,
                    avatar: getUserReceiver.avatar
                }
                let attachmentBuffer = await fsExtra.readFile(messageVal.path);
                let attachmentContentType = messageVal.mimetype;
                let attachmentName = messageVal.originalname;

                let newMessageItem = {
                    senderId: sender.id,
                    receiverId: receiver.id,
                    conversationType: MessageModel.conversationTypes.PERSONAL,
                    messageType: MessageModel.messageTypes.FILE,
                    sender: sender,
                    receiver: receiver,
                    file: {data: attachmentBuffer, contentType: attachmentContentType, fileName:attachmentName},
                    createAt: Date.now()
                }
                //create new message
                let newMessage = await MessageModel.model.createNew(newMessageItem);

                //update contact
                await ContactModel.updateWhenHasNewMessage(sender.id,getUserReceiver._id);
                resolve(newMessage);
            }
        }catch(error){
            reject(error);
        }
    });
}

let readMoreAllChat = (currentUserId, skipPersonal, targetId, chatInGroup) => {
    return new Promise( async(resolve, reject) => {
        try{
            let contacts = await ContactModel.readMoreContacts(currentUserId, skipPersonal, LIMIT_CONVERSATION_TAKEN);

            let userConversationsPromise = contacts.map(async(contact) =>{
                if (contact.contactId == currentUserId){
                    let getUserContact = await UserModel.getNormalUserDataById(contact.userId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }else{
                    let getUserContact = await UserModel.getNormalUserDataById(contact.contactId);
                    getUserContact.updateAt = contact.updateAt;
                    return getUserContact;
                }
            });

            let userConversations = await Promise.all(userConversationsPromise);
            
            let groupConversations = await ChatGroupModel.readMoreChatGroup(currentUserId,skipGroup, LIMIT_CONVERSATION_TAKEN);
            let allConversations = userConversations.concat(groupConversations);
            
            allConversations = _.sortBy(allConversations, (item) => {
                return -item.updateAt;
            });

            // get message to apply screen chat
            let allConversationWithMessagesPromise = allConversations.map(async (conversation) => {
                conversation = conversation.toObject();
                if (conversation.members){
                    let getMessages = await MessageModel.model.getMessagesInGroup( conversation._id, LIMIT_MESSAGES_TAKEN);

                    conversation.messages = _.reverse(getMessages);
                }else{
                    let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, conversation._id, LIMIT_MESSAGES_TAKEN);

                    conversation.messages = _.reverse(getMessages);
                }

                return conversation;
            });
            let allConversationWithMessages = await Promise.all
            (allConversationWithMessagesPromise);
            //sort by updateAt dsc
            
            allConversationWithMessages = _.sortBy(allConversationWithMessages, (item) => {
                return -item.updateAt;
            });

            resolve(allConversationWithMessages);
        }catch(error){
            reject(error);
        }
    });
};

let readMore = (currentUserId, skipMessage, targetId, chatInGroup) => {
    return new Promise( async(resolve, reject) => {
        try{
            if (chatInGroup){
                let getMessages = await MessageModel.model.readMoreMessagesInGroup(targetId,skipMessage, LIMIT_MESSAGES_TAKEN);

                getMessages = _.reverse(getMessages);

                resolve(getMessages);
            }else{
                let getMessages = await MessageModel.model.readMoreMessagesInPersonal(currentUserId, targetId,skipMessage, LIMIT_MESSAGES_TAKEN);

                getMessages = _.reverse(getMessages);

                resolve(getMessages);
            }
        }catch(error){
            reject(error);
        }
    });
};
module.exports = {
    getAllConversationItems: getAllConversationItems,
    addNewTextEmoji: addNewTextEmoji,
    addNewImage: addNewImage,
    addNewAttactment: addNewAttactment,
    readMoreAllChat: readMoreAllChat,
    readMore: readMore
};