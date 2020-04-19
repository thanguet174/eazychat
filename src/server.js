import express from "express";
import bodyParser from "body-parser";
import {check,validationResult} from "express-validator/check";
import connectFlash from "connect-flash";
import session from "express-session";
import connectMongo from "connect-mongo";
import {auth,user_Controller, contact_Service, notification_Service, message_Service, chatGroup_Service} from "./services/index";
import passport from "passport";
import initPassportLocal from "./controllers/passportController/local";
import {transSuccess} from "./lang/vi";
import {userValid} from "./validation/index";
import http from "http";
import socketio from "socket.io";
import initSockets from "./sockets/index";
import passportSocketIo from "passport.socketio";
import cookieParser from "cookie-parser";
import multer from "multer";
import fsExtra from "fs-extra";
import connectDB from "./config/connectDB";
import {bufferToBase64, lastItemOfArray, convertTimeStampToHumanTime} from "./helper/clientHelper"; 
//init app
let app = express();
//init server with socketio & express app
let server = http.createServer(app);
let io = socketio(server);

connectDB();
//demo // DEBUG:

//config session
let mongoStore = connectMongo(session);
//save session(mongodb)
let sessionStore = new mongoStore({
  url : process.env.DB_CONNECTION + ":" + "//" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME,
  autoReconnect: true
});
//config session for app
let config = () => {
  app.use(session({
    key: process.env.SESSSION_KEY,
    secret: process.env.SESSSION_SECRET,
    store: sessionStore,
    resave:  true,
    saveUninitialized: false,// tắt đi để giảm bớt chi phí dư liệu
    cookie: {
      maxAge: 1000 * 60 * 60// thời gian sống của session
    }
  }));
};

//module.export = config;

config(app);

//cấu hình config

app.use(express.static("./src/public"));
app.set("view engine", "ejs");
app.set("views","./src/views");

//enable post data for request
app.use(bodyParser.urlencoded({extend: true}));
// enable flash message
app.use(connectFlash());
//user cookie parser, tạo cookie để láy id của người dùng
app.use(cookieParser());
//config passport
app.use(passport.initialize());
app.use(passport.session());

//lang/vi.js
export const transValidation = {
  username_incorrect: "Tên tối đa 24 kí tự",
  email_incorrect: "Email phải có dạng example@gmail.com", // kiem tra email co hop le
  gender_incorrect: "Giới tính của t đâu !!!", // kiem tra gioi tinh
  password_incorrect: "Mật khẩu ít nhất 8 kí tự(chữ hoa, chữ thường, chữ số và ký tự)", // kiem tra password
  password_confirmation_incorrect: "Mật khẩu không khớp" // kiem tra nhap lai password
};

// valadate duwx lieu
let register = [
  check("email",transValidation.email_incorrect)
    .isEmail()
    .trim(),
  check("username",transValidation.username_incorrect)
    .isLength({min:3, max:24}),
  check("gender", transValidation.gender_incorrect)
    .isIn(["male", "female"]),
  check("password", transValidation.password_incorrect)
    .isLength({min: 8})
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/),
  check("password_confirmation", transValidation.password_confirmation_incorrect)
    .custom( (value, {req}) =>{
      return value === req.body.password;
    })
];
module.exports = {
  register : register
};
// init passportlocal
initPassportLocal();
//router
let router = express.Router();
//init router
let initRoutes = (app) => {

  let checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
      return res.redirect("/loginRegister");
    }
    next();
  }

  let checkLoggedOut = (req, res, next) => {
    if (req.isAuthenticated()){
      return res.redirect("/");
    }
    next();
  }

  //homeControllers
  router.get("/", checkLoggedIn, async(req,res) =>{
    //lấy 10 user contact
    let notifications = await notification_Service.getNotifications(req.user._id);
    // lấy tổng số notif chưa đọc
    let countNotifUnread = await notification_Service.countNotifUnread(req.user._id);

    //get contact 10 item
    let contacts = await contact_Service.getContacts(req.user._id);
    //get contact send 10 item
    let contactsSent = await contact_Service.getContactsSent(req.user._id);
    //get contact received 10 item
    let contactsReceived = await contact_Service.getContactsReceived(req.user._id);
    //count contacts
    let countAllContacts = await contact_Service.countAllContacts(req.user._id);
    let countAllContactsSent = await contact_Service.countAllContactsSent(req.user._id);
    let countAllContactsReceived = await contact_Service.countAllContactsReceived(req.user._id);

    let getAllConversationItems = await message_Service.getAllConversationItems(req.user._id);
    let allConversations = getAllConversationItems.allConversations;
    let userConversations = getAllConversationItems.userConversations;
    let groupConversations = getAllConversationItems.groupConversations;
    //tất cả tin nhắn. mã 30
    let allConversationWithMessages = getAllConversationItems.allConversationWithMessages;
    return res.render("main/master", {
      errors: req.flash("errors"),
      success: req.flash("success"),
      user: req.user,
      notifications: notifications,
      countNotifUnread: countNotifUnread,
      contacts: contacts,
      contactsSent: contactsSent,
      contactsReceived: contactsReceived,
      countAllContacts: countAllContacts,
      countAllContactsSent: countAllContactsSent,
      countAllContactsReceived: countAllContactsReceived,
      allConversations: allConversations,
      userConversations: userConversations,
      groupConversations: groupConversations,
      allConversationWithMessages: allConversationWithMessages,
      bufferToBase64: bufferToBase64,
      lastItemOfArray: lastItemOfArray,
      convertTimeStampToHumanTime: convertTimeStampToHumanTime
    });
  });

  // authControllers
  router.get("/loginRegister", checkLoggedOut, (req,res) =>{
    res.render("auth/master", {
      errors: req.flash("errors"),
      success: req.flash("success")
    });
  });
  //
  router.post("/register", checkLoggedOut, register, async(req, res) =>{
    //authController
    let errorArr = [];
    let successArr = [];
    let validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()){
      let errors = Object.values(validationErrors.mapped());
        errors.forEach(item => {
          errorArr.push(item.msg);
        });

        req.flash("errors", errorArr);
        return res.redirect("/loginRegister"); // chuyển hướng khi có lỗi
    }
    try {
      let createUserSuccess = await auth.register(req.body.email, req.body.username, req.body.gender, req.body.password);
      successArr.push(createUserSuccess);

      req.flash("success", successArr);
      return res.redirect("/loginRegister");
    } catch (error) {
      errorArr.push(error);
      req.flash("errors", errorArr);
      return res.redirect("/loginRegister");
    }
  });

  router.post("/login", checkLoggedOut, passport.authenticate('local', {
    successRedirect: "/", // chuyen huong ve man hinh home
    failureRedirect: "/loginRegister", // neu gap loi redirect ve trang loginregister
    successFlash: true,
    failureFlash: true
  }));


  router.get("/logout", checkLoggedIn, (req,res) => {
    req.logout();
    req.flash("success", transSuccess.logoutSuccess);
    return res.redirect("/loginRegister");
  });

  //update avatar
  router.post("/user/update-avatar", checkLoggedIn, user_Controller.updateAvatar);
  //update info
  router.post("/user/update-info", checkLoggedIn, userValid.updateInfo, user_Controller.updateInfo);
  //update password
  router.post("/user/update-password", checkLoggedIn,  userValid.updatePassword, user_Controller.updatePassword);
  // Tìm người dùng
  router.get("/contact/find-users/:keyword", checkLoggedIn, async (req, res) => {
    let errorArr = [];
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        let errors = Object.values(validationErrors.mapped());
        errors.forEach(item => {
            errorArr.push(item.msg);
        });

        return res.status(500).send(errorArr);
    }

    try{
        let currentUserId = req.user._id;
        let keyword = req.params.keyword;

        let users = await contact_Service.findUserContact(currentUserId, keyword);
        return res.render("main/contact/sections/_findUsersContact", {users});
    }catch(error){
        return res.status(500).send(error);
    }
  });

  //Gửi lời mờ kết bạn
  router.post("/contact/add-new", checkLoggedIn, async (req, res) => {
    try{
        let currentUserId = req.user._id;
        let contactId = req.body.uid;

        let newContact = await contact_Service.addNew(currentUserId, contactId);
        return res.status(200).send({success: !!newContact})
    }catch(error){
        return res.status(500).send(error);
    }
  });

  //xóa danh bạ
  router.delete("/contact/remove-contact", checkLoggedIn, async (req, res) => {
    try{
        let currentUserId = req.user._id;
        let contactId = req.body.uid;

        let removeContact = await contact_Service.removeContact(currentUserId, contactId);
        return res.status(200).send({success: !!removeContact});
    }catch(error){
        return res.status(500).send(error);
    }
  });
  //tro chuyen
  //Xóa lời mời kêt bạn
  router.delete("/contact/remove-request-contact-sent", checkLoggedIn, async (req, res) => {

    try{
        let currentUserId = req.user._id;
        let contactId = req.body.uid;

        let removeReq = await contact_Service.removeRequestContactSent(currentUserId, contactId);
        return res.status(200).send({success: !!removeReq});
    }catch(error){
        return res.status(500).send(error);
    }
  });
  //Xoá yêu cầu kết bạn ở tab yêu cầu kết bạn
  router.delete("/contact/remove-request-contact-received", checkLoggedIn, async (req, res) => {

    try{
      let currentUserId = req.user._id;
      let contactId = req.body.uid;

      let removeReq = await contact_Service.removeRequestContactReceived(currentUserId, contactId);
      return res.status(200).send({success: !!removeReq});
  }catch(error){
      return res.status(500).send(error);
    }
  });
  //đồng ý lời mời kết bạn
  router.put("/contact/approve-request-contact-received", checkLoggedIn, async (req, res) => {
    try{
      let currentUserId = req.user._id;
      let contactId = req.body.uid;
      
      let approveReq = await contact_Service.approveRequestContactReceived(currentUserId, contactId);

      return res.status(200).send({success: !!approveReq});
    }catch(error){
      return res.status(500).send(error);
    }
  });
  //hiển thị thêm danh bạ
  router.get("/contact/read-more-contacts", checkLoggedIn, async (req, res) => {
    try{
      let skipNumberContacts = +(req.query.skipNumber);
      
      let newContactUsers = await contact_Service.readMoreContacts(req.user._id, skipNumberContacts);
      return res.status(200).send(newContactUsers);
    }catch(error){
        return res.status(500).send(error);
    }
  });
  //hiển thị thêm đang chờ xác nhận
  router.get("/contact/read-more-contacts-sent", checkLoggedIn, async (req, res) => {
    try{
      let skipNumberContacts = +(req.query.skipNumber);

      let newContactUsers = await contact_Service.readMoreContactsSent(req.user._id, skipNumberContacts);
      return res.status(200).send(newContactUsers);
    }catch(error){
        return res.status(500).send(error);
    }
  });
  // hiển thị thêm yêu cầu kết bạn
  router.get("/contact/read-more-contacts-received", checkLoggedIn, async (req, res) => {
    try{
      let skipNumberContacts = +(req.query.skipNumber);

      let newContactUsers = await contact_Service.readMoreContactsReceived(req.user._id, skipNumberContacts);
      return res.status(200).send(newContactUsers);
    }catch(error){
        return res.status(500).send(error);
    }
  });
  //xem thêm thông báo
  router.get("/notification/read-more", checkLoggedIn, async(req,res) => {
    
    try{
        let skipNumberNotification = +(req.query.skipNumber);
        
        let newNotifications = await notification_Service.readMore(req.user._id, skipNumberNotification);
        return res.status(200).send(newNotifications);
    }catch(error){
        return res.status(500).send(error);
    }
  });

  router.put("/notification/mark-all-as-read", checkLoggedIn, async(req,res) => {
    
    try{
        let mark = await notification_Service.markAllAsRead(req.user._id, req.body.targetUsers);
        return res.status(200).send(mark);
    }catch(error){
        return res.status(500).send(error);
    }
  });
  // nhắn tin biểu tượng cảm xúc
  router.post("/message/add-new-text-emoji", checkLoggedIn,  async(req,res) => {  
    try{
      let sender = {
        id: req.user._id,
        name: req.user.username,
        avatar: req.user.avatar
      };

      let receiverId = req.body.uid;
      let messageVal = req.body.messageVal;
      let isChatGroup = req.body.isChatGroup;

      let newMessage = await message_Service.addNewTextEmoji(sender,receiverId,messageVal,isChatGroup);
      return res.status(200).send({message: newMessage});
    }catch(error){
      return res.status(500).send(error); 
    }
  });
  
  //dùng để chat image
  let storageImageChat = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/chat/message");
    },
    filename: (req, file, callback) => {
        // kiểm tra file ảnh có hợp lệ hay không
    let math = ["image/png", "image/jpg", "image/jpeg"];
    if (math.indexOf(file.mimetype) === -1){
        return callback("Kiểu file không hợp lệ", null);
    }

    // lưu tên file tránh trường hợp bị trùng tên
    let imageName = file.originalname;
    callback(null, imageName);
    }
  });
  
  let imageMessageUploadFile = multer({
    storage: storageImageChat,
  }).single("my-image-chat");

  //chat image
  router.post("/message/add-new-image", checkLoggedIn, (req,res) => {  
    imageMessageUploadFile(req,res, async (error) => {
      if (error){
        if(error.message){
          return res.status(500).send("Kiểu file không hợp lệ");
        }
        return res.status(500).send(error);
      }
      try{
        let sender = {
          id: req.user._id,
          name: req.user.username,
          avatar: req.user.avatar
        }
        let receiverId = req.body.uid;
        let messageVal = req.file;
        let isChatGroup = req.body.isChatGroup;
  
        let newMessage = await message_Service.addNewImage(sender, receiverId, messageVal, isChatGroup);
        await fsExtra.remove(`src/public/images/chat/message/${newMessage.file.fileName}`);
        return res.status(200).send({message: newMessage});
      }catch(error){
        return res.status(500).send(error); 
      }
    });
  });

  
  //dùng đề chat file
  let storageAttachmentChat = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "src/public/images/chat/message");
    },
    filename: (req, file, callback) => {
    // lưu tên file tránh trường hợp bị trùng tên
    let attachmentName = file.originalname;
    callback(null, attachmentName);
    }
  });
  
  let attachmentMessageUploadFile = multer({
    storage: storageAttachmentChat,
  }).single("my-attachment-chat");
  //chat file
  router.post("/message/add-new-attachment", checkLoggedIn, (req,res) => {  
    attachmentMessageUploadFile(req,res, async (error) => {
      if (error){
        if(error.message){
          return res.status(500).send("lỗi");
        }
        return res.status(500).send(error);
      }
      try{
        let sender = {
          id: req.user._id,
          name: req.user.username,
          avatar: req.user.avatar
        }
        let receiverId = req.body.uid;
        let messageVal = req.file;
        let isChatGroup = req.body.isChatGroup;
  
        let newMessage = await message_Service.addNewAttactment(sender, receiverId, messageVal, isChatGroup);
        

        await fsExtra.remove(`src/public/images/chat/message/${newMessage.file.fileName}`);
        return res.status(200).send({message: newMessage});
      }catch(error){
        return res.status(500).send(error); 
      }
    });
  });

  router.get("/message/read-more-all-chat/", checkLoggedIn, async(req,res) => {  
    try{
      let skipPersonal = +(req.query.skipPersonal);
      let skipGroup = +(req.query.skipGroup);
      
      let newAllConversation = await message_Service.readMoreAllChat(req.user._id, skipPersonal,skipGroup);
      return res.status(200).send(newAllConversation);
    }catch(error){
      return res.status(500).send(error);
    }
  });

  router.get("/message/read-more", checkLoggedIn, async(req,res) => {  
    try{
      let skipMessage = +(req.query.skipMessage);
      let targetId = req.query.targetId;
      let chatInGroup = (req.query.chatInGroup === "true");
      
      let newMessages = await message_Service.readMore(req.user._id, skipMessage, targetId, chatInGroup);
     
      let dataToRender =  {
        newMessages:newMessages,
        bufferToBase64: bufferToBase64,
        user: req.user
      };

      let rightSideData = await renderFile(".src/views/main/readMoreMessages/_rightSide.ejs", dataToRender);
      let imageModalData = await renderFile(".src/views/main/readMoreMessages/_imageModal.ejs", dataToRender);
      let attachmentModalData = await renderFile(".src/views/main/readMoreMessages/_attactmentModal.ejs", dataToRender);

      return res.status(200).send({
        rightSideData: rightSideData,
        imageModalData: imageModalData,
        attachmentModalData: attachmentModalData
      });
    }catch(error){
      return res.status(500).send(error);
    }
  });

  router.get("/contact/search-friends/:keyword", checkLoggedIn, async (req, res) => {
    try{
        let currentUserId = req.user._id;
        let keyword = req.params.keyword;

        let users = await contact_Service.searchFriends(currentUserId, keyword);
        return res.render("main/groupChat/sections/_searchFriends", {users});
    }catch(error){
        return res.status(500).send(error);
    }
  });

  router.get("/contact/search-contacts/:keyword", checkLoggedIn, async (req, res) => {
    try{
        let currentUserId = req.user._id;
        let keyword = req.params.keyword;

        let users = await contact_Service.searchFriends(currentUserId, keyword);
        console.log(users);
        return res.render("main/contact/sections/_searchContact", {users});
    }catch(error){
        return res.status(500).send(error);
    }
  });


  router.post("/group-chat/add-new", checkLoggedIn, async (req, res) => {
    try{
        let currentUserId = req.user._id;
        let arrayIds = req.body.arrayIds;
        let groupChatName = req.body.groupChatName;

        let groupChat = await chatGroup_Service.addGroup(currentUserId, arrayIds,groupChatName);
        return res.status(200).send({groupChat: groupChat});
      
    }catch(error){
        return res.status(500).send(error);
    }
  });
  app.use("/",router);
};

module.export = initRoutes;

//init all router 
initRoutes(app);

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: process.env.SESSSION_KEY,
  secret: process.env.SESSSION_SECRET,
  store: sessionStore,
  success: (data,accept) => {
    if (!data.user.logged_in){
      //khi người dùng chưa đăng nhập 
      return accept("Invalid  user.", false);
    }
    return accept(null, true);
  },
  fail: (data, message, error, accept) => {
    if (error){
      console.log("failed connection to socket.io:", message);
      return accept(new Error(message), false);
    }
  }
}));
//init all socket
initSockets(io);

//log ra man hinh
server.listen(process.env.APP_PORT, process.env.APP_HOST,() => {
  console.log("Run: " + process.env.APP_HOST + ":" + process.env.APP_PORT);
});
