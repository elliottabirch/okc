const messageArray = [
  'Hey, good looking profile\.Did you write it yourself? ;)\n\nElliott',
  'A suitcase full of cash. A private jet. And a dashing co-pilot. Whereto?\n\nElliott',
  'Hey, super serious question for you: If you could be anything in the world for a couple hours, which would you choose?\n\nA.) Eagle\nB.) Honey badger!!!\nC.) Killer whale\n\nLet me know…\n\nElliott\n\nps. this obviously says deep things about your personality so think very, very carefully before you answer ;)',
];

const createMessage = (id, array) => ({
  body: array[Math.floor(Math.random() * array.length)],
  receiverid: id,
  reply: false,
  service: 'profile',
  source: 'desktop_global',
});

const createMessagesArray = (userArray, msgArray) => userArray.map(id => (createMessage(id, msgArray)));

const posturl = 'https://www.okcupid.com/1/apitun/messages/send';

const postHeaders = {
  accept: 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'en-US,en;q=0.8',
  authorization: 'Bearer 1,0,1487939539,0x57eaea969554e7d9;0432540c75ea809bb9fb83744789f9fabd7aab5a',
  'content-type': 'application/json; charset=UTF-8',
  'x-okcupid-platform': 'DESKTOP',
  'x-requested-with': 'XMLHttpRequest',
};

const postMessage = function (messageData) {
  jQuery.ajax({
    url: posturl,
    type: 'POST',
    data: JSON.stringify(messageData),
    headers: postHeaders,

  });
};


const messageQuery = {
  userids: '17974250483794779563',
};

const messageUrl = '/1/apitun/messages/global_messaging';

const messageHeaders = {
  accept: '*/*',
  authorization: 'Bearer 1,0,1487979568,0x57eaea969554e7d9;d9c175a66f9115249aaf92fae84f8188d974041f',
  'x-okcupid-platform': 'DESKTOP',
  'x-requested-with': 'XMLHttpRequest',
};

jQuery.ajax({
  messageUrl,
  type: 'GET',
  contentType: 'application/json',
  data: messageQuery,
  messageHeaders,
  success(data) {
    if (data.data[messageQuery.userids].messages.messages[data.data[query.userids].messages.messages.length - 1].read) {
      console.log('she has read it');
    } else {
      // send her a message
    }
  },
});

