const socketUrl = "ws://localhost:8080/webboards-1.0-SNAPSHOT/ws"
const baseUrl = "http://localhost:8080/webboards-1.0-SNAPSHOT"
const loginUrl = "/login-servlet";
const signupUrl = "/signup-servlet";
// Create WebSocket connection.
let socket;
// const socket = new WebSocket(socketUrl);
let username;

// Login handler
function login() {
    // get form data
    const formData = {
        "user": document.getElementById('username').value,
        "pwd": document.getElementById('password').value
    };
    console.log(JSON.stringify(formData));
    // make API call
    fetch(baseUrl+loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            // check login status and display appropriate message
            if (data.loginStatus) {
                username = data.username;
                // redirect to home page
                window.localStorage.setItem("username",username);
                window.location.href = 'home.html';
                // // open the socket
                // socket = new WebSocket(socketUrl+`/${username}`);
                // setupSocket(socket);

            } else {
                alert('Invalid username or password');
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('An error occurred during login');
        });
}

function signup() {
    // get form data
    const formData = {
        "user": document.getElementById('username').value,
        "pwd": document.getElementById('password').value
    };

    // make API call
    fetch(baseUrl+signupUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            // check login status and display appropriate message
            if (data.success) {
                alert('Signup successful!');
                username = data.username;
                // redirect to page
                window.localStorage.setItem("username",username);
                window.location.href = 'home.html';
                // // open the socket
                // socket = new WebSocket(socketUrl+`/${username}`);
                // console.log("Socket connection created: "+socket);
                // setupSocket(socket);
            } else {
                alert('Signup failed');
            }
        })
        .catch(error => {
            console.log('Error during signup:', error);
            // alert('An error occurred during signup');
        });
}
function setupSocket(){
    username = window.localStorage.getItem("username");
    socket = new WebSocket(socketUrl+`/${username}`);

    // Connection opened
    socket.addEventListener("open", (event) => {
        console.log(event);
        console.log(socket.readyState);
    });

// Listen for messages (work in progress)
    socket.addEventListener("message", (event) => {
        console.log("Message: "+event.data);
        console.log("got message")
        const data = JSON.parse(event.data);
        console.log(data)
        switch(data.type){
            case "new-card":
                addCard(data.title,data.creator);
                break;
            case "delete-card":
                removeCard(data.card);
                break;
            case "new-note":
                addNote(data.text,data.card,data.creator);
                break;
            case "delete-note":
                removeNote(parseInt(data.note),parseInt(data.card));
                break;
            case "board":
                break;
            case "error":
                console.error(data.message);
                break;
            default:
                console.error("It's over.");
                break;
        }
    });
    return socket;
}

function addCard(title,creator) {
    console.log("Adding card...");
    // Create a new card
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.id = 'title';

    // Delete button
    const deleteCardButton = document.createElement('button');
    deleteCardButton.type = 'button';
    deleteCardButton.className = 'add-message-btn';
    deleteCardButton.textContent = 'Delete Card';

    // Append delete button
    newCard.appendChild(deleteCardButton);

    // Add the "Add Message" button to the new card
    const addMessageBtn = document.createElement('button');
    addMessageBtn.textContent = 'Add Message';
    addMessageBtn.className = 'add-message-btn';
    newCard.appendChild(addMessageBtn);

    // Add the new card to the cards container
    cardsContainer.insertBefore(newCard, addCardBtn);

    // Create the card title
    const cardTitle = document.createElement('div');
    cardTitle.className = 'card-title';
    cardTitle.textContent = title;

    // Insert the card title into the new card
    newCard.insertBefore(cardTitle, deleteCardButton);

    deleteCardButton.addEventListener('click', deleteCard);
    deleteCardButton.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            deleteCard(event);
        }
    });

    // When the user clicks the "Add Message" button, create a message input box
    addMessageBtn.addEventListener('click', () => {
        // Create the message input box
        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Add a message...';
        messageInput.className = 'message-input';

        // Create the message submit button
        const messageSubmitBtn = document.createElement('button');
        messageSubmitBtn.type = 'button';
        messageSubmitBtn.textContent = 'Submit';
        messageSubmitBtn.className = 'add-message-btn';

        // Create the message delete button
        const messageDeleteBtn = document.createElement('button');
        messageDeleteBtn.type = 'button';
        messageDeleteBtn.textContent = 'Delete Message';
        messageDeleteBtn.className = 'add-message-btn';

        // Create the message card
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card';
        messageCard.appendChild(messageInput);
        messageCard.appendChild(messageSubmitBtn);
        messageCard.appendChild(messageDeleteBtn);

        // Add the message card to the card
        newCard.appendChild(messageCard);
        // Focus the message input box
        messageInput.focus();

        // When the user clicks the message submit button or presses Enter, create the message
        const createMessage = () => {
            // Check if the message input is empty
            if (messageInput.value.trim() === '') {
                messageInput.value = 'Empty Message';
            }

            // Create the message element
            const message = document.createElement('div');
            message.className = 'message';
            message.textContent = messageInput.value;

            // Insert the message into the message card
            messageCard.insertBefore(message, messageInput);

            // Remove the message input and submit button
            messageCard.removeChild(messageInput);
            messageCard.removeChild(messageSubmitBtn);

            // Notify the socket
            let sent = false;
            const parentCard = messageCard.parentNode;
            const cards = parentCard.parentNode.querySelectorAll(".card");
            let i;
            for(i = 0; i<cards.length; i++){
                if(cards.item(i) === parentCard){
                    socket.send(JSON.stringify({"type":"new-note",
                        "text": message.textContent,
                        "creator": username,
                        "card":i}));
                    sent = true;
                }
            }
            if(sent === false){
                console.error("Client failed to send command: create message in card "+i);
            }
        };

        messageSubmitBtn.addEventListener('click', createMessage);
        messageInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                createMessage();
            }
        });

        messageDeleteBtn.addEventListener('click',
            (event)=>deleteMessage(event,messageCard));
        messageDeleteBtn.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                deleteMessage(event);
            }
        });
    });
}

function removeCard(card) {
    const elems = document.getElementsByClassName('cards-container')[0]
        .getElementsByClassName('card');
    elems.item(card).remove();
}

function addNote(text,card,creator) {
    const targetCard = document.getElementsByClassName("cards-container")[0]
        .getElementsByClassName("card")[card];

    // Create the message delete button
    const messageDeleteBtn = document.createElement('button');
    messageDeleteBtn.type = 'button';
    messageDeleteBtn.textContent = 'Delete Message';
    messageDeleteBtn.className = 'add-message-btn';

    // Create the message card
    const messageCard = document.createElement('div');
    messageCard.className = 'message-card';

    // Create the message element
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;

    // Insert the message into the message card
    messageCard.appendChild(message);
    messageCard.appendChild(messageDeleteBtn);

    // Add the message card to the card
    targetCard.appendChild(messageCard);

    messageDeleteBtn.addEventListener('click', (event)=>deleteMessage(event,messageCard));
    messageDeleteBtn.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            deleteMessage(event);
        }
    });
}

function removeNote(note, card){
    const cardList = document.getElementsByClassName("cards-container")[0]
        .getElementsByClassName("card");
    let targetCard = cardList.item(card);
    const messages = targetCard.getElementsByClassName("message-card");
    messages.item(note).remove();
}