import { pushSocketIdToArray, removeSocketIdFromArray } from "./../../helper/socketHelper";

let  userOnlineOffline = (io) => {
    let clients = {};
    io.on("connection", (socket) => {
        // push socketid in array
        clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
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

        socket.on("check-status", () => {
            let listUsersOnline = Object.keys(clients);
            // step 1: 
            socket.emit("server-send-list-users-online", listUsersOnline);
            //step 2
            socket.broadcast.emit("server-send-when-new-user-online", socket.request.user._id);
            //xóa socket id khi thoát
        });
        socket.on("disconnect", () => {
            clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
            socket.request.user.chatGroupIds.forEach(group => {
                clients = removeSocketIdFromArray(clients, group._id, socket);
            });
            //step 3: 
            socket.broadcast.emit("server-send-when-new-user-offline", socket.request.user._id);
        });
    });
}

module.exports = userOnlineOffline;