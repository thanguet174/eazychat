import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} from "./../../helper/socketHelper";
/** 
 * @param  io from socket.io library
 */

function removeRequestContactSent(io) {
    let clients = {};
    io.on("connection", (socket) => {
        let currentUserId = socket.request.user._id;
        // push socketid in array
        clients = pushSocketIdToArray(clients, currentUserId, socket.id);

        socket.on("remove-request-contact-sent", (data) => {
            let currentUser = {
                id: socket.request.user._id,
            };
            if (clients[data.contactId]){
                emitNotifyToArray(clients, data.contactId, io, "response-remove-request-contact-sent", currentUser);
            }
        });

        //xóa socket id khi thoát
        socket.on("disconnect", () => {
            clients = removeSocketIdFromArray(clients, currentUserId, socket);
        });
    });
}

module.exports = removeRequestContactSent;