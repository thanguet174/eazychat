function callFindUser(element) {
    if(element.which === 13 || element.type === "click"){
        let keyword = $("#input-find-users-contact").val();

        $.get(`/contact/find-users/${keyword}`, function(data){
            $("#find-user ul").html(data);
            addContact(); //js/addContact.js
            removeRequestContactSent(); //js.removeRequestContact.js
        });  
    } 
}

$(document).ready( () => {
    $("#input-find-users-contact").bind("keypress", callFindUser);
    $("btn-find-users-contact").bind("click",callFindUser);
});