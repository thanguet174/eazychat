//Hủy lời mờ kết bạn
function removeRequestContactSent() {
    $(".user-remove-request-contact-sent").unbind().on("click", function() {
        let targetId = $(this).data("uid");
        $.ajax({
            url: "/contact/remove-request-contact-sent",
            type: "delete",
            data: {uid: targetId},
            success: function(data) {
                if (data.success){
                    $("#find-user").find(`div.user-remove-request-contact-sent[data-uid=${targetId}]`).hide();
                    $("#find-user").find(`div.user-add-new-contact[data-uid=${targetId}]`).css("display","inline-block");
                    
                    decreaseNumberNotification("noti_contact_counter", 1);

                    decreaseNumberNotifContact("count-request-contact-sent");
                    
                    $("#request-contact-sent").find(`li[data-uid=${targetId}]`).remove();
                    //huy yeu cau ket ban
                    socket.emit("remove-request-contact-sent", {contactId: targetId });
                }
            }
        })
    });
}

socket.on("response-remove-request-contact-sent", function(user) {

    $(".noti_content").find(`div[data-uid = ${user.id}]`).remove(); //popup notif
    $("ul.list-notifications").find(`li>div[data-uid = ${user.id}]`).parent().remove();
    // xóa ở tab yêu cầu kết bạn khi bấm hủy kết bạn trong tìm người dùng
    $("#request-contact-received").find(`li[data-uid=${user.id}]`).remove();
    //decreaseNumberNotifContact("contacts");
    //decreaseNumberNotifContact("count-request-contact-sent");
    decreaseNumberNotifContact("count-request-contact-received");

    decreaseNumberNotification("noti_contact_counter", 1);
    decreaseNumberNotification("noti_counter", 1);
});

$(document).ready(function(){
    removeRequestContactSent();
});