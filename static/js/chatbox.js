let friendsDisplayed = [];
function toBottom(node) {
    let chatview = node;
    chatview.scrollTop = chatview.scrollHeight;
}

const reset_chat = function() {
    document.querySelector('#chatboxid').innerHTML = "";
    notify.logout();
    friendsDisplayed = [];
}


const sendmessage = function(event) {
    console.log("sendChat");
    let parent = event.currentTarget.parentElement;
    let message = parent.querySelector("input[name=message]").value;
    let id_user = parent.dataset.id;
    let messageElement = `<div class="message right">
                            <img src="${user_profile_url}">
                            <div class="bubble">
                                ${message}
                                <div class="corner"></div>
                                
                            </div>
                        </div>`;
    console.log(event.currentTarget.parentElement.parentElement.querySelector("#chat-messages"), "parent");
    let message_parent = event.currentTarget.parentElement.parentElement.querySelector("#chat-messages");
    message_parent.insertAdjacentHTML("beforeend", messageElement);
    toBottom(message_parent);
    console.log("message and id are: " + message + " " + id_user);
    notify.sendChat(id_user, message);
    parent.querySelector("input[name=message]").value = "";

}; 
const displayMessage = function(username, message) {
    let id_find_message = "messages-" + username;
    let message_parent = document.getElementById(id_find_message);
    if (message_parent) {
    
    let message_parent = document.getElementById(id_find_message).querySelector("#chat-messages");
    console.log(message);
    
    
        let thumb_url = document.getElementById(id_find_message).parentElement.parentElement.querySelector("#profilethumb").src;
        console.log(thumb_url);
        let messageElement = `<div class="message">
                            <img src="${thumb_url}">
                            <div class="bubble">
                                ${message}
                                <div class="corner"></div>
                                
                            </div>
                        </div>`
        message_parent.insertAdjacentHTML("beforeend", messageElement);
        toBottom(message_parent);
    
    } else {
        document.querySelector('#' + username).click();
        let id_find_message = "messages-" + username;
        let message_parent = document.getElementById(id_find_message).querySelector("#chat-messages");
        let thumb_url = document.getElementById(id_find_message).parentElement.parentElement.querySelector("#profilethumb").src;
        console.log(thumb_url);
        let messageElement = `<div class="message">
                            <img src="${thumb_url}">
                            <div class="bubble">
                                ${message}
                                <div class="corner"></div>
                                
                            </div>
                        </div>`
        message_parent.insertAdjacentHTML("beforeend", messageElement);
        toBottom(message_parent);
    }
};

    


const displayFriend = function(event) {
    
    let id = event.currentTarget.dataset.friendId;
    let username = event.currentTarget.dataset.friendUsername;
    let thumb_url = event.currentTarget.dataset.friendThumb;
    let email = event.currentTarget.dataset.friendEmail;
    if (!friendsDisplayed.includes(id)) {
        friendsDisplayed.push(id);
    } else {
        console.log("already displayed");
    }
    let profile_img = "https://picsum.photos/400/150";
    console.log(friendsDisplayed);
    // make a chatbox in html for this friend
    // renderchatbox();
    // renderFriends(friendsDisplayed);
    // renderFriends(friendsDisplayed);
    let right_size = (20 + 300 * friendsDisplayed.length) + "px";
    const html = `<div id="chatbox-${id}" data-chatviewid="${id}" style="right: ${right_size};">
    <div id="chatview" class="p1" style="display: block;">    	
        <div id="profile" class="animate">


            
            <p class="animate">${username}</p>
            <span>${email}</span>
        </div>
        <div id="messages-${username}">
        <div id="chat-messages" class="animate" aria-live="assertive">
            <label>Messages</label>
            
         
        </div>
        </div>
        
        <div id="sendmessage" data-id = "${id}">
            <input type="text" name="message" placeholder="Send message...">
            <button id="send" onclick="sendmessage(event)"></button>
        </div>
    
    </div>        
<img src="${thumb_url}" id="profilethumb" class="floatingImg" style="top: 20px; width: 68px; left: 108px;"></div>
    `;
    document.querySelector("#chatviews").insertAdjacentHTML("afterbegin", html);
}


const friend2Html = function(friend) {
    let username = friend.username;
    let thumb_url = friend.thumb_url;
    let email = friend.email;

    let html = `<div id="${username}" class="friend" data-friend-id="${friend.id}" data-friend-username="${username}" data-friend-thumb="${thumb_url}" data-friend-email="${email}" onclick="displayFriend(event)">
            <img src="${thumb_url}" />
            <p>
                <strong>${username}</strong>
                <span>${email}</span>
            </p>
            <div class="status available"></div>
        </div>`;

    return html;
};

const friend_off_2Html = function(friend) {
    let username = friend.username;
    let thumb_url = friend.thumb_url;
    let email = friend.email;

    let html = `<div style="background-color: #f1f4f6; cursor: initial;" id="${username}" class="friend" data-friend-id="${friend.id}" data-friend-username="${username}" data-friend-thumb="${thumb_url}" data-friend-email="${email}">
            <img src="${thumb_url}" />
            <p>
                <strong>${username}</strong>
                <span>${email}</span>
            </p>
            <div class="status inactive"></div>
        </div>`;

    return html;
};

const renderFriends = function(friends) {
    fetch(`/api/contacts`, {
        method: 'GET',
        headers: {

            'X-CSRF-TOKEN': getCookie('csrf_access_token')
        }
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            // console.log("friends", friends);
            let contacts = data.map(contact => {
                return contact;
                });
            // console.log(contacts, "contacts");
            list_logged_in = contacts.filter(contact => {
                return friends.includes(contact.id);
            });
            list_disconnected = contacts.filter(contact => {
                return !friends.includes(contact.id);
            });
            // console.log(list_logged_in);
            const html = list_logged_in.map(friend2Html).join('\n');
            document.querySelector("#friends").innerHTML = html;
            const html_off = list_disconnected.map(friend_off_2Html).join('\n');
            console.log("html_off", html_off);
            console.log("disconnected", list_disconnected);
            document.querySelector("#friends").innerHTML += html_off;
                });

            };



const renderchatbox = function() {

    const chatbox = `
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet' type='text/css'>

    <div id="chatbox">
        <div id="friendslist">
        <div class="fa fa-times-circle" style="font-size:20px; color:brown; float:right; margin-top: 25px; margin-right: 15px; cursor: pointer;" onclick="reset_chat()"></div>
            <div id="topmenu">
                <span class="friends" ></span>
                
            </div>


            <div id="friends" aria-live="polite">
                
                
            </div>                
            
        </div>	
        
        
    </div>	
    <div id="chatviews">
        </div>  
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>`;
    document.querySelector('#chatboxid').innerHTML = chatbox;
};

