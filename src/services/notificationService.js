import NotificationModel from "./../models/notificationModel";
import UserModel from "./../models/userModel";

const LIMIT_NUMBER_TAKEN = 10;

function getNotifications(currentUserId){
    return new Promise(async(resolve, reject) => {
        try{
            let notifications = await NotificationModel.model.getByUserIdAndLimit(currentUserId, LIMIT_NUMBER_TAKEN);
            
            let getNotifContents = notifications.map(async(notification) =>{
                let sender = await UserModel.getNormalUserDataById(notification.senderId);
                return NotificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);
            });

            resolve(await Promise.all(getNotifContents));
        }catch(error){
            reject(error);
        }
    });
}

function countNotifUnread(currentUserId){
    return new Promise(async(resolve, reject) => {
        try{
            let notificationsUnread = await NotificationModel.model.countNotifUnread(currentUserId);
            resolve(notificationsUnread);
        }catch(error){
            reject(error);
        }
    });
}

function readMore(currentUserId, skipNumberNotification){
    return new Promise(async(resolve, reject) => {
        try{
            let newNotifications = await NotificationModel.model.readMore(currentUserId, skipNumberNotification, LIMIT_NUMBER_TAKEN);
            
            let getNotifContents = newNotifications.map(async(notification) =>{
                let sender = await UserModel.getNormalUserDataById(notification.senderId);
                return NotificationModel.contents.getContent(notification.type, notification.isRead, sender._id, sender.username, sender.avatar);
            });

            resolve(await Promise.all(getNotifContents));
        }catch(error){
            reject(error);
        }
    });
}

function markAllAsRead(currentUserId, targetUsers){
    return new Promise(async(resolve, reject) => {
        try{
            await NotificationModel.model.markAllAsRead(currentUserId, targetUsers);
            resolve(true);
        }catch(error){
            console.log(`Error: ${error}`);
            reject(false);
        }
    });
}

module.exports = {
    getNotifications: getNotifications,
    countNotifUnread: countNotifUnread,
    readMore: readMore,
    markAllAsRead: markAllAsRead
}