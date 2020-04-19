function textAndEmojiChat(divId){
    $(".emojionearea").unbind("keyup").on("keyup", function(element){
        let currentEmojioneArea = $(this);
        if (element.which === 13){
            let targetId = $(`#write-chat-${divId}`).data("chat");
            let messageVal = $(`#write-chat-${divId}`).val();

            if (!targetId.length || !messageVal.length){
                return false;
            }
            
            let dataTextEmojiForSend = {
                uid: targetId,
                messageVal: messageVal
            };

            if ($(`#write-chat-${divId}`).hasClass("chat-in-group")){
                dataTextEmojiForSend.isChatGroup = true;
            }

            // goi send message len server
            $.post("/message/add-new-text-emoji", dataTextEmojiForSend, function(data){
                let dataToEmit = {
                    message: data.message
                };
                //step 1 xử lý dữ liệu trước khi hiển thị
                let messageOfMe = $(`<div class="bubble me" data-mess-id="${data.message._id}"></div>`)

                messageOfMe.text(data.message.text);
                let convertEmojiMessage = emojione.toImage(messageOfMe.html());

                if (dataTextEmojiForSend.isChatGroup){
                    let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title ="${data.message.sender.name}"/>`;
                    messageOfMe.html(`${senderAvatar} ${convertEmojiMessage}`);
                    dataToEmit.groupId = targetId;
                }else{
                    messageOfMe.html(convertEmojiMessage);
                    dataToEmit.contactId = targetId;
                }

                //step 2 thêm dữ liueej vào màn hình
                $(`.right .chat[data-chat = ${divId}]`).append(messageOfMe);
                nineScrollRight(divId);

                //step 3 xóa dữ liệu ở thẻ input
                $(`#write-chat-${divId}`).val("");
                currentEmojioneArea.find(".emojionearea-editor").text("");
                //step 4 hiển thị dữ liệu ở preview và leftSide
                $(`.person[data-chat=${divId}]`).find("span.time").html(moment(data.message.createAt).locale("vi").startOf("seconds").fromNow());
                $(`.person[data-chat=${divId}]`).find("span.preview").html(emojione.toImage(data.message.text));
                //step 5 đẩy bảng contact lên đầu
                $(`.person[data-chat=${divId}]`).on("eazychat.moveConversationToTheTop", function(){
                    let dataToMove = $(this).parent();
                    $(this).closest("ul").prepend(dataToMove);
                    $(this).off("eazychat.moveConversationToTheTop");
                });
                $(`.person[data-chat=${divId}]`).trigger("eazychat.moveConversationToTheTop");

                //step 6 emit real time
                socket.emit("chat-text-emoji", dataToEmit);
                //step7:
                // typingOff(divId);
                //step 8

                // let checkTyping = $(`.chat[data-chat=${divId}]`).find("div.buble-typing-gif");
                // if(checkTyping.length){
                //     checkTyping.remove();
                // }
            }).fail(function(response){
            });
        }
    });
}

$(document).ready(function(){
    socket.on("response-chat-text-emoji",function(response){
        let divId = "";
        
        //step 1 xử lý dữ liệu trước khi hiển thị
        let messageOfYou = 
        $(`<div class="bubble me" data-mess-id="${response.currentUserId}"></div>`);
        
        messageOfYou.text(response.message.text);
        let convertEmojiMessage = emojione.toImage(messageOfYou.html());
        if (response.currentGroupId){
            let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title ="${response.senderId}">`;
            messageOfYou.html(`${senderAvatar} ${convertEmojiMessage}`);

            divId = response.currentGroupId;
        }else{
            messageOfYou.html(convertEmojiMessage);
            divId = response.currentUserId;
        }
        //step 2 thêm dữ liueej vào màn hình
        if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ){
            $(`.right .chat[data-chat = ${divId}]`).append(messageOfYou);
            nineScrollRight(divId);
            $(`.person[data-chat=${divId}]`).find("span.time").addClass("massage-time-realtime");
        }

        //step 3 hiển thị dữ liệu ở preview và leftSide
        $(`.person[data-chat=${divId}]`).find("span.time").html(moment(response.message.createAt).locale("vi").startOf("seconds").fromNow());

        $(`.person[data-chat=${divId}]`).find("span.preview").html(emojione.toImage(response.message.text));
        //step 4 đẩy bảng contact lên đầu
        $(`.person[data-chat=${divId}]`).on("eazychat.moveConversationToTheTop", function(){
            let dataToMove = $(this).parent();
            $(this).closest("ul").prepend(dataToMove);
            $(this).off("eazychat.moveConversationToTheTop");
        });
        $(`.person[data-chat=${divId}]`).trigger("eazychat.moveConversationToTheTop");
    });
});
