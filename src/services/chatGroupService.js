import ChatGroupModel from "./../models/chatGroupModel";

let addGroup = (currentUserId, arrayIds, groupChatName) => {
    return new Promise (async(resolve, reject) => {
        //create contact
        arrayIds.push({"userId":currentUserId});
        let newGroupItem = {
            name: groupChatName,
            userAmount: arrayIds.length,
            messageAmount: 0,
            userId: currentUserId,
            members: arrayIds,
            createAt: Date.now()
        };
        let newGroup = await ChatGroupModel.createNew(newGroupItem);
        resolve(newGroup);
    });
};

module.exports = {
    addGroup: addGroup
}