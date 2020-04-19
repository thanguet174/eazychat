$(document).ready(function(){
    $("#link-read-more-notif").bind("click", function(){
        let skipNumber = $("ul.list-notifications").find("li").length;
        setTimeout(()=> {
            $.get(`/notification/read-more/?skipNumber=${skipNumber}`, function(notifications){
                if (!notifications.length){
                    return false;
                }
                notifications.forEach(function(notification) {
                    $("ul.list-notifications").append(`<li>${notification}</li>`);
                });
            });
        },500);
    });
});