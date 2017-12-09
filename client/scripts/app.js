var app = {
  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
  rooms: [],
  friends: [],
  init() {
    $('#chats').on('click', '.username', app.handleUsernameClick);
    $('.submit').click(app.handleSubmit); 
    $('.submit').submit(app.handleSubmit);  // does nothing, exists only for spec
    $('.refresh').click(()=> {
      app.clearMessages();
      let currentRoom = $('#roomSelect').val();
      $('#roomSelect').val(currentRoom);
      app.fetch(app.refreshCurrentRoom);
    });
    $('#rooms').on('change', '#roomSelect', app.fetch.bind(app, app.refreshCurrentRoom));

    // when clicked pn Add room button, call addRoom method
    $('.addRoom').on('click', app.addRoom);

    // get data and build rooms list (rooms' dropbox selection)
    app.fetch(app.getRoomList);
    // get data and dislay message of current room 
    app.fetch(app.refreshCurrentRoom);
  },

  addRoom: () => {
    // get room name from user
    var newRoom = prompt('What is the name of the room?');
    // if room is already in rooms' array, inform user
    if (app.rooms.indexOf(newRoom) !== -1) {
      var newRoom = alert('Room already exists.');
      // else, if it is a new room
    } else {
      // append to rooms' drop box the new room
      $('#roomSelect').append(`<option value="${newRoom}">${newRoom}</option>`);
      // change drop box selection to new room
      $('#roomSelect').val(newRoom);
      // store new room in rooms' array
      app.rooms.push(newRoom);
      // refresh messages display to new room messages
      app.fetch(app.refreshCurrentRoom);
    }
  },
  send(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  fetch: (callback) => {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      // adding order=-updateAt renders data (results) from server in descending order
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages?order=-updatedAt',
      type: 'GET',
      // when success in getting data, do callback function
      success: callback,
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive messages', data);
      }
    });
  },

  // display messages
  renderMessageData: (data) => {
    for (let i = 0; i < data.results.length; i++) {
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
  },

  // clears all messages
  clearMessages: () => {
    $('#chats').empty();
  },

  // 
  renderMessage: (message) => {
    // append a div with username: text message after escaping and roonname to chat Id div
    $('#chats').append(`<div class="${message.objectId}"><a href="#" class="username">${message.username}</a>: 
      ${$('<div>').text(message.text).html()}, ${message.roomname}</div>`);
    // bold message if it's a friend's message
    if (app.friends.indexOf(message.username) !== -1) {
      $(`.${message.objectId}`).css('font-weight', 'bold');
    }
  },

  refreshCurrentRoom: (data) => {
    // clear all messages from display
    app.clearMessages();
    // for each message
    for (let i = 0; i < data.results.length; i++) {
      // check every message if its room is the chosen room in dropbox room's option
      if (data.results[i].roomname === $('#roomSelect').val()) {
        // if so, display message
        app.renderMessage(data.results[i]);
      }
    }
  },

  handleUsernameClick: (event) => {
    // push clicked friend to friend's array
    app.friends.push($(event.currentTarget).text());
    // get data and refresh current room
    app.fetch(app.refreshCurrentRoom);
  },

  handleSubmit: (event) => {
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
    app.fetch(app.refreshCurrentRoom);
  }
};