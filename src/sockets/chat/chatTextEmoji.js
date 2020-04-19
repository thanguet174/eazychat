import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} from "./../../helper/socketHelper";

let chatTextEmoji = (io) => {
    let clients = {};
    io.on("connection", (socket) => {
        let currentUserId = socket.request.user._id;

        // push socketid in array
        clients = pushSocketIdToArray(clients, currentUserId, socket.id);
        socket.request.user.chatGroupIds.forEach(group => {
            clients = pushSocketIdToArray(clients, group._id, socket.id);
        });
        // khi có cuộc trò chuyện mới
        socket.on("new-group-created", (data) => {
            clients = pushSocketIdToArray(clients, data.groupChat._id, socket.id);
        });

        socket.on("member-received-group-chat", (data) => {
            clients = pushSocketIdToArray(clients, data.groupChatId, socket.id);
        });
        //chat 
        socket.on("chat-text-emoji", (data) => {
            if (data.groupId){
                let response = {
                    currentGroupId: data.groupId,
                    currentUserId: currentUserId,
                    message: data.message
                }
                if (clients[data.groupId]){
                    emitNotifyToArray(clients, data.groupId, io, "response-chat-text-emoji", response);
                }
            }
            if (data.contactId){
                let response = {
                    currentUserId: currentUserId,
                    message: data.message
                }
                if (clients[data.contactId]){
                    emitNotifyToArray(clients, data.contactId, io, "response-chat-text-emoji", response);
                }
            }
        });

        //xóa socket id khi thoát
        socket.on("disconnect", () => {
            clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
            socket.request.user.chatGroupIds.forEach(group => {
                clients = removeSocketIdFromArray(clients, group._id, socket);
            });
        });
    });
}

module.exports = chatTextEmoji;