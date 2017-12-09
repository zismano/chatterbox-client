var app = {
  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
  init: () => {
    $('#chats').on('click', '.username', app.handleUsernameClick);
    $('.submit').click(app.handleSubmit);  
    $('.refresh').click(()=> {
      app.clearMessages();
      app.fetch(app.renderMessageData);
    });
  },
  send: (message) => {
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
  clearMessages: () => {
    $('#chats').empty();
  },
  renderMessage: (message) => {
    // {
    //   username: 'shawndrost',
    //   text: 'trololo',
    //   roomname: '4chan'
    // }
    console.log(`${message.username}: ${message.text}`);
    $('#chats').append(`<div class="${message.objectId}"><a href="#" class="username">${message.username}</a>: 
      ${$('<div>').text(message.text).html()}, ${message.roomname}</div>`);
  },
  renderRoom: (room) => {
    $('#roomSelect').append(`<option value="${room}">${room}</option>`);
  },
  handleUsernameClick: () => {
  },
  handleSubmit: (event) => {
    event.preventDefault();
    var username = window.location.search;
    username = username.split('=')[1];  
    var messageText = $('#message').val();
    console.log(`${username}: ${messageText}`);
    var message = {
      username: username,
      text: messageText,
      roomname: 'lobby'
    };
    app.send(message);
    $('#message').val('');
  }
};