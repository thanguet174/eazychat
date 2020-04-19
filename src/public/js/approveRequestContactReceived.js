//Hủy lời mờ kết bạn
function approveRequestContactReceived() {
    $(".user-approve-request-contact-received").unbind().on("click", function() {
        let targetId = $(this).data("uid");
        let targetName = $(this).parent().find("div.user-name>p").text().trim();
        let targetAvatar =  $(this).parent().find("div.user-avatar>img").attr("src");
        $.ajax({
            url: "/contact/approve-request-contact-received",
            type: "put",
            data: {uid: targetId},
            success: function(data) {
                if (data.success){
                    let userInfo = $("#request-contact-received").find(`ul li[data-uid = ${targetId}]`);
                    $(userInfo).find("div.user-approve-request-contact-received").remove();
                    $(userInfo).find("div.user-remove-request-contact-received").remove();
                    $(userInfo).find("div.contactPanel")
                        .append(`
                            <div class="user-talk" data-uid="${targetId}">
                                Trò chuyện
                            </div>
                            <div class="user-remove-contact action-danger" data-uid="${targetId}">
                                Xóa liên hệ
                            </div>
                        `);

                    let userInfoHtml = userInfo.get(0).outerHTML;
                    $("#contacts").find("ul").prepend(userInfoHtml);
                    $(userInfo).remove();

                    //hiển thị cuộc trò chuyện với người dùng khi chấp nhận kết bạn

                    decreaseNumberNotifContact("count-request-contact-received");
                    increaseNumberNotifContact("count-contacts");

                    decreaseNumberNotification("noti_contact_counter",1);
                    removeContact();
                    //chuc nang chat
                    socket.emit("approve-request-contact-received", {contactId: targetId });
                    //Sau khi đồng ý kết bạn
                    //step 1 ẩn modal
                    // $("#contactsModal").modal("hide");
                    //step 2
                    let subUsername = targetName;
                    if (subUsername.length > 15){
                        subUsername = subUsername.substr(0,14);
                    }
                    let leftSideData = `
                    <a href="#uid_${targetId}" class="room-chat" data-target="#to_${targetId}">
                        <li class="person" data-chat="${targetId}">
                            <div class="left-avatar">
                                <div class="dot"></div>
                                <img src="${targetAvatar}" alt="">
                            </div>
                            <span class="name">
                                ${subUsername}
                            </span>
                            <span class="time">
                                
                            </span>
                            <span class="preview convert-emoji">
                                
                            </span>
                        </li>
                    </a>`;
                    $("#all-chat").find("ul").prepend(leftSideData);
                    $("#user-chat").find("ul").prepend(leftSideData);

                    //step 3 rightside
                    let rightSideData = `
                        <div class="right tab-pane <% if(index === 0) { %> active <% } %>>" data-chat="${targetId}" id="to_${targetId}">   
                            <div class="top">
                                <span>To: <span class="name">${targetName}</span>
                                <span class="chat-menu-right">
                                    <a href="#attachmentsModal_${targetId}" class="show-attachments" data-toggle="modal">
                                        Tệp đính kèm
                                        <i class="fa fa-paperclip"></i>
                                    </a>
                                </span>
                                <span class="chat-menu-right">
                                    <a href="javascript:void(0)">&nbsp;</a>
                                </span>
                                <span class="chat-menu-right">
                                    <a href="#imagesModal_${targetId}" class="show-images" data-toggle="modal">
                                        Hình ảnh
                                        <i class="fa fa-photo"></i>
                                    </a>
                                </span>
                            </div>
                            <div class="content-chat">
                                <div class="chat" data-chat="${targetId}">
                                </div>
                            </div>
                            <div class="write" data-chat="${targetId}">
                                <input type="text" class="write-chat" id="write-chat-${targetId}" data-chat="${targetId}">
                                <div class="icons">
                                    <a href="#" class="icon-chat" data-chat="${targetId}"><i class="fa fa-smile-o" style="color: #5298f2;cursor: pointer;"></i></a>
                                    <label for="image-chat-${targetId}">
                                        <input type="file" id="image-chat-${targetId}" name="my-image-chat" class="image-chat" data-chat="${targetId}">
                                        <i class="fa fa-photo" style="color: #5298f2; cursor: pointer;" id="photo"></i>
                                    </label>
                                    <label for="attachment-chat-${targetId}">
                                        <input type="file" id="attachment-chat-${targetId}" name="my-attachment-chat" class="attachment-chat display-none" data-chat="${targetId}">
                                        <i class="fa fa-paperclip" style="color: #5298f2; cursor: pointer;"></i>
                                    </label>
                                    <a href="javascript:void(0)" id="video-chat-${targetId}" class="video-chat" data-chat="${targetId}">
                                        <i class="fa fa-video-camera" style="color: #5298f2;cursor: pointer;"></i>
                                    </a>
                                </div>
                            </div>
                        </div>`;
                    $("#screen-chat").prepend(rightSideData);
                    //step 4
                    changeScreenChat();
                    //step 5
                    let imageModalData = `
                        <div class="modal fade" id="imagesModal_${targetId}" role="dialog">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">Hình ảnh đã chia sẻ</h4>
                                    </div>
                                    <div class="modal-body">
                                        <div class="all-images" style="visibility: hidden;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `; 
                    $("body").append(imageModalData);

                    //call gridphoto
                    gridPhotos(5);
                    //step 7
                    let attachmentsModal = `
                        <div class="modal fade" id="attachmentsModal_${targetId}" role="dialog">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">Tệp đã chia sẻ</h4>
                                    </div>
                                    <div class="modal-body">
                                        <ul class="list-attachments">
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    $("body").append(attachmentsModal);
                    $("ul.people").find("a")[0].click();
                    //step 8
                    socket.emit("check-status");
                    // step 9 chọn người dùng vừa mới thêm vào danh bạ 
                    
                }
            }
        });
    });
}

socket.on("response-approve-request-contact-received", function(user) {
    let notif =`<div class="notif-readed-false" data-uid="${ user.id }">
                    <img class="avatar-small" src="images/users/${user.avatar}>" alt="">
                    <strong>${ user.username }</strong> đã chấp nhận lời mời kết bạn!
                </div>`;
    //đẩy thông báo từ trên xuống, mới nhất nằm trên đầu dùng prepen
    $(".noti_content").prepend(notif);
    $("ul.list-notifications").prepend(`<li>${notif}</li>`);

    increaseNumberNotifContact("count-contacts");
    decreaseNumberNotifContact("count-request-contact-received");

    decreaseNumberNotification("noti_contact_counter",1);

    $("#request-contact-sent").find(`ul li[data-uid = ${user.id}]`).remove();
    $("#find-user").find(`ul li[data-uid = ${user.id}]`).remove();

    let userInfoHtml = `
        <li class="_contactList" data-uid="${user.id}">
            <div class="contactPanel">
                <div class="user-avatar">
                    <img src="images/users/${user.avatar}" alt="">
                </div>
                <div class="user-name">
                    <p>
                        ${user.username}
                    </p>
                </div>
                <br>
                <div class="user-address">
                    <span>&nbsp ${user.address}</span>
                </div>
                <div class="user-talk" data-uid="${user.id}">
                    Trò chuyện
                </div>
                <div class="user-remove-contact action-danger" data-uid="${user.id}">
                    Xóa liên hệ
                </div>
            </div>
        </li>       
    `;
    $("#contacts").find("ul").prepend(userInfoHtml);
    removeContact();
    
    //step 2
    let subUsername = user.username;
    if (subUsername.length > 15){
        subUsername = subUsername.substr(0,14);
    }
    let leftSideData = `
    <a href="#uid_${user.id}" class="room-chat" data-target="#to_${user.id}">
        <li class="person" data-chat="${user.id}">
            <div class="left-avatar">
                <div class="dot"></div>
                <img src="images/users/${user.avatar}" alt="">
            </div>
            <span class="name">
                ${user.username}
            </span>
            <span class="time">
                
            </span>
            <span class="preview convert-emoji">
                
            </span>
        </li>
    </a>`;
    $("#all-chat").find("ul").prepend(leftSideData);
    $("#user-chat").find("ul").prepend(leftSideData);

    //step 3 rightside
    let rightSideData = `
        <div class="right tab-pane <% if(index === 0) { %> active <% } %>>" data-chat="${user.id}" id="to_${user.id}">   
            <div class="top">
                <span>To: <span class="name">${user.username}</span>
                <span class="chat-menu-right">
                    <a href="#attachmentsModal_${user.id}" class="show-attachments" data-toggle="modal">
                        Tệp đính kèm
                        <i class="fa fa-paperclip"></i>
                    </a>
                </span>
                <span class="chat-menu-right">
                    <a href="javascript:void(0)">&nbsp;</a>
                </span>
                <span class="chat-menu-right">
                    <a href="#imagesModal_${user.id}" class="show-images" data-toggle="modal">
                        Hình ảnh
                        <i class="fa fa-photo"></i>
                    </a>
                </span>
            </div>
            <div class="content-chat">
                <div class="chat" data-chat="${user.id}">
                </div>
            </div>
            <div class="write" data-chat="${user.id}">
                <input type="text" class="write-chat" id="write-chat-${user.id}" data-chat="${user.id}">
                <div class="icons">
                    <a href="#" class="icon-chat" data-chat="${user.id}"><i class="fa fa-smile-o" style="color: #5298f2;cursor: pointer;"></i></a>
                    <label for="image-chat-${user.id}">
                        <input type="file" id="image-chat-${user.id}" name="my-image-chat" class="image-chat" data-chat="${user.id}">
                        <i class="fa fa-photo" style="color: #5298f2; cursor: pointer;" id="photo"></i>
                    </label>
                    <label for="attachment-chat-${user.id}">
                        <input type="file" id="attachment-chat-${user.id}" name="my-attachment-chat" class="attachment-chat display-none" data-chat="${user.id}">
                        <i class="fa fa-paperclip" style="color: #5298f2; cursor: pointer;"></i>
                    </label>
                    <a href="javascript:void(0)" id="video-chat-${user.id}" class="video-chat" data-chat="${user.id}">
                        <i class="fa fa-video-camera" style="color: #5298f2;cursor: pointer;"></i>
                    </a>
                </div>
            </div>
        </div>`;
    $("#screen-chat").prepend(rightSideData);
    //step 4
    changeScreenChat();
    //step 5
    let imageModalData = `
        <div class="modal fade" id="imagesModal_${user.id}" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Hình ảnh đã chia sẻ</h4>
                    </div>
                    <div class="modal-body">
                        <div class="all-images" style="visibility: hidden;"></div>
                    </div>
                </div>
            </div>
        </div>
    `; 
    $("body").append(imageModalData);

    //call gridphoto
    gridPhotos(5);
    //step 7
    let attachmentsModal = `
        <div class="modal fade" id="attachmentsModal_${user.id}" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Tệp đã chia sẻ</h4>
                    </div>
                    <div class="modal-body">
                        <ul class="list-attachments">
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    $("body").append(attachmentsModal);
    $("ul.people").find("a")[0].click();
    //step 8
    socket.emit("check-status");
});

$(document).ready(function(){
    approveRequestContactReceived();
});