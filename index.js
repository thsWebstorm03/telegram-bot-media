import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
import {
   getBoards,
   getBoardIdByName,
   getBoardLists,
   getBoardListIDByName,
   getCardlist,
   getFileUrl,
   addBoard,
   addCard,
   addList,
   addAttachment,
} from "./helper.js";

// Create a telegram bot with its API KEY
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// class - define a User Class to experess a chat user.
class User {
   constructor(status) {
      this.status = status;
      this.nickname = "";
      this.videoCount = "";
      this.file_id = "";
      this.file_name = "";
   }

   initializeExceptLang(status) {
      this.status = status;
      this.nickname = "";
      this.videoCount = "";
      this.file_id = "";
      this.file_name = "";
   }
}

// Object - store connected user list.
const telegram2user = {};

// STEP3 - send video
const createTrelloCardAndAttachVideo = async (
   MainBoardName,
   MainListName,
   chatId,
   videoFileId,
   videoFileName
) => {
   // Use Trello API to create a card and attach the video
   let boardId = await getBoardIdByName(MainBoardName);
   let current_board_id = "";
   if (boardId) {
      current_board_id = boardId;
   } else {
      const newBoard = await addBoard(MainBoardName);
      if (newBoard) {
         current_board_id = newBoard.id;
      } else {
         return {
            type: "error",
            msg: `Failed to create new Board - ${MainBoardName}`,
         };
      }
   }

   let listId = await getBoardListIDByName(current_board_id, MainListName);
   let current_list_id = "";
   if (listId) {
      current_list_id = listId;
   } else {
      const newList = await addList(MainListName, current_board_id);
      if (newList) {
         current_list_id = newList.id;
      } else {
         return {
            type: "error",
            msg: `Failed to create new List - ${MainListName}`,
         };
      }
   }

   let cardName = videoFileName ?? "New Card";
   const newCard = await addCard(cardName, current_list_id);
   console.log(newCard, "newCard");
   const attach = await addAttachment(newCard.id, videoFileId);

   if (attach) {
      await bot.sendMessage(
         chatId,
         `Trello card created with video attachment! - ${videoFileName}`
      );
      return {
         type: "success",
         msg: "Trello card created with video attachment",
      };
   } else {
      await bot.sendMessage(
         chatId,
         `Failed to create with video attachment! - ${videoFileName}`
      );
      return { type: "error", msg: "Failed to create the video." };
   }
};

// STEP3 - display Instructions
function displayInstructions(msg, first = false) {
   console.log(msg.video, "video");
   telegram2user[msg.chat.id].file_id = msg?.video?.file_id;
   telegram2user[msg.chat.id].file_name = msg?.video?.file_name;
   const text = "What do you need done? Please provide instructions";
   bot.sendMessage(msg.chat.id, text, {
      reply_markup: {
         inline_keyboard: [
            [
               {
                  text: "Send in Request",
                  callback_data: "Send in Request",
               },
            ],
            [
               {
                  text: "Edit Request",
                  callback_data: "Edit Request",
               },
            ],
         ],
         resize_keyboard: true,
         one_time_keyboard: true,
         force_reply: true,
      },
   });
}

// STEP3 - select Instructions
async function sendInstructions(msg, data) {
   telegram2user[msg.chat.id].status = "send_request";
   console.log(telegram2user[msg.chat.id].file_id, "user file id");
   switch (data) {
      case "Send in Request":
         telegram2user[msg.chat.id].selected_request = "Send in Request";
         await bot.sendMessage(msg.chat.id, "You Selected: Send in Request");
         break;
      default:
         telegram2user[msg.chat.id].selected_request = "Edit Request";
         await bot.sendMessage(msg.chat.id, "You Selected: Edit Request");
         break;
   }
   const result = await createTrelloCardAndAttachVideo(
      "Videos",
      "New List",
      msg.chat.id,
      telegram2user[msg.chat.id].file_id,
      telegram2user[msg.chat.id].file_name
   );
}

// STEP2 - select the video count
function displayVideoCountButtons(msg, first = false) {
   const text = "Please Select the following.";
   bot.sendMessage(msg.chat.id, text, {
      reply_markup: {
         inline_keyboard: [
            [
               {
                  text: "Variations",
                  callback_data: "Variations",
               },
            ],
            [
               {
                  text: "Localization",
                  callback_data: "Localization",
               },
            ],
            [
               {
                  text: "Remake using current trend",
                  callback_data: "Remake using current trend",
               },
            ],
            [
               {
                  text: "UGC",
                  callback_data: "UGC",
               },
            ],
         ],
         resize_keyboard: true,
         one_time_keyboard: true,
         force_reply: true,
      },
   });
}

// STEP2 - to select a language from a inline keyboard.
async function sendSelectVideoCount(msg, data) {
   telegram2user[msg.chat.id].status = "select_file";
   switch (data) {
      case "Variations":
         telegram2user[msg.chat.id].videoCount = "videoCount";
         await bot.sendMessage(msg.chat.id, "You Selected: videoCount");
         break;
      case "Localization":
         telegram2user[msg.chat.id].videoCount = "Localization";
         await bot.sendMessage(msg.chat.id, "You Selected: Localization");
         break;
      case "Remake using current trend":
         telegram2user[msg.chat.id].videoCount = "Remake using current trend";
         await bot.sendMessage(
            msg.chat.id,
            "You Selected: Remake using current trend"
         );
         break;
      default:
         telegram2user[msg.chat.id].videoCount = "UGC";
         await bot.sendMessage(msg.chat.id, "You Selected: UGC");
         break;
   }
   await bot.sendMessage(
      msg.chat.id,
      "please drag n drop the videos you need edited"
   );
}

// STEP1 - Greeting
async function sendGreeting(msg) {
   await bot.sendMessage(msg.chat.id, "Hello, Attila");
   await bot.sendMessage(msg.chat.id, "Please add @botExpert03");
   await bot.sendMessage(msg.chat.id, "How many videos do you need?");
   displayVideoCountButtons(msg);
}

// handler - callback after selecting a language from a inline keyboard.
bot.on("callback_query", (callbackQuery) => {
   console.log(callbackQuery.message, "call");
   if (callbackQuery.message.text == "Please Select the following.") {
      sendSelectVideoCount(callbackQuery.message, callbackQuery.data);
   }
   if (
      callbackQuery.message.text ==
      "What do you need done? Please provide instructions"
   ) {
      sendInstructions(callbackQuery.message, callbackQuery.data);
   }
});

bot.on("message", (msg) => {
   console.log(msg, "msg");

   const user = telegram2user[msg.from.id];
   const chatId = msg.chat.id;

   try {
      // ------------------------------------ STEP1 - /start - greeting ----------------------------------------
      if (msg?.text && msg.text.startsWith("/start")) {
         telegram2user[msg.from.id] = new User("select_number");
         console.log(telegram2user, "telegram2user");
         sendGreeting(msg);
         return;
      }

      if (
         user.status == "select_file" &&
         Object.keys(msg).indexOf("video") != -1
      ) {
         telegram2user[msg.from.id] = new User("send_request");
         displayInstructions(msg);
         return;
      } else {
         bot.sendMessage(
            msg.chat.id,
            "please drag n drop the videos you need edited"
         );
         return;
      }
   } catch (e) {
      console.log(e);
   }
});
