import session from "express-session";
import connectMongo from "connect-mongo";

let mongoStore = connectMongo(session);
//save session(mongodb)
let sessionStore = new mongoStore({
  url : process.env.DB_CONNECTION+":"+ "//" + process.env.DB_HOST + ":" + process.env.DB_PORT+ "/"+ process.env.DB_NAME,
  autoReconnect: true
});
//config session for app
let config = () => {
  ap.use(session({
    key: "express.sid",
    secret: "mySecret",
    store: sessionStore,
    resave:  true,
    saveUninitialized: false,// tắt đi để giảm bớt chi phí dư liệu
    cookie: {
      maxAge: 1000 * 60 * 30 // thời gian sống của session là 30 phút
    }
  }));
};

module.exports = {
  config: config,
  sessionStore: sessionStore
};
