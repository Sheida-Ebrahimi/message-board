const cardsContainer = document.querySelector('.cards-container');
const addCardBtn = document.querySelector('#add-card-btn');

/**
 * @param socket {WebSocket}
 * */
function setupAddCardBtn() {
    if(socket === undefined){
        console.error("No socket connection has been made: "+socket);
    }
    if(username===undefined){
        console.error("No username: "+username);
    }
    console.log(socket.readyState);
    addCardBtn.addEventListener('click', () => {
        // Create a new card
        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.id = 'title';

        // Create the card title input
        const cardTitleInput = document.createElement('input');
        cardTitleInput.type = 'text';
        cardTitleInput.placeholder = 'Add a title...';
        cardTitleInput.id = 'title';

        // Create the card title submit button
        const cardTitleSubmitBtn = document.createElement('button');
        cardTitleSubmitBtn.type = 'button';
        cardTitleSubmitBtn.textContent = 'Submit';
        cardTitleSubmitBtn.className = 'card-title-submit-btn';

        // Delete button
        const deleteCardButton = document.createElement('button');
        deleteCardButton.type = 'button';
        deleteCardButton.className = 'add-message-btn';
        deleteCardButton.textContent = 'Delete Card';

        // Append the card title input and submit button to the new card
        newCard.appendChild(cardTitleInput);
        newCard.appendChild(cardTitleSubmitBtn);
        newCard.appendChild(deleteCardButton);

        // Add the "Add Message" button to the new card
        const addMessageBtn = document.createElement('button');
        addMessageBtn.textContent = 'Add Message';
        addMessageBtn.className = 'add-message-btn';
        newCard.appendChild(addMessageBtn);

        // Add the new card to the cards container
        cardsContainer.insertBefore(newCard, addCardBtn);

        // Focus the card title input
        cardTitleInput.focus();

        // When the user clicks the submit button or presses Enter, create the card title
        const createCardTitle = () => {
            // Check if the title input is empty
            if (cardTitleInput.value.trim() === '') {
                cardTitleInput.value = 'Empty Title';
            }

            // Create the card title
            const cardTitle = document.createElement('div');
            cardTitle.className = 'card-title';
            cardTitle.textContent = cardTitleInput.value;

            // Insert the card title into the new card
            newCard.insertBefore(cardTitle, cardTitleInput);

            // Remove the title input and submit button
            newCard.removeChild(cardTitleInput);
            newCard.removeChild(cardTitleSubmitBtn);

            // Notify socket server
            console.log("Sending create instructions: "+JSON.stringify({"type": "new-card", "title": cardTitle.textContent,"creator": username}));
            socket.send(JSON.stringify({"type": "new-card", "title": cardTitle.textContent,"creator": username}));
        };

        cardTitleSubmitBtn.addEventListener('click', createCardTitle);
        cardTitleInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                createCardTitle();
            }
        });
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
    });
}

const deleteCard = (event) => {
    let nodes = event.target.parentNode.parentNode.querySelectorAll(".card")
    for(let i = 0; i<nodes.length; i++){
        if(nodes[i] === event.target.parentNode){
            let request = JSON.stringify({"type":"delete-card","card":i});
            console.log("Sending instructions: " + request);
            socket.send(request);
        }
    }
    event.target.parentNode.remove();
};

const deleteMessage = (event,messageCard) => {
    // Notify the socket
    let sent = false;
    const parentCard = messageCard.parentNode;
    const cards = parentCard.parentNode.querySelectorAll(".card");
    let i,j;
    for(i = 0; i<cards.length; i++){
        if(cards.item(i) === parentCard){
            const messages = parentCard.querySelectorAll(".message-card");
            for(j=0; j<messages.length; j++){
                if(messages.item(j) === messageCard){
                    socket.send(JSON.stringify({"type":"delete-note","card":i,"note":j}));
                    sent = true;
                }
            }
        }
    }
    if(sent === false){
        console.error("Client failed to send command: delete message in note");
    }

    event.target.parentNode.remove();
};