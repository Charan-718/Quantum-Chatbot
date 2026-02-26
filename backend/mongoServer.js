import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   CONNECT
========================= */

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ MongoDB connected"))
.catch(err=>console.error(err));


/* =========================
   SCHEMA
========================= */

const messageSchema = new mongoose.Schema({

  sender:String,
  text:String,
  createdAt:{
    type:Date,
    default:Date.now
  }

});


const conversationSchema = new mongoose.Schema({

  title:String,

  messages:[messageSchema],

  createdAt:{
    type:Date,
    default:Date.now,
    expires:60*60*24*30   // auto delete after 30 days
  }

});


const Chat =
mongoose.model(
  "Chat",
  conversationSchema,
  "chats"
);


const Research =
mongoose.model(
  "Research",
  conversationSchema,
  "research"
);


const getModel =
(mode)=>
mode==="research"
?Research
:Chat;


/* =========================
   CREATE NEW CHAT
========================= */

app.post("/history/start", async(req,res)=>{

  try{

    const { firstMessage, mode } = req.body;

    const Model = getModel(mode);

    const convo =
    await Model.create({

      title:firstMessage,

      messages:[
        {
          sender:"user",
          text:firstMessage
        }
      ]

    });

    res.json(convo);

  }
  catch{

    res.status(500).json({
      error:"start failed"
    });

  }

});


/* =========================
   ADD MESSAGE
========================= */

app.post("/history/:mode/:id/message", async(req,res)=>{

  try{

    const { mode, id } = req.params;

    const { sender, text } = req.body;

    const Model = getModel(mode);

    await Model.findByIdAndUpdate(

      id,

      {
        $push:{
          messages:{
            sender,
            text
          }
        }
      }

    );

    res.json({
      success:true
    });

  }
  catch{

    res.status(500).json({
      error:"message save failed"
    });

  }

});


/* =========================
   GET ALL CONVERSATIONS
========================= */

app.get("/history/:mode", async(req,res)=>{

  try{

    const Model =
    getModel(req.params.mode);

    const data =
    await Model.find()
    .select("_id title createdAt")
    .sort({createdAt:-1});

    res.json(data);

  }
  catch{

    res.status(500).json({
      error:"fetch failed"
    });

  }

});


/* =========================
   GET FULL CONVERSATION
========================= */

app.get("/history/:mode/:id", async(req,res)=>{

  try{

    const Model =
    getModel(req.params.mode);

    const convo =
    await Model.findById(req.params.id);

    res.json(convo);

  }
  catch{

    res.status(500).json({
      error:"fetch convo failed"
    });

  }

});


/* =========================
   DELETE CONVERSATION
========================= */

app.delete("/history/:mode/:id", async(req,res)=>{

  try{

    const Model =
    getModel(req.params.mode);

    await Model.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success:true
    });

  }
  catch{

    res.status(500).json({
      error:"delete failed"
    });

  }

});


app.listen(5000,()=>{

  console.log(
    "🚀 Mongo history server running"
  );

});