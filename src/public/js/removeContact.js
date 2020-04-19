//Hủy danh bạ
function removeContact() {
    $(".user-remove-contact").unbind().on("click", function() {
        let targetId = $(this).data("uid");
        let username = $(this).parent().find("div.user-name p").text();

        Swal.fire({
            title: `Bạn có chắc chắn muốn xóa ${username} khỏi danh bạ?`,
            text: "Bạn không thể hoàn tác lại quá trình này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '5298f2',
            cancelButtonColor: '#ff7675',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
          }).then(function(result){
                if (!result.value){
                    return false;
                }
                $.ajax({
                    url: "/contact/remove-contact",
                    type: "delete",
                    data: {uid: targetId},
                    success: function(data) {
                        if (data.success){
                            $("#contacts").find(`ul li[data-uid = ${targetId}]`).remove();
                            //giảm số trên danh bạ
                            decreaseNumberNotifContact("count-contacts");
                            //xóa user ở phần chat
                            socket.emit("remove-contact", {contactId: targetId });
                            //check active
                            let checkActive = $("#all-chat").find(`li[data-chat= ${targetId}]`).hasClass("active");
                            //step 1xóa khung trò chuyện
                            $("#all-chat").find(`ul a[href="#uid_${targetId}"]`).remove();
                            $("#user-chat").find(`ul a[href="#uid_${targetId}"]`).remove();
                            //step 2 xóa bên rightside
                            $("#screen-chat").find(`div#to_${targetId}`).remove();
                            //step 3 Xóa image modal
                            $("body").find(`div#imagesModal_${targetId}`).remove();
                            //step 4 xóa attachment modal
                            $("body").find(`div#attachmentsModal_${targetId}`).remove();
                            if (checkActive){
                                $("ul.people").find("a")[0].click();
                            }
                        }
                    }
                })
        })
    });
}

socket.on("response-remove-contact", function(user) {
    $("#contacts").find(`ul li[data-uid = ${user.id}]`).remove();
    //xóa khung trò chuyện
    let checkActive = $("#all-chat").find(`li[data-chat= ${user.id}]`).hasClass("active");
    //giảm số trên danh bạ
    decreaseNumberNotifContact("count-contacts");
    // Xoas been left side
    $("#all-chat").find(`ul a[href="#uid_${user.id}"]`).remove();
    $("#user-chat").find(`ul a[href="#uid_${user.id}"]`).remove();
    //step 2 xóa bên rightside
    $("#screen-chat").find(`div#to_${user.id}`).remove();
    //step 3 Xóa image modal
    $("body").find(`div#imagesModal_${user.id}`).remove();
    //step 4 xóa attachment modal
    $("body").find(`div#attachmentsModal_${user.id}`).remove();
    //step 5 chọn người dùng đầu tiên đề nhắn tin sau khi xóa
    if (checkActive){
        $("ul.people").find("a")[0].click();
    }
});

$(document).ready(function(){
    removeContact();
});