const ws = window.WebSocket || window.MozWebSocket;

// shortcut:
const qs = document.querySelector.bind(document);
let connection;
let username = "";
    
const initializeConnection = (ev) => {
    friendsDisplayed = [];
    console.log("ev.Dataset", ev.currentTarget.dataset);
    username = ev.currentTarget.dataset.username;
    id = ev.currentTarget.dataset.userID;
    access_token = access_token;
    console.log("access_token: ", access_token);
    const url = qs('#chatserver').value;
    connection = new ws(url);
    console.log(`Connecting to ${url}...`);

    connection.onopen = () => {
        // fires when the server message received indicating an open connection
        console.log("WebSocket connection is open.");
        utils.showLogin();
        notify.login(username, id, access_token);
    };
    
    connection.onclose = () => {
        // fires when the server message received indicating a closed connection
        console.log("WebSocket connection is closed.");
        alert('Socket server disconnected!');
    };
    
    connection.onerror = e => {
        // fires when the server indicates a websocket error
        console.error("WebSocket error observed:", e);
    };
    
    
    connection.onmessage = e => {
        const data = JSON.parse(e.data);
        console.log(data, "onmessage");
        if (data.type =="login"){
                console.log(`${data.username} has logged in.`);
                users = data.users;
                console.log(users, "users");
                // list = `<ul>
                //     ${users.map(user => `<li>${user}</li>`).join('')}
                //     </ul>`;
                // document.querySelector("#users-list").innerHTML = list;
                // console.log(list);
                renderFriends(users);
        } else if (data.type == "chat"){
 
            console.log(`${data.username} says: ${data.text}`);
            displayMessage(data.username, data.text);
            // if (data.username == username) {
            //     document.querySelector("#chat").innerHTML += `<div class="message right"><b>${data.username}</b>: ${data.text}</div>`;                                                      
            // } else {
            //     document.querySelector("#chat").innerHTML += `<div class="message left"><b>${data.username}</b>: ${data.text}</div>`;
            // }
        } else if (data.type == "disconnect"){
            console.log(`someone has has disconnected.`);
            users = data.users;
            renderFriends(users);
        };
        /***********************************************************
         * Client-Side Logic: Your Job 
         ***********************************************************
         * Respond to the messages that are sent back to the server:
         * 
         *   1. If the data.type is "login" or "disconnent", 
         *      display the list of logged in users in the 
         *      #users-list div (right-hand panel).
         * 
         *   2. If data.type is "chat", append the chat message 
         *      to the #chat div (main panel).
         ************************************************************/

    };
};


// code that sends messages to the server:
const notify = {
    sendChat: (id, message) => {
        console.log("sendChat");
        // let parent = event.currentTarget.parentElement;
        // let message = parent.querySelector("input[name=message]").value;
        // let id_user = parent.dataset.id;
        // // take what your user typed into the message textbox
        // // and send it to the server:
        // console.log(parent, id_user);
        console.log(message, id);
        if (message !== "") {
            console.log("sending message");
            connection.send(JSON.stringify({
                type: "chat",
                text: message,
                username: username,
                recipient_id: id,
                access_token: access_token
            }));
            // parent.querySelector("input[name=message]").value = "";
        }
    },

    logout: () => {
        if (!connection) {
            return;
        }
        connection.send(JSON.stringify({
            type: "disconnect",
            username: username,
            access_token: access_token
        }));
        qs("#chatbuttontext").textContent = "Connect";
        qs("#chatbuttontext").style.color = "green";
        document.getElementById( "chatserver" ).setAttribute( "onClick", "initializeConnection(event);" );
    },

    login: (username, id, csrf) => {
        // login to the server with the username typed into the chat:
        if (!username) {
            return;
        }
        if (!connection) {
            return;
        }

        // log into server:
        connection.send(JSON.stringify({
            type: "login",
            username: username,
            access_token: csrf
        }));

        // update UI:
        utils.showChatInterface();
    }
};

const utils = {
    resetApp: () => {
        connection = null;
        utils.showElements(['#ws-status']);
        utils.hideElements(
            ['#name-display', '#chat-container', '#send-container', '#status']);
        qs("#chat").innerHTML = '';
    },

    showLogin: () => {
        // utils.hideElements(['#step1']);
        // utils.showElements(['#step2', '#ws-status']);
        
        qs("#chatbuttontext").textContent = "Disconnect";
        qs("#chatbuttontext").style.color = "red";
        document.getElementById( "chatserver" ).setAttribute( "onClick", "reset_chat();" );

    },

    showChatInterface: () => {
        renderchatbox();
        // qs("#name-display").textContent = `Signed in as ${username}.`;
        // utils.hideElements(['#step2']);
        utils.showElements(
            ['#name-display', '#chat-container', '#send-container', '#status']);
    },

    showElements: elements => {
        document.querySelectorAll(elements).forEach(elem => {
            elem.classList.remove('hidden');
        })
    },
    hideElements: elements => {
        document.querySelectorAll(elements).forEach(elem => {
            elem.classList.add('hidden');
        })
    }
};


// qs('#connect').addEventListener('click', initializeConnection);
// qs("#set-name").addEventListener("click", notify.login);
// qs('#send').addEventListener('click', notify.sendChat);
// logout when the user closes the tab:
window.addEventListener('beforeunload', notify.logout);