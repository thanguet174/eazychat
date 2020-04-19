function addFriendsToGroup() {
    $('ul#group-chat-friends').find('div.add-user').bind('click', function() {
      let uid = $(this).data('uid');
      $(this).remove();
      let html = $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').html();
  
      let promise = new Promise(function(resolve, reject) {
        $('ul#friends-added').append(html);
        $('#groupChatModal .list-user-added').show();
        resolve(true);
      });
      promise.then(function(success) {
        $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').remove();
      });
    });
  }
  
function cancelCreateGroup() {
$('#btn-cancel-group-chat').bind('click', function() {
    $('#groupChatModal .list-user-added').hide();
    if ($('ul#friends-added>li').length) {
    $('ul#friends-added>li').each(function(index) {
        $(this).remove();
    });
    }
});
}

function callSeachFriends(element){
    if(element.which === 13 || element.type === "click"){
        let keyword = $("#input-search-friends-to-add-group-chat").val();

        $.get(`/contact/search-friends/${keyword}`, function(data){
            $("ul#group-chat-friends").html(data);
            // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
            addFriendsToGroup();

            // Action hủy việc tạo nhóm trò chuyện
            cancelCreateGroup();
        });  
    }   
}

function callCreateGroupChat(){
    $("#btn-create-group-chat").unbind("click").on("click", function(){
        let countUsers = $("ul#friends-added").find("li");
        if (countUsers.length < 2){
            alertify.notify("Vui lòng chọn tói thiểu 2 người để tạo nhóm", "error", 5);
            return false;
        }

        let groupChatName = $("#input-name-group-chat").val();
        if (groupChatName.length < 5 || groupChatName.length > 50){
            alertify.notify("Vui lòng nhập tên nhóm từ 5-50 ký tự","error", 3);
            return false;
        }

        let arrayIds = [];
        $("ul#friends-added").find("li").each(function(index, item){
            arrayIds.push({"userId": $(item).data("uid")});
        });

        $.post("/group-chat/add-new", {
            arrayIds: arrayIds,
            groupChatName: groupChatName,

        }, function(data){
            //step 1: đóng modal
            $("#input-name-group-chat").val("");
            $("#btn-cancel-group-chat").click();
            $("#groupChatModal").modal("hide");
            //step 2: do dl ra leftside
            let subGroupChatName = data.groupChat.name;
            if (subGroupChatName.length > 15){
                subGroupChatName = subGroupChatName.substr(0,14);
            }
            let liftSideData = `
                <a href="#uid_${data.groupChat._id}" class="room-chat" data-target="#to_${data.groupChat._id}">
                    <li class="person group-chat" data-chat="${data.groupChat._id}">
                        <div class="left-avatar">
                            <img src="images/users/group-avatar-trungquandev.png" alt="">
                        </div>
                        <span class="name">
                            <span class="group-chat-name">
                                ${subGroupChatName}
                            </span> 
                        </span>
                        <span class="time">
                        </span>
                        <span class="preview convert-emoji">
                        </span>
                    </li>
                </a>        
            `;
            $("#all-chat").find("ul").prepend(liftSideData);
            //step 3: rightSide
            let rightSideData = `
                <div class="right tab-pane>" data-chat="${data.groupChat._id}" id="to_${data.groupChat._id}">   
                <div class="top">
                        <span>To: <span class="name">${data.groupChat.name}</span>
                        <span class="chat-menu-right">
                            <a href="#attachmentsModal_${data.groupChat._id}" class="show-attachments" data-toggle="modal">
                                Tệp đính kèm
                                <i class="fa fa-paperclip"></i>
                            </a>
                        </span>
                        <span class="chat-menu-right">
                            <a href="javascript:void(0)">&nbsp;</a>
                        </span>
                        <span class="chat-menu-right">
                            <a href="#imagesModal_${data.groupChat._id}" class="show-images" data-toggle="modal">
                                Hình ảnh
                                <i class="fa fa-photo"></i>
                            </a>
                        </span>
                        <span class="chat-menu-right">
                            <a href="javascript:void(0)" class="number-members" data-toggle="modal">
                                <span class="show-number-members">${data.groupChat.userAmount}</span>
                                <i class="fa fa-users"></i>
                            </a>
                        </span>
                </div>
                <div class="content-chat">
                    <div class="chat chat-in-group" data-chat="${data.groupChat._id}">
                    </div>
                </div>
                <div class="write" data-chat="${data.groupChat._id}">
                    <input type="text" class="write-chat chat-in-group" id="write-chat-${data.groupChat._id}" data-chat="${data.groupChat._id}">
                    <div class="icons">
                        <a href="#" class="icon-chat" data-chat="${data.groupChat._id}"><i class="fa fa-smile-o" style="color: #5298f2;cursor: pointer;"></i></a>
                        <label for="image-chat-${data.groupChat._id}">
                            <input type="file" id="image-chat-${data.groupChat._id}" name="my-image-chat" class="image-chat chat-in-group" data-chat="${data.groupChat._id}">
                            <i class="fa fa-photo" style="color: #5298f2; cursor: pointer;" id="photo"></i>
                        </label>
                        <label for="attachment-chat-${data.groupChat._id}">
                            <input type="file" id="attachment-chat-${data.groupChat._id}" name="my-attachment-chat" class="attachment-chat chat-in-group" data-chat="${data.groupChat._id}">
                            <i class="fa fa-paperclip" style="color: #5298f2; cursor: pointer;"></i>
                        </label>
                        <a href="#javascript:void(0)" id="video-chat-group">
                            <i class="fa fa-video-camera" style="color: #5298f2;cursor: pointer;"></i>
                        </a>
                    </div>
                </div>
            </div>`;
            $("#screen-chat").prepend(rightSideData);
            //step 4 call function changescreenchat
            changeScreenChat();

            //step 5: hình ảnh đã chia sẻ
            let imageModalData = `
            <div class="modal fade" id="imagesModal_${data.groupChat._id}" role="dialog">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">Hình ảnh đã chia sẻ</h4>
                        </div>
                        <div class="modal-body">
                            <div class="all-images" style="visibility: hidden;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            $("body").append(imageModalData);

            //step 6: hien thi hinh anh
            gridPhotos(5);
            //step 7: tệp đã chia sẻ
            let attactmentModalData = `
            <div class="modal fade" id="attachmentsModal_${data.groupChat._id}" role="dialog">
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
            </div>`;
            $("ul.people").find(`a[data-target="#to_${data.groupChat._id}"]`).click();
            textAndEmojiChat();
            //step 8: emit tạo mới group 
            socket.emit("new-group-created", {groupChat: data.groupChat});
            //step 9: cập nhật online
            socket.emit("check-status");
        })
        .fail(function(response){
            console.log(response);
        });
    });
}

$(document).ready( () => {
    $("#input-search-friends-to-add-group-chat").bind("keypress", callSeachFriends);
    $("#btn-search-friends-to-add-group-chat").bind("click",callSeachFriends);
    callCreateGroupChat();

    socket.on("response-new-group-created", function(response){
        //step 1: đóng modal 
        //step 2: do dl ra leftside
        let subGroupChatName = response.groupChat.name;
        if (subGroupChatName.length > 15){
            subGroupChatName = subGroupChatName.substr(0,14);
        }
        let liftSideData = `
            <a href="#uid_${response.groupChat._id}" class="room-chat" data-target="#to_${response.groupChat._id}">
                <li class="person group-chat" data-chat="${response.groupChat._id}">
                    <div class="left-avatar">
                        <img src="images/users/group-avatar-trungquandev.png" alt="">
                    </div>
                    <span class="name">
                        <span class="group-chat-name">
                            ${subGroupChatName}
                        </span> 
                    </span>
                    <span class="time">
                    </span>
                    <span class="preview convert-emoji">
                    </span>
                </li>
            </a>        
        `;
        $("#all-chat").find("ul").prepend(liftSideData);
        $()
        //step 3: rightSide
        let rightSideData = `
            <div class="right tab-pane>" data-chat="${response.groupChat._id}" id="to_${response.groupChat._id}">   
            <div class="top">
                    <span>To: <span class="name">${response.groupChat.name}</span>
                    <span class="chat-menu-right">
                        <a href="#attachmentsModal_${response.groupChat._id}" class="show-attachments" data-toggle="modal">
                            Tệp đính kèm
                            <i class="fa fa-paperclip"></i>
                        </a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)">&nbsp;</a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="#imagesModal_${response.groupChat._id}" class="show-images" data-toggle="modal">
                            Hình ảnh
                            <i class="fa fa-photo"></i>
                        </a>
                    </span>
                    <span class="chat-menu-right">
                        <a href="javascript:void(0)" class="number-members" data-toggle="modal">
                            <span class="show-number-members">${response.groupChat.userAmount}</span>
                            <i class="fa fa-users"></i>
                        </a>
                    </span>
            </div>
            <div class="content-chat">
                <div class="chat chat-in-group" data-chat="${response.groupChat._id}">
                </div>
            </div>
            <div class="write" data-chat="${response.groupChat._id}">
                <input type="text" class="write-chat chat-in-group" id="write-chat-${response.groupChat._id}" data-chat="${response.groupChat._id}">
                <div class="icons">
                    <a href="#" class="icon-chat" data-chat="${response.groupChat._id}"><i class="fa fa-smile-o" style="color: #5298f2;cursor: pointer;"></i></a>
                    <label for="image-chat-${response.groupChat._id}">
                        <input type="file" id="image-chat-${response.groupChat._id}" name="my-image-chat" class="image-chat chat-in-group" data-chat="${response.groupChat._id}">
                        <i class="fa fa-photo" style="color: #5298f2; cursor: pointer;" id="photo"></i>
                    </label>
                    <label for="attachment-chat-${response.groupChat._id}">
                        <input type="file" id="attachment-chat-${response.groupChat._id}" name="my-attachment-chat" class="attachment-chat chat-in-group" data-chat="${response.groupChat._id}">
                        <i class="fa fa-paperclip" style="color: #5298f2; cursor: pointer;"></i>
                    </label>
                    <a href="#javascript:void(0)" id="video-chat-group">
                        <i class="fa fa-video-camera" style="color: #5298f2;cursor: pointer;"></i>
                    </a>
                </div>
            </div>
        </div>`;
        $("#screen-chat").prepend(rightSideData);
        //step 4 call function changescreenchat
        changeScreenChat();

        //step 5: hình ảnh đã chia sẻ
        let imageModalData = `
        <div class="modal fade" id="imagesModal_${response.groupChat._id}" role="dialog">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Hình ảnh đã chia sẻ</h4>
                    </div>
                    <div class="modal-body">
                        <div class="all-images" style="visibility: hidden;">
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        $("body").append(imageModalData);

        //step 6: hien thi hinh anh
        gridPhotos(5);
        //step 7: tệp đã chia sẻ
        let attactmentModalData = `
        <div class="modal fade" id="attachmentsModal_${response.groupChat._id}" role="dialog">
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
        </div>`;

        $("body").append(attactmentModalData);
        //chọn phần từ đầu tiền khi thêm group
        $("ul.people").find(`a[data-target="#to_${response.groupChat._id}"]`).click();
        //bấm vào trò chuyện sau khi thêm group
        textAndEmojiChat();
        //step 8:   emit khi người dùng tạo group chat
        socket.emit("member-received-group-chat", {groupChatId: response.groupChat._id});
        //step 9: Cập nhật online
        socket.emit("check-status");
    });
});