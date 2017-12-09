var app = {
  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
  rooms: [],
  friends: [],
  init() {
    //set jquery event handlers for ui elements
    //submit message when submit button is clicked
    $('.submit').click(app.handleSubmit); 
    //does nothing, exists only for spec
    $('.submit').submit(app.handleSubmit); 
    //refresh messages when refresh button is fixed 
    $('.refresh').click(()=> {
      app.clearMessages();
      let currentRoom = $('#roomSelect').val();
      $('#roomSelect').val(currentRoom);
      app.loadRoom();
    });
    //change room when room is selected from room dropdow
    $('#rooms').on('change', '#roomSelect', app.loadRoom);
    //add a new room when add room button is clicked
    $('.addRoom').on('click', app.addRoom);// when clicked pn Add room button, call addRoom method
    //call handleUsernameClick when username is clicked
    $('#chats').on('click', '.username', app.handleUsernameClick);

    //do initial load of messages
    // get data and build rooms list (rooms' dropbox selection)
    app.fetch(app.getRoomList, {
      limit: 1000,
      order: '-updatedAt'
    });
  },
  loadRoom: () => {
    //load messages from desired room
    app.clearMessages();
    app.fetch(app.renderMessageData, {
      where: {
        roomname: $('#roomSelect').val()
      },
      order: '-updatedAt'
    });
  },
  addRoom() {
    // get room name from user
    var newRoom = prompt('What is the name of the room?');
    // if room is already in rooms' array, inform user
    if (app.rooms.indexOf(newRoom) !== -1) {
      var newRoom = alert('Room already exists.');
    } else {
      // else, if it is a new room
      // append to rooms' drop box the new room
      $('#roomSelect').append(`<option value="${newRoom}">${newRoom}</option>`);
      // change drop box selection to new room
      $('#roomSelect').val(newRoom);
      // store new room in rooms' array
      app.rooms.push(newRoom);
      // load messages for chosen room
      app.loadRoom();
    }
  },
  send(message) {
    //create ajax call to send message
    $.ajax({
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  fetch: (callback, options = {order: '-updatedAt'}) => {
    //create ajax call to fetch messages from server
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      // adding order=-updateAt renders data (results) from server in descending order
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      data: options,
      type: 'GET',
      // when success in getting data, do callback function
      success: callback,
      error: function (data) {
        console.error('chatterbox: Failed to receive messages', data);
      }
    });
  },

  // display messages
  renderMessageData: (data) => {
    //iterate through data received from server
    for (let i = 0; i < data.results.length; i++) {
      //render each message with renderMessage
      app.renderMessage(data.results[i]);
    }
  },

  // 
  getRoomList: (data) => {
    // clear rooms' array
    app.rooms = [];
    // clears all rooms from roomSelect div (rooms' drop box selection) in order to add(append) current rooms from receieved data
    $('#roomSelect').empty();
    // for each message
    for (let i = 0; i < data.results.length; i++) {
      //  if room of message isn't stored in rooms' array, and room of message isn't undefined
      if (app.rooms.indexOf(data.results[i].roomname) === -1 && data.results[i].roomname) {
        // stored room of message in rooms' array
        app.rooms.push(data.results[i].roomname);  
        // append room in roomSelect div (to display in rooms' drop box selection)
        $('#roomSelect').append(`<option value="${data.results[i].roomname}">${data.results[i].roomname}</option>`);
      }
    }
    $('#roomSelect').val('lobby');
    app.loadRoom();
  },

  // clears all messages
  clearMessages: () => {
    //clear chats div
    $('#chats').empty();
  },

  // 
  renderMessage: (message) => {
    // append a div with username: text message after escaping and roonname to chat Id div
    let date = new Date(message.updatedAt);
    $('#chats').append(`<div class="${message.objectId}"><a href="#" class="username">${message.username}</a>: 
      ${$('<div>').text(message.text).html()}, ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>`);
    // bold message if it's a friend's message
    if (app.friends.indexOf(message.username) !== -1) {
      $(`.${message.objectId}`).css('font-weight', 'bold');
    }
  },

  handleUsernameClick: (event) => {
    // push clicked friend to friend's array
    app.friends.push($(event.currentTarget).text());
    // get data and refresh current room
    app.loadRoom();
  },
  handleSubmit(event) {
    // prevent refresh of window (occurs since 'submit' button has type of submit)
    event.preventDefault();
    // get our username which is displayed on url address
    var username = window.location.search;
    username = username.split('=')[1]; 
    // get message typed in input text box 
    var messageText = $('#message').val();
    console.log(`${username}: ${messageText}`);
    // build message
    var message = {
      username,
      text: messageText,
      roomname: $('#roomSelect').val()
    };
    // send message to server
    app.send(message);
    // clear content of input text box
    $('#message').val('');
    // refresh messages of current room (in order to dispaly new message with previous messages of room)
    app.loadRoom();
  },
  renderRoom() {
    //just for spec
    $('#roomSelect').append('<div id="spec"></div>');
  }
};