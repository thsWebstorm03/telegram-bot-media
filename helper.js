import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiKey = process.env.TRELLO_API_KEY;
const apiToken = process.env.TRELLO_API_TOKEN;
// const boardId = process.env.TRELLO_BOARD_ID;

export const getBoards = async () => {
   const apiURL = `https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${apiToken}`;
   try {
      const response = await fetch(apiURL, { method: "GET" });

      if (response.ok) {
         const responseBody = await response.json();
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export const getBoardIdByName = async (boardName) => {
   const boards = await getBoards();
   const matchingBoard = boards.find((board) => board.name === boardName);

   if (matchingBoard) {
      console.log(`Board "${boardName}" found with ID: ${matchingBoard.id}`);
      return matchingBoard.id;
   } else {
      console.log(`Board "${boardName}" not found.`);
      return null;
   }
};

export const getBoardLists = async (boardId) => {
   const listsUrl = `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${apiToken}`;

   try {
      const response = await fetch(listsUrl);
      const lists = await response.json();

      console.log("Lists for the board:");
      lists.forEach((list) => {
         console.log(`- ${list.name} (ID: ${list.id})`);
      });

      return lists;
   } catch (error) {
      console.error("Error:", error);
      return null;
   }
};

export const getBoardListIDByName = async (boardId, listName) => {
   const lists = await getBoardLists(boardId);
   const matchinglist = lists.find((list) => list.name === listName);

   if (matchinglist) {
      console.log(`List "${listName}" found with ID: ${matchinglist.id}`);
      return matchinglist.id;
   } else {
      console.log(`List "${listName}" not found.`);
      return null;
   }
}

export const getCardlist = async (id) => {
   const apiURL = `https://api.trello.com/1/cards/${id}/list?key=${apiKey}&token=${apiToken}`;
   try {
      const response = await fetch(apiURL, { method: "GET" });

      if (response.ok) {
         const responseBody = await response.json();
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export const getFileUrl = async (fileId) => {
   const apiUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;

   try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.ok) {
         const fileUrl = `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
         return fileUrl;
      } else {
         console.error("Error getting file information:", data.description);
         return null;
      }
   } catch (error) {
      console.error("Error:", error);
      return null;
   }
};

export const addBoard = async (name) => {
   const apiURL = `https://api.trello.com/1/boards?key=${apiKey}&token=${apiToken}&name=${name}`;
   try {
      const response = await fetch(apiURL, { method: "POST" });

      if (response.ok) {
         const responseBody = await response.json();
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export const addList = async (name, idBoard) => {
   const apiURL = `https://api.trello.com/1/lists?key=${apiKey}&token=${apiToken}&name=${name}&idBoard=${idBoard}`;
   try {
      const response = await fetch(apiURL, { method: "POST" });

      if (response.ok) {
         const responseBody = await response.json();
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export const addCard = async (chatId, name, idList) => {
   const apiURL = `https://api.trello.com/1/cards?key=${apiKey}&token=${apiToken}&name=${name}&idList=${idList}`;
   try {
      const response = await fetch(apiURL, { method: "POST" });

      if (response.ok) {
         const responseBody = await response.json();
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export const addAttachment = async (id, videoFileId) => {
   const apiURL = `https://api.trello.com/1/cards/${id}/attachments?key=${apiKey}&token=${apiToken}`;
   const fileUrl = await getFileUrl(videoFileId);
   try {
      const response = await fetch(apiURL, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            url: fileUrl,
         }),
      });

      if (response.ok) {
         const responseBody = await response.json();
         console.log(responseBody)
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export const addDescription = async (id, description) => {
   const apiURL = `https://api.trello.com/1/cards/${id}?key=${apiKey}&token=${apiToken}`;
   try {
      const response = await fetch(apiURL, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            desc: description,
         }),
      });

      if (response.ok) {
         const responseBody = await response.json();
         console.log(responseBody)
         return responseBody;
      } else {
         console.error("Error creating Trello board:", response.statusText);
         return false;
      }
   } catch (error) {
      console.error("Error:", error);
      return false;
   }
};

export default getBoards


// const current_board_id = await getBoardIdByName("test2");
// console.log(current_board_id, "current_board_id");

// const current_board_lists = await getBoardLists(current_board_id);
// console.log(current_board_lists, "current_board_lists");

// const current_list_id = await getBoardListIDByName(current_board_id, "New List");
// console.log(current_list_id, "current_list_id");

// const newBoard = await addBoard("New Board Name1");
// console.log(newBoard);

// const newList = await addList("New List", boardId);
// console.log(newList);

// const newCard = await addCard("New Card2", '658353eeb369bb03ef922315');
// console.log(newCard);
// 6583542d57b5fbf157e73534
// 6583546ea5a2719e4239b490

// const cardlist = await getCardlist('6583542d57b5fbf157e73534');
// console.log(cardlist);

// const attach = await addAttachment(
//    "6583542d57b5fbf157e73534",
//    "BAACAgUAAxkBAANpZYKziL4etIJeLaHVwqN37Ytg_jIAAvYMAAIxFBlUVqZGKyrXpHUzBA"
// );
// console.log(attach);


