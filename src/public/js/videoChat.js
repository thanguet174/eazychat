// function videoChat(divId){
//     $(`#video-chat-${divId}`).unbind("click").on('click',function(){
//         let targetId = $(this).data("chat");
//         let callerName = $("#navbar-username").text();

//         let dataToEmit = {
//             listenerId: targetId,
//             callerName: callerName 
//         }

//         //step 1: kiểm tra user online : người gọi
//         socket.emit("caller-check-listener-online-or-not", dataToEmit);

//     });
// }

// $(document).ready(function() {
//     //step 2 Gửi hông báo người dùng ko online
//     socket.on("server-send-listener-is-offline", function(){
//         alertify.notify("Người dùng không trực tuyến", "error",5);
//     });

//     //tạo peerid
//     let getPeerId = "";
//     const peer =  new Peer();
//     peer.on("open", function(peerId){
//         getPeerId = peerId;
        
//     console.log(getPeerId);
//     });
//     //step 3 của lintener
//     socket.on("server-request-peerid-of-listener", function(response){
//         let listenerName = $("#navbar-username").text();
//         let dataToEmit = {
//             caller: response.callerId,
//             listenerId: response.listenerId,
//             callerName: response.callerName,
//             listenerName: listenerName,
//             listenerPeerId: getPeerId
//         }
//         //step 4: cuar listener guiwr du lieu kiem socketid
//         socket.emit("listener-emit-peer-id-to-server", dataToEmit);
//     });
//     // //step 5: caller
//     // socket.on("server-send-peerid-of-listener-to-caller", function(response){
    
//     //     let dataToEmit = {
//     //         caller: response.callerId,
//     //         listenerId: response.listenerId,
//     //         callerName: response.callerName,
//     //         listenerName: response.listenerName,
//     //         listenerPeerId: response.listenerPeerId
//     //     };

//     // //step 6: gui yeu cau goi cho listener
//     // socket.emit("caller-request-call-to-server", dataToEmit);
//     //     let timerInterval;
//     //     Swal.fire({
//     //         title: `Đang gọi cho &nbsp; <span style="color": "#2EEC71">${response.listenerName}</span>&nbsp; <i class="fa fa-volume-control-phone"></i>`,
//     //         html: "Thời gian: <strong style='color: #d43f3a;'></strong><button id='btn-cancel-call' class='btn btn-danger'>Hủy cuộc gọi</button>",
//     //         backdrop: "rgba(85, 85, 85, 0.4)",
//     //         width: "52rem",
//     //         allowOutsideClick: false,
//     //         timer: 30000,
//     //         onBeforeOpen: () => {
//     //             $("#btn-cancel-call").unbind("click").on("click", function(){
//     //                 Swal.close();
//     //                 clearInterval(timerInterval);
//     //                 //step 7: 
//     //                 socket.emit("caller-cancel-request-call-to-server", dataToEmit);
//     //             });
//     //             Swal.showLoading();
//     //             timerInterval = setInterval (() => {
//     //                 Swal.getContent().querySelector("strong").textContent = Math.ceil(Swal.getTimerLeft() / 1000);
//     //             }, 1000);
//     //         },
//     //         onClose: () => {
//     //             clearInterval(timerInterval);
//     //         }
//     //     }).then((result) => {
//     //         return false;
//     //     });
//     // });
// });