const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const port = process.env.REACT_APP_PORT || 9000;
const app = express();
// const jieba = require('@node-rs/jieba');

require("dotenv").config();

app.use(cors({origin: ['http://localhost:3000', 'https://bilingred-9l1ttrt8l-zacs-projects-5ebe772f.vercel.app', 'https://bilingred.vercel.app', 'https://bilingred-git-master-zacs-projects-5ebe772f.vercel.app']}));
app.use(express.json());

// routes setup
const authRoute = require("../routes/auth");
const converRoute = require("../routes/conversation");
const msgRoute = require("../routes/message");
const postRoute = require('../routes/post');
const placeRoute = require('../routes/place');
const tokenRoute = require("../routes/token");
app.use("/conversation", converRoute);
app.use("/user", authRoute);
app.use("/messages", msgRoute);
app.use("/post", postRoute);
app.use("/place", placeRoute);
app.use("/token", tokenRoute);

// connecting to mongodb database
mongoose.connect(process.env.REACT_APP_DB_URL,{
    useNewUrlParser:true
}).then(()=>{
    console.log("db connection successful");
})

const con = mongoose.connection;
try{
    con.on("open", ()=>{
        console.log("connected");
    })
}
catch(err){
    console.log(err);
}

// socket io connection

let users = [];

function addUser(userId, socketId){
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
}

function removeUser(socketId){
    users = users.filter(user => user.socketId !== socketId);
}

function getUser(id){
    return users.find((user) => user.userId === id);
}

const io = require("socket.io")(8900,{
    cors:{
        origin: ['http://localhost:3000', 'https://bilingred-9l1ttrt8l-zacs-projects-5ebe772f.vercel.app', 'https://bilingred.vercel.app', 'https://bilingred-git-master-zacs-projects-5ebe772f.vercel.app'],
    }
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("addUser", userId=>{
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("disconnect", ()=>{
        console.log("a user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })

    socket.on("sendMsg", (params) => {
        const user = getUser(params.receiverId);
        console.log(user);
        const senderId = params.senderId, message = params.text;
        if(user){
            io.to(user.socketId).emit("getMessage", {
                senderId,
                message
            })
        }    
    })

    socket.on("typing", (obj)=> {
        if(obj){
            io.emit("typing", {
                id: obj.id, name: obj.name
            })
        }
    })

    socket.on("stop-typing", (obj) => {
       
        if(obj){
            io.emit("stop-typing", {
                id: obj.id, name: obj.name
            })
        }
    });
})


// start the server 
app.listen(port, ()=>{
    console.log(`Server started on Port ${port}`)
});

module.exports = app;