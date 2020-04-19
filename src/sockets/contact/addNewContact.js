import {pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray} from "./../../helper/socketHelper";
/** 
 * @param  io from socket.io library
 */

let addNewContact = (io) => {
    let clients = {};
    io.on("connection", (socket) => {
        let currentUserId = socket.request.user._id;
        
        // push socketid in array
        clients = pushSocketIdToArray(clients, currentUserId, socket.id);

        socket.on("add-new-contact", (data) => {

            let currentUser = {
                id: socket.request.user._id,
                username: socket.request.user.username,
                avatar: socket.request.user.avatar,
                address: socket.request.user.address
            };
            if (clients[data.contactId]){
                emitNotifyToArray(clients, data.contactId, io, "response-add-new-contact", currentUser);
            }
        });

        //xóa socket id khi thoát
        socket.on("disconnect", () => {
            clients = removeSocketIdFromArray(clients, currentUserId, socket);
        });
    });
}

module.exports = addNewContact;