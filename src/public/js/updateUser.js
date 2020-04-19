let userAvatar = null;
let userInfo = {};
let originAvatarSrc = null;
let originUserInfo = {};
let userUpdatePassword = {};

function updateUserInfo(){
    $('#input-change-avatar').bind("change", function() {
        let fileData = $(this).prop("files")[0];
        let math = ["image/png", "image/jpg", "image/jpeg"];
        let limit = 1048576; //1MB

        //kiểm định dạng file có hợp lệ hay không
        if ($.inArray(fileData.type, math) === -1){
            alertify.notify("Kiểu file không hợp lệ", "error", 3);
            $(this).val(null);
            return false;
        }

        if (fileData.size > limit){
            alertify.notify("Dung lượng tối đa cho phép là 1MB", "error", 3);
            $(this).val(null);
            return false;
        }

        if (typeof(FileReader) != undefined){
            let imagePreview = $('#image-edit-profile');
            imagePreview.empty();
            let fileReader = new FileReader();
            fileReader.onload = function(element){
                $('<img>', {"src" : element.target.result,
                            "class": "avatar img-circle",
                            "id" : "user-modal-avatar",
                            "alt": "avatar"}).appendTo(imagePreview);
            }
            imagePreview.show();
            fileReader.readAsDataURL(fileData);

            let formData = new FormData();
            formData.append("avatar", fileData);
            userAvatar = formData;

        }else{
            alertify.notify("Error", "error", 3);
        }
    });

    $('#input-change-gender-male').bind("click", function(){
        let gender = $(this).val();

        if (gender != "male"){
            alertify.notify('Oops!');
            $(this).val(originUserInfo.gender);
            delete userInfo.gender;
            return false;
        }

        userInfo.gender = gender;
    });

    $('#input-change-gender-female').bind("click", function(){
        let gender = $(this).val();

        if (gender != "female"){
            alertify.notify('Oops!', "error", 3);
            $(this).val(originUserInfo.gender);
            delete userInfo.gender;
            return false;
        }

        userInfo.gender = gender;
    });

    $('#input-change-address').bind("change", function(){

        let address = $(this).val();

        if (address.length < 3 || address.length > 50){
            alertify.notify('Địa chỉ trong khoảng 3-50 kí tự', "error", 3);
            $(this).val(originUserInfo.address);
            delete userInfo.address;
            return false;
        }
        userInfo.address = address;
    });

    $('#input-change-phone').bind("change", function(){
        let phone = $(this).val();

        if (phone.length != 10){
            alertify.notify('Số điện thoại không hợp lệ, vui lòng kiểm tra lại', "error", 3);
            $(this).val(originUserInfo.phone);
            delete userInfo.phone;
            return false;
        }
        userInfo.phone = phone;
    });

    $('#input-change-current-password').bind("change", function(){
        let currentPassword = $(this).val();
        userUpdatePassword.currentPassword = currentPassword;
    });

    $('#input-change-new-password').bind("change", function(){
        let newPassword = $(this).val();

        let regaxNewPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if (!regaxNewPassword.test(newPassword)){
            alertify.notify('Mật khẩu ít nhất 8 kí tự(chữ hoa, chữ thường, chữ số và ký tự)', "error", 3);
            $(this).val(null);
            delete userUpdatePassword.newPassword;
            return false;
        }
        if (newPassword == userUpdatePassword.currentPassword){
            alertify.notify('Mật khẩu mới không được trùng với mật khẩu cũ', "error", 3);
            $(this).val(null);
            delete userUpdatePassword.newPassword;
            return false;
        }
        userUpdatePassword.newPassword = newPassword;
    });

    $('#input-change-confirm-new-password').bind("change", function(){
        let confirmNewPassword = $(this).val();
        if (confirmNewPassword != userUpdatePassword.newPassword){
            alertify.notify("Nhập lại mật khẩu không khớp", "error", 3); 
            $(this).val(null);
            delete userUpdatePassword.confirmNewPassword;
            return false;
        }
        userUpdatePassword.confirmNewPassword = confirmNewPassword;
    });
}
//hầm cập nhật avatar người dùng
function callUserUpdateAvatar(){
    $.ajax({
        url: "/user/update-avatar",
        type: "post",
        cache: false,
        contentType: false,
        processData: false,
        data: userAvatar,
        success: function(result){
            //hiển thị thành công
            //$(".user-modal-alert-success").find("span").text(result.message);
            //$(".user-modal-alert-success").css("display","block");

            //cập nhật avatar ở navbar
            $("#navbar-avatar").attr("src", result.imageSrc);
            
            //Cập nhật origin avatar src
            originAvatarSrc = result.imageSrc;
            $("#input-change-avatar").val("");
            
        },
        error: function(error){
            // Display error 
            $(".user-modal-alert-error").find("span").text(error.responseText);
            $(".user-modal-alert-error").css("display","block");

            //reset all
            $('#input-btn-cancer-user').bind("click", () => {
            $(".user-modal-alert-error").css("display","none");
            $("#input-change-avatar").val("");
            });
        }
    });
}

// hàm cập nhật thông tin người dùng
function callUserUpdateInfo(){
    $.ajax({
        url: "/user/update-info",
        type: "post",
        data: userInfo,
        success: function(result){
            //hiển thị thành công
            //$(".user-modal-alert-success").find("span").text(result.message);
            //$(".user-modal-alert-success").css("display","block");

            // cập nhật thông tin 
            originUserInfo = Object.assign(originUserInfo, userInfo);
            
            //reset all
            $('#input-btn-cancer-user').click(() => {
                $('.user-modal-alert-success').css('display','none');
            });
        },
        error: function(error){
            // Display error    
            $(".user-modal-alert-error").find("span").text(error.responseText);
            $(".user-modal-alert-error").css("display","block");

        }
    });
}

function callLogout(){
    let timerInterval;
    Swal.fire({
        position: 'mid-end',
        title: 'Đổi mật khẩu thành công, mời đăng nhập lại sau 3 giây.',
        html: "Thời gian: <strong></strong>",
        timer: 3000,
        onBeforeOpen: () => {
            Swal.showLoading();
            timerInterval = setInterval (() => {
                Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
            }, 1000);
        },
        onClose: () => {
            clearInterval(timerInterval);
        }
      }).then((result) => {
          $.get("/logout", function() {
              location.reload();
          })
      });
}
// Cập nhật password người dùng
let callUpdateUserPassword = () => {
    $.ajax({
        url: "/user/update-password",
        type: "post",
        data: userUpdatePassword,
        success: function(result){
            //hiển thị thành công
            
            $(".user-modal-password-alert-success").find("span").text(result.message);
            $(".user-modal-password-alert-success").css("display","block");

            //Đăng xuất sau khi đổi mật khẩu
            callLogout();
        },
        error: function(error){
            // Display error    
            if (error.responseText === "{}"){
                callLogout();
            }else{
                $(".user-modal-password-alert-error").find("span").text(error.responseText);
                $(".user-modal-password-alert-error").css("display","block");
                //reset all 
                $('#input-btn-cancel-update-user-password').bind("click", () => {
                    $("#input-change-current-password").val(null);
                    $("#input-change-new-password").val(null);
                    $("#input-change-confirm-new-password").val(null);
                });
            }
        }
    });
}


$(document).ready(function(){

    originAvatarSrc = $('#user-modal-avatar').attr("src");

    // Thông tin người dùng
    originUserInfo = {
        gender:  $('#input-change-gender-male').is(":checked") ?  $('#input-change-gender-male').val() :  $('#input-change-gender-female').val(),
        address: $('#input-change-address').val(),
        phone: $('#input-change-phone').val()
    };


    //cập nhật thông tin người dùng sau khi thay đổi
    updateUserInfo();

    //Cập nhật thông tin người dùng
    $('#input-btn-update-user').bind("click", function(){

        if ($.isEmptyObject(userInfo) && !userAvatar){
            alertify.notify("Bạn chưa thay đổi thông tin", "error", 3);
            return false;
        }
        if (userAvatar){
            callUserUpdateAvatar();
            $("#user-profile-modal").modal("hide");
            alertify.notify("Cập nhật avatar thành công", "success", 3);
        }
        if (!$.isEmptyObject(userInfo)){
            callUserUpdateInfo();
            $("#user-profile-modal").modal("hide");
            alertify.notify("Cập nhật thông tin người dùng thành công", "success", 3);
        }
        
    });

    //Hủy cập nhật thông tin
    $('#input-btn-cancer-user').bind("click", function(){
        userAvatar = null;
        userInfo = {};
        //avatar
        $(".user-modal-alert-error").css("display","none");
        $('#input-change-avatar').val(null);
        $('#user-modal-avatar').attr("src", originAvatarSrc);

        //info
        (originUserInfo.gender == "male") ? $('#input-change-gender-male').click() : $('#input-change-gender-female').click();
        $('#input-change-address').val(originUserInfo.address);
        $('#input-change-phone').val(originUserInfo.phone);
    });

    //Cập nhật mật khẩu người dùng
    $('#input-btn-update-user-password').bind("click", function(){
        if (!userUpdatePassword.currentPassword || !userUpdatePassword.newPassword || !userUpdatePassword.confirmNewPassword){
            alertify.notify("Bạn phải nhập đầy đủ thông tin","error",3);
            return false;
        }

        //dialog người dùng có muốn thay đổi mật khẩu hay không
        Swal.fire({
            title: 'Bạn có chắc chắn muốn thay đổi mật khẩu?',
            text: "Bạn không thể hoàn tác lại quá trình này!",
            type: "info",
            showCancelButton: true,
            confirmButtonColor: '5298f2',
            cancelButtonColor: '#ff7675',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
          }).then(function(result){
                if (!result.value){
                    $('#input-btn-cancel-update-user-password').click();
                    return false;
                }
                callUpdateUserPassword();
        })
    });

    //Hủy cập nhật mật khẩu
    $('#input-btn-cancel-update-user-password').bind("click", () => {
        userUpdatePassword = {};

        $(".user-modal-password-alert-error").css("display","none");
        $("#input-change-current-password").val(null);
        $("#input-change-new-password").val(null);
        $("#input-change-confirm-new-password").val(null);
    });
});
