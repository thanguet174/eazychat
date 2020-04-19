// import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} from "./../../helper/socketHelper";

// let chatVideo = (io) => {
//     let clients = {};
//     io.on("connection", (socket) => {
//         let currentUserId = socket.request.user._id;

//         // push socketid in array
//         clients = pushSocketIdToArray(clients, currentUserId, socket.id);
//         socket.request.user.chatGroupIds.forEach(group => {
//             clients = pushSocketIdToArray(clients, group._id, socket.id);
//         });

//         // khi có cuộc trò chuyện mới
//         socket.on("new-group-created", (data) => {
//             clients = pushSocketIdToArray(clients, data.groupChat._id, socket.id);
//         });

//         socket.on("member-received-group-chat", (data) => {
//             clients = pushSocketIdToArray(clients, data.groupChatId, socket.id);
//         });
        
//         socket.on("caller-check-listener-online-or-not", (data) => {
//             if (clients[data.listenerId]){
//                 let response = {
//                     caller: socket.request.user._id,
//                     listenerId: data.listenerId,
//                     callerName: data.callerName
//                 };

//                 emitNotifyToArray(clients, data.listenerId, io, "server-request-peerid-of-listener",response);

//             }else{
//                 socket.emit("server-send-listener-is-offline");
//             }
//         });

//         socket.on("listener-emit-peer-id-to-server", (data) => {
//             let response = {
//                 caller: data.callerId,
//                 listenerId: data.listenerId,
//                 callerName: data.callerName,
//                 listenerName: data.listenerName,
//                 listenerPeerId: data.listenerPeerId
//             }
//             if (clients[data.callerId]){
//                 emitNotifyToArray(clients, data.callerId, io, "server-send-peerid-of-listener-to-caller",response);
//             }
//         });
//         //xóa socket id khi thoát
//     //     socket.on("disconnect", () => {
//     //         clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
//     //         socket.request.user.chatGroupIds.forEach(group => {
//     //             clients = removeSocketIdFromArray(clients, group._id, socket);
//     //         });
//     //     });

//     //     socket.on("listener-emit-peer-id-to-server", (data) => {
//     //         let response = {
//     //             caller: data.callerId,
//     //             listenerId: data.listenerId,
//     //             callerName: data.callerName,
//     //             listenerName: data.listenerName,
//     //             listenerPeerId: data.listenerPeerId
//     //         }
//     //         if (clients[data.callerId]){
//     //             emitNotifyToArray(clients, data.callerId, io, "server-send-peerid-of-listener-to-caller",response);
//     //         }
//     //     });

//     //     socket.on("caller-request-call-to-server", (data) => {
//     //         let response = {
//     //             caller: data.callerId,
//     //             listenerId: data.listenerId,
//     //             callerName: data.callerName,
//     //             listenerName: data.listenerName,
//     //             listenerPeerId: data.listenerPeerId
//     //         }
//     //         if (clients[data.listenerId]){
//     //             emitNotifyToArray(clients, data.listenerId, io, "server-send-request-call-to-listener",response);
//     //         }
//     //     });

//     //     socket.on("caller-cancel-request-call-to-server", (data) => {
//     //         let response = {
//     //             caller: data.callerId,
//     //             listenerId: data.listenerId,
//     //             callerName: data.callerName,
//     //             listenerName: data.listenerName,
//     //             listenerPeerId: data.listenerPeerId
//     //         }
//     //         if (clients[data.listenerId]){
//     //             emitNotifyToArray(clients, data.listenerId, io, "server-send-cancel-request-call-to-listener",response);
//     //         }
//     //     });

//     //     //xóa socket id khi thoát
//     //     socket.on("disconnect", () => {
//     //         clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
//     //         socket.request.user.chatGroupIds.forEach(group => {
//     //             clients = removeSocketIdFromArray(clients, group._id, socket);
//     //         });
//     //     });
//     });
// }

// module.exports = chatVideo;