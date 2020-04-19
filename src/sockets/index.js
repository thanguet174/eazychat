import addNewContact from "./contact/addNewContact";
import removeRequestContactSent from "./contact/removeRequestContactSent";
import removeRequestContactReceived from "./contact/removeRequestContactReceived";
import approveRequestContactReceived from "./contact/approveRequestContactReceived";
import removeContact from "./contact/removeContact";
import chatTextEmoji from "./chat/chatTextEmoji";
import chatImage from "./chat/chatImage";
import chatAttachment from "./chat/chatAttachment";
import chatVideo from "./chat/chatVideo";
import userOnlineOffline from "./status/userOnlineOffline";
import newGroupChat from "./group/newGroupChat";

let  initSockets = (io) => {
    addNewContact(io);
    removeRequestContactSent(io);
    removeRequestContactReceived(io);
    approveRequestContactReceived(io);
    removeContact(io);
    chatTextEmoji(io);
    chatImage(io);
    chatAttachment(io);
    // chatVideo(io);
    userOnlineOffline(io);
    //typingOn(io);
    newGroupChat(io);
}

module.exports = initSockets;

