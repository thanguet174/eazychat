function attachmentChat(divId){
    $(`#attachment-chat-${divId}`).unbind("change").on("change", function(){
        let fileData = $(this).prop("files")[0];
        let targetId = $(this).data("chat");
        let isChatGroup = false;

        let messageFormData = new FormData();
        messageFormData.append("my-attachment-chat", fileData);
        messageFormData.append("uid", targetId);

        if ($(this).hasClass("chat-in-group")){
            messageFormData.append("isChatGroup", true);
            isChatGroup = true;
        }
        $.ajax({
            url: "/message/add-new-attachment",
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
                let messageOfMe = $(`<div class="bubble you bubble-attachment-file" data-mess-id="${data.message._id}"></div>`)

                let attachmentChat = `
                    <a href="data:${data.message.file.contentType}; base64,${bufferToBase64(data.message.file.data.data)}" download="${data.message.file.fileName}">
                        ${data.message.file.fileName}
                    </a>`;
                if (isChatGroup){
                    let senderAvatar = `<img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title ="${data.message.sender.name}"/>`;
                    messageOfMe.html(`${senderAvatar} ${attachmentChat}`);
                    dataToEmit.groupId = targetId;
                }else{
                    messageOfMe.html(attachmentChat);
                    dataToEmit.contactId = targetId;
                }
                //step 2 thêm dữ liueej vào màn hình
                $(`.right .chat[data-chat = ${divId}]`).append(messageOfMe);
                nineScrollRight(divId);
                //step 3 hiển thị dữ liệu ở preview và leftSide
                $(`.person[data-chat=${divId}]`).find("span.time").removeClass("message-time-realtime").html(moment(data.message.createAt).locale("vi").startOf("seconds").fromNow());
                $(`.person[data-chat=${divId}]`).find("span.preview").html("Tệp đính kèm...");
                //step 4 đẩy bảng contact lên đầu
                $(`.person[data-chat=${divId}]`).on("eazychat.moveConversationToTheTop", function(){
                    let dataToMove = $(this).parent();
                    $(this).closest("ul").prepend(dataToMove);
                    $(this).off("eazychat.moveConversationToTheTop");
                });
                $(`.person[data-chat=${divId}]`).trigger("eazychat.moveConversationToTheTop");
                //step 5 emit real time
                socket.emit("chat-attachment", dataToEmit);
                //step 6 thêm tệp vào mnucj tệp đã chia sẻ
                let attachmentChatToAddModal = `
                    <li>
                        <a href="data:${data.message.file.contentType}; base64, ${bufferToBase64(data.message.file.data.data)}" download="${data.message.file.fileName}">
                            ${data.message.file.fileName}
                        </a>
                    </li>`;

                $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentChatToAddModal);
            },
            error: function(error){
                alertify.notify(error.responseText, "error", 4);
            }
        });
    });
}

$(document).ready(function(){
    socket.on("response-chat-attachment", function(response){
        let divId = "";
        //step 1 xử lý dữ liệu trước khi hiển thị
        let messageOfYou = 
        $(`<div class="bubble me bubble-attachment-file" data-mess-id="${response.message._id}"></div>`);
        let attachmentChat = `
                    <a href="data:${response.message.file.contentType}; base64,${bufferToBase64(response.message.file.data.data)}" download="${response.message.file.fileName}">
                    ${response.message.file.fileName}
                    </a>`;
        if (response.currentGroupId){
            let senderAvatar = `<img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title ="${response.senderId}">`;
            messageOfYou.html(`${senderAvatar} ${attachmentChat}`);

            divId = response.currentGroupId;
        }else{
            messageOfYou.html(attachmentChat);
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

        $(`.person[data-chat=${divId}]`).find("span.preview").html("Tệp đính kèm...");
        //step 4 đẩy bảng contact lên đầu
        $(`.person[data-chat=${divId}]`).on("eazychat.moveConversationToTheTop", function(){
            let dataToMove = $(this).parent();
            $(this).closest("ul").prepend(dataToMove);
            $(this).off("eazychat.moveConversationToTheTop");
        });
        $(`.person[data-chat=${divId}]`).trigger("eazychat.moveConversationToTheTop");
        //step 5 thêm ảnh vào mnucj hình ảnh đã chia sẻ
        if (response.currentUserId !== $("#dropdown-navbar-user").data("uid") ){
            let attachmentChatToAddModal = `
                    <li>
                        <a href="data:${response.message.file.contentType}; base64, ${bufferToBase64(response.message.file.data.data)}" download="${response.message.file.fileName}">
                            ${response.message.file.fileName}
                        </a>
                    </li>`;

            $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentChatToAddModal);
        }
    });
});