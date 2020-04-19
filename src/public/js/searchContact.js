// function callSeachContacts(element){
//     if(element.which === 13 || element.type === "click"){
//         let keyword = $("#searchBox").val();
//         $.get(`/contact/search-contacts/${keyword}`, function(data){
//             $("#searchBox").keyup(function(){
//                 $("#result").html('');
//                 $.getJSON({"name": "thang", "avatar": "sdhfksd"}, function(contact){
//                     $.each(contact, function(key, value){
//                         $("$result").append(data);
//                     });
//                 });
//             });
//         });  
//     }   
// }

// $(document).ready(function(){
//     $("#searchBox").click(callSeachContacts);
// }); 