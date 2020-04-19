function imageChat(divId){
    $(`#image-chat-${divId}`).unbind("change").on("change", function(){
        let fileData = $(this).prop("files")[0];
        let math = ["image/png", "image/jpg", "image/jpeg"];
        if ($.inArray(fileData.type, math) === -1){
            alertify.notify("Kiểu file không hợp lệ", "error", 3);
            $(this).val(null);
            return false;
        }

        let targetId = $(this).data("chat");
        let isChatGroup = false;

        let messageFormData = new FormData();
        messageFormData.append("my-image-chat", fileData);
        messageFormData.append("uid", targetId);

        if ($(this).hasClass("chat-in-group")){
            messageFormData.append("isChatGroup", true);
            isChatGroup = true;
        }

        $.ajax({
            url: "/message/add-new-image",
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            data: messageFormData,
            success: function(data){
                let dataToEmit = {
                    message: data.message
                };
                //step 1 xử lý dữ liệu trước khi hiển thị
                let messageOfMe = $(`<div class="bubble you bubble-image-file" data-mess-id="${data.message._id}"></div>`)

                let imageChat = `<img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}" class="show-image-chat" />`;

                if (isChatGroup){
                    let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title ="${data.message.sender.name}"/>`;
                    messageOfMe.html(`${senderAvatar} ${imageChat}`);
                    dataToEmit.groupId = targetId;
                }else{
                    messageOfMe.html(imageChat);
                    dataToEmit.contactId = targetId;
                }
                //step 2 thêm dữ liueej vào màn hình
                $(`.right .chat[data-chat = ${divId}]`).append(messageOfMe);
                nineScrollRight(divId);
                //step 3 hiển thị dữ liệu ở preview và leftSide
                $(`.person[data-chat=${divId}]`).find("span.time").removeClass("message-time-realtime").html(moment(data.message.createAt).locale("vi").startOf("seconds").fromNow());
                $(`.person[data-chat=${divId}]`).find("span.preview").html("Hình ảnh...");
                //step 4 đẩy bảng contact lên đầu
                $(`.person[data-chat=${divId}]`).on("eazychat.moveConversationToTheTop", function(){
                    let dataToMove = $(this).parent();
                    $(this).closest("ul").prepend(dataToMove);
                    $(this).off("eazychat.moveConversationToTheTop");
                });
                $(`.person[data-chat=${divId}]`).trigger("eazychat.moveConversationToTheTop");
                //step 5 emit real time
                socket.emit("chat-image", dataToEmit);
                //step 6 thêm ảnh vào mnucj hình ảnh đã chia sẻ
                let imageChatToAddModal = `<img src="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}">`;

                $(`#imagesModal_${divId}`).find("div.all-images").append(imageChatToAddModal);
            },
            error: function(error){
                alertify.notify(error.responseText, "error", 4);
            }
        });
    });
}

$(document).ready(function(){
    socket.on("response-chat-image", function(response){
        let divId = "";
        //step 1 xử lý dữ liệu trước khi hiển thị
        let messageOfYou = 
        $(`<div class="bubble me bubble-image-file" data-mess-id="$${response.message._id}"></div>`);
        let imageChat = `<img src="data:${response.message.file.contentType}; base64, ${bufferToBase64(response.message.file.data.data)}" class="show-image-chat" />`;

        if (response.currentGroupId){
            let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title ="${response.senderId}">`;
            messageOfYou.html(`${senderAvatar} ${imageChat}`);

            divId = response.currentGroupId;
        }else{
            messageOfYou.html(imageChat);
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

        $(`.person[data-chat=${divId}]`).find("span.preview").html("Hình ảnh...");
        //step 4 đẩy bảng contact lên đầu
        $(`.person[data-chat=${divId}]`).on("eazychat.moveConversationToTheTop", function(){
            let dataToMove = $(this).parent();
            $(this).closest("ul").prepend(dataToMove);
            $(this).off("eazychat.moveConversationToTheTop");
        });
        $(`.person[data-chat=${divId}]`).trigger("eazychat.moveConversationToTheTop");
        //step 5 thêm ảnh vào mnucj hình ảnh đã chia sẻ
        if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ){
            let imageChatToAddModal = `<img src="data:${response.message.file.contentType}; base64, ${bufferToBase64(response.message.file.data.data)}">`;

            $(`#imagesModal_${divId}`).find("div.all-images").append(imageChatToAddModal);
        }
    });
});