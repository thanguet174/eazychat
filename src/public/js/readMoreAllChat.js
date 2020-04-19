$(document).ready(function(){
    $("#link-read-more-all-chat").bind("click", function(){
        let skipPesonal= $("#all-chat").find("li:not(.group-chat)").length;
        let skipGroup= $("#all-chat").find("li.group-chat").length;

        setTimeout(()=> {
            $.get(`/message/read-more-all-chat/?skipPesonal=${skipPesonal}&skipGroup=${skipGroup}`, function(data){
              
            });
        },500);
    });
});