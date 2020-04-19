function readMoreMessages(){
    $(".right .chat").scroll(function() {
        if ($(this).scrollTop() === 0 ){
            //get the first message
            let firstMessage = $(this).find(".bubble:first");
            //get position of first  message 
            let currentOffset = firstMessage.offset().top - $(this).scrollTop();
            let messageLoading = `<img src="images/chat/message-loading.gif" class="message-loading">`;
            $(this).prepend(messageLoading);

            let targetId = $(this).data("chat");
            let skipMessage = $(this).find("div.bubble").length;
            let chatInGroup = $(this).hasClass("chat-in-group") ? true : false;

            let thisDom = $(this);
            $.get(`/message/read-more?skipMessage=${skipMessage}&targetId=${targetId}&chatInGroup=${chatInGroup}`, function(data){
                if (data.rightSideData.trim() === ""){
                    alertify.notify("Bạn đã xem hết tin nhắn", "error", 3);
                    thisDom.find("img.message-loading").remove();
                    return false;
                }

                //step 1
                $(`.right .chat[data-chat=${targetId}]`).prepend(data.rightSideData);
                //step 2
                $(`.right .chat[data-chat=${targetId}]`).scrollTop(firstMessage.offset().top - currentOffset);
                //step3 convert emoji
                convertEmoji();
                //step 4: in dl ra imgageModal
                $(`#imagesModal_${targetId}`).find("div.all-images").append(data.imageModalData);
                //step 5: call gridphoto
                gridPhotos(5);
                //step 6: in dl ra attachmentModal
                $(`#attachmentsModal_${targetId}`).find("ul.list-attachments").append(data.attachmentModalData);
                //step 7 
                thisDom.find("img.message-loading").remove();
            });
        } 
    });
}

$(document).ready(function(){
    readMoreMessages();
});