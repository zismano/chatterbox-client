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
      //app.fetch(app.renderMessageData);
      let currentRoom = $('#roomSelect').val();
      //app.fetch(app.getRooms);
      $('#roomSelect').val(currentRoom);
      app.fetch(app.renderRoom);
    });
    $('#rooms').on('change', '#roomSelect', app.fetch.bind(app, app.renderRoom));
    $('.addRoom').on('click', app.addRoom);

    app.fetch(app.getRooms);
    app.fetch(app.renderRoom);
  },
  addRoom: () => {
    var newRoom = prompt('What is the name of the room?');
    if (app.rooms.indexOf(newRoom) !== -1) {
      var newRoom = alert('Room already exists.');
    } else {
      $('#roomSelect').append(`<option value="${newRoom}">${newRoom}</option>`);
      $('#roomSelect').val(newRoom);
      app.rooms.push(newRoom);
      app.fetch(app.renderRoom);
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
      success: callback,
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive messages', data);
      }
    });
  },
  renderMessageData: (data) => {
    for (let i = 0; i < data.results.length; i++) {
      app.renderMessage(data.results[i]);
    }
  },
  getRooms: (data) => {
    app.rooms = [];
    $('#roomSelect').empty();
    for (let i = 0; i < data.results.length; i++) {
      if (app.rooms.indexOf(data.results[i].roomname) === -1 && data.results[i].roomname) {
        app.rooms.push(data.results[i].roomname);  
        $('#roomSelect').append(`<option value="${data.results[i].roomname}">${data.results[i].roomname}</option>`);
      }
    }
  },
  clearMessages: () => {
    $('#chats').empty();
  },
  renderMessage: (message) => {
    $('#chats').append(`<div class="${message.objectId}"><a href="#" class="username">${message.username}</a>: 
      ${$('<div>').text(message.text).html()}, ${message.roomname}</div>`);
    if (app.friends.indexOf(message.username) !== -1) {
      $(`.${message.objectId}`).css('font-weight', 'bold');
    }
  },
  renderRoom: (data) => {
    app.clearMessages();
    for (let i = 0; i < data.results.length; i++) {
      if (data.results[i].roomname === $('#roomSelect').val()) {
        app.renderMessage(data.results[i]);
      }
    }
  },
  handleUsernameClick: (event) => {
    app.friends.push($(event.currentTarget).text());
    app.fetch(app.renderRoom);
  },
  handleSubmit: (event) => {
    event.preventDefault();
    var username = window.location.search;
    username = username.split('=')[1];  
    var messageText = $('#message').val();
    console.log(`${username}: ${messageText}`);
    var message = {
      username,
      text: messageText,
      roomname: $('#roomSelect').val()
    };
    app.send(message);
    $('#message').val('');
    app.fetch(app.renderRoom);
  }
};