"use strict";
dragElement(document.getElementById("chat_window2"));
var objDiv = document.getElementById("messagesList");
function progressBar() {
    var winScroll = objDiv.scrollTop || objDiv.scrollTop;
    var height = objDiv.scrollHeight - objDiv.clientHeight;
    var scrolled = (winScroll / height) * 100;
    document.getElementById("myBar").style.width = scrolled + "%";
}

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect([0, 1000, 5000, 6000, 7000, 8000, 9000, 10000, null])
    .configureLogging(signalR.LogLevel.Information)
    .build();
//Keeps trying to reconnect forever every 5 seconds
async function connect(conn) {
    conn.start().catch(e => {
        sleep(5000);
        console.log("Reconnecting Socket");
        connect(conn);
    }
    )
}

connection.onclose(function (e) {
    connect(connection);
});

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;
Notification.requestPermission();

connection.on("ReceiveMessage", function (user, message) {
    var mainDiv = document.createElement('div');
    mainDiv.classList.add("d-flex", "justify-content-end", "mb-4", "entire_msg");

    //image container
    var imgDiv = document.createElement('div');
    imgDiv.className = "img_cont_msg";

    var theimg = document.createElement('img');
    theimg.src = '/img/usuario_padrao_azul_cropped.png';
    theimg.classList.add("rounded-circle", "user_img_msg");
    imgDiv.innerHTML = theimg.outerHTML;

    //time container
    var timeSpan = document.createElement("span");
    timeSpan.textContent = current_time();
    timeSpan.className ="msg_time_send";

    //'<span class="msg_time_send>' + '9:10 AM, Today ' + '</span>'

    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = user + ': ' + msg;
    var div = document.createElement("div");

    
    if (user != document.getElementById("userInput").value) {
        div.className = "msg_cotainer";
        mainDiv.className = "d-flex justify-content-start mb-4";
        div.textContent = encodedMsg;
        div.innerHTML = timeSpan.outerHTML + encodedMsg;
        mainDiv.innerHTML = imgDiv.outerHTML + div.outerHTML;
    } else {
        div.className = "msg_cotainer_send";
        div.textContent = encodedMsg;
        div.innerHTML = encodedMsg + timeSpan.outerHTML;
        mainDiv.innerHTML = div.outerHTML + imgDiv.outerHTML;
        
    }

    document.getElementById("messagesList").appendChild(mainDiv)
    objDiv.onscroll = function () { progressBar() };
    //checkScrollPos();
    move_down();

    document.getElementById("messageInput").value = "";

    notifyMe(user + ':' + message);
    
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    hasConnectedWarning("Successfully established a chat connection");
    objDiv.onscroll = function () { progressBar() };
    //Start section
    changeName();
    public_system_message("Joined chat room \n");

}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    //event.target.value = "";
    //notifyMe(user+":"+message);
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());
        
    });
    
    event.preventDefault();
    change_message_number_indicator(count_messages());
});

document.getElementById("messageInput").addEventListener("keyup", function (event) {
    var user = document.getElementById("userInput").value;
    var message = document.getElementById("messageInput").value;
    if (event.keyCode === 13) {
        //notifyMe(user+":"+message);
        change_message_number_indicator(count_messages());
        connection.invoke("SendMessage", user, message).catch(function (err) {

            return console.error(err.toString());

        });
        //event.target.value = "";
    }
    event.preventDefault();
    
});

function hasConnectedWarning(message) {
    var encodedMsg = message;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

function public_system_message(message) {

    var user = "null";
    if (user != null) {
        user = document.getElementById("userInput").value;
    }
    document.getElementById("userInput").value;
    var message = message;
    var encodedMsg = message;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
    //event.target.value = "";
    objDiv.onscroll = function () { progressBar() };
    move_down();
    notifyMe(user+":"+message);
    connection.invoke("SendMessage", user, message).catch(function (err) {
        return console.error(err.toString());

    });


}

function move_down() {
    var objDiv = document.getElementById("messagesList");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function hide_UnhideButton(id) {
    var x = document.getElementById(id);
    if (x.style.visibility === "hidden") {
        x.style.visibility = "visible";
        hide_UnhideButton("float-chat-text");
    } else {
        x.style.visibility = "hidden";
        hide_UnhideButton("float-chat-text");
    }
}

function hide_UnhideButtonv2(id) {
    var x = document.getElementById(id);
    if (x.style.visibility === "hidden") {
        x.style.visibility = "visible";
    } else {
        x.style.visibility = "hidden";
    }
}

function current_time() {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " às "
        + currentdate.getHours() + ":"
        + ('0' +(currentdate.getMinutes() + 1)).slice(-2); // currentdate.getMinutes()(
    return datetime;
}

function count_messages() {
    var counter = document.querySelectorAll('.entire_msg').length;
    
    return counter;
}

function change_message_number_indicator( value) {
    document.getElementById("msg_count").textContent = value + " Messages";
}

function getChatContent() {
    var counter = document.querySelectorAll('.msg_cotainer_send').length;
    var log = document.querySelectorAll('.msg_cotainer_send');
    var chat_log = '';
    for (var i = 0; i < counter; i++) {
        chat_log = chat_log + log[i].outerHTML +"\n";
        console.log(chat_log + " " + counter);

    }
    chat_log.replace(/<[^>]*>?/gm, '');
    log = jQuery(chat_log).text() + "\n Total number of messages in this chat: " + counter;
    console.log(log);
    
    return log;
}

function changeName() {
    var oldname = "";
    if (oldname != null) {
        oldname = document.getElementById("userInput").value;
    }
    var txt;
    var person = prompt("Please enter your name:", "Type your name here");
    if (person == null || person == "") {
        txt = "User cancelled the prompt.";
    } else {
        txt = person;
    }
    public_system_message(oldname + " changed his name to: " + txt +"\n");
    document.getElementById("userInput").value = txt;
    document.getElementById("display_name").textContent = "Current Name: " + txt;    
}

$("#save_log_button").click(function () {
    var text = getChatContent();
    var filename = "Chat_log_" + current_time();
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename + ".txt");
});

document.addEventListener('DOMContentLoaded', function () {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== 'granted')
        Notification.requestPermission();
});

function notifyMe(msg_content) {

    if (Notification.permission !== 'granted')
        Notification.requestPermission();
    else {
        navigator.serviceWorker.getRegistration().then(reg => {
            const title = 'Just Another Chat App';
            const options = {
                "body": msg_content,
                "icon": "/images/JustAnotherChat_icon_multiple.ico",
                "badge": "/images/JustAnotherChat_icon_multiple.ico",
                "vibrate": [200, 100, 200, 100, 200, 100, 400],
                "actions": [
                    { action: 'reply', title: 'Reply' }
                ]
                
            };
            console.log(reg);
            reg.showNotification(title, options);
            /*Notification.onclick = function () {
                window.open('http://www.google.com.br/');
            };*/


        }).catch(err => console.log(err));

    }
}

var isPushEnabled = false;
window.addEventListener('load', function () {
    var pushButton = document.querySelector('.js-push-button');
    pushButton.addEventListener('click', function () {
        if (isPushEnabled) {
            unsubscribe();
        } else {
            subscribe();
        }
    });
    // Check that service workers are supported, if so, progressively
    // enhance and add push messaging support, otherwise continue without it.
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/pwabuilder-sw.js')
            .then(initialiseState);
    } else {
        console.warn('Service workers aren\'t supported in this browser.');
    }
});

/* Makes window draggable*/
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "draggable_part")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "draggable_part").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function createNewChatWindow() {
    var url = '@Url.Action("NewChatWindow", "ReportExecution")';
    var randomnumber = Math.floor((Math.random() * 100) + 1);
    window.open(url, "_blank", 'PopUp' + randomnumber + ',scrollbars=1,menubar=0,resizable=1,width=850,height=500');
}