function configSocketIo(){
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
}

module.exports = {
    configSocketIo: configSocketIo
}