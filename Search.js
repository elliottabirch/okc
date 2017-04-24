
const messageArray = [
  'Hey, good looking profile. Did you write it yourself? ;)\n\nElliott',
  'A private jet. And a dashing co-pilot. Whereto?\n\nElliott',
  'Hey, super serious question for you: If you could be anything in the world for a couple hours, which would you choose?\n\nA.) Eagle\nB.) Honey badger!!!\nC.) Killer whale\n\nLet me know…\n\nElliott\n\nps. this obviously says deep things about your personality so think very, very carefully before you answer ;)',
];

const secondMessageArray = [
  'Everyone knows that quality women online get overloaded with messages every day... \n\nSo what do you do when you can’t respond to them all? You wait for a few persistent (ridiculously handsome) men to remember you and write again.\n\nI’m one of those men, and this is your second msg.',
  'Just thought I’d let you know that if ignoring my brilliant message was part of your devious plan to make me want you, you’ve failed. Sorta. I am still curious to know one *important* detail about you though -> white, milk or dark chocolate? \n\nHere’s hoping you get it right',
  "​Look, I totally understand... It's because I haven't put my shirtless bathroom mirror iPhone pic up yet, isn't it? I promise I'll have it online soon, all 6­pack abs and flexing muscles, ;­)",
];

const authorization = 'Bearer 1,0,1489445745,0x57eaea969554e7d9;c75e2f0b94c9fd8b30a01e548ad1e0099736f3f7';

const createMessage = (id, array) => ({
  body: array[Math.floor(Math.random() * array.length)],
  receiverid: id,
  reply: false,
  service: 'profile',
  source: 'desktop_global',
});

const createMessagesArray = (userArray, msgArray) => userArray.map(id => (createMessage(id.userid, msgArray)));

const searchHeaders = {
  accept: 'application/json, text/javascript, */*; q=0.01',
  authorization,
  'content-type': 'application/json; charset=UTF-8',
  'x-okcupid-platform': 'DESKTOP',
  'x-requested-with': 'XMLHttpRequest',
};

const searchUrl = 'https://www.okcupid.com/1/apitun/match/search';


const searchRequestData = {
  after: null,
  age_recip: 'on',
  answers: [],
  atBeginning: true,
  availability: 'single',
  bodytype: [
    'fit',
    'average',
    'thin',
    'curvy',
    'jacked',
    'a_little_extra',
  ],
  cats: [],
  children: [],
  dogs: [],
  drinking: [],
  drugs: [],
  education: [],
  ethnicity: [],
  fields: 'userinfo,thumbs,percentages,likes,last_contacts,online',
  gender_tags: 1,
  gentation: [54],
  i_want: 'women',
  interest_ids: [],
  languages: 0,
  last_login: 864000,
  limit: 999,
  located_anywhere: 0,
  location: {
    city_name: 'San Francisco',
    country_code: 'US',
    country_name: 'United States',
    default_radius: 25,
    density: 102457,
    display_state: 1,
    latitude: 3777493,
    locid: 4265540,
    longitude: -12241942,
    metro_area: 7360,
    nameid: 170167,
    popularity: 25907,
    postal_code: '94103',
    state_code: 'CA',
    state_name: 'California',
  },
  locid: 4265540,
  looking_for: [],
  lquery: '',
  maximum_age: 27,
  maximum_attractiveness: 10000,
  maximum_height: null,
  minimum_age: 21,
  minimum_attractiveness: 6000,
  minimum_height: null,
  monogamy: 'unknown',
  order_by: 'SPECIAL_BLEND',
  orientation_tags: null,
  personality_filters: {
    adventuresome: 'more',
    independence: 'more',
    introversion: 'less',
    self_confidence: 'more',
  },
  questions: [],
  radius: 50,
  religion: [],
  smoking: [],
  speaks_my_language: false,
  tagOrder: [
    'minimum_attractiveness',
    'maximum_attractiveness',
    'bodytype',
    'availability',
    'personality_filters',
    'speaks_my_language',
  ],
  they_want: 'men',
};


const postMessage = function (messageData) {
  const posturl = 'https://www.okcupid.com/1/apitun/messages/send';

  const postHeaders = {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.8',
    authorization,
    'content-type': 'application/json; charset=UTF-8',
    'x-okcupid-platform': 'DESKTOP',
    'x-requested-with': 'XMLHttpRequest',
  };

  jQuery.ajax({
    url: posturl,
    type: 'POST',
    data: JSON.stringify(messageData),
    headers: postHeaders,
    success(data) {
      console.log('tried to send ', messageData);
    },


  });
};

const getMessageHistory = (userId, message) => {
  const messageQuery = {
    userids: userId,
  };

  const messageUrl = '/1/apitun/messages/global_messaging';

  const messageHeaders = {
    accept: '*/*',

    authorization,
    'x-okcupid-platform': 'DESKTOP',
    'x-requested-with': 'XMLHttpRequest',
  };

  jQuery.ajax({
    url: messageUrl,
    type: 'GET',
    contentType: 'application/json',
    data: messageQuery,
    headers: messageHeaders,
    success(data) {
      const messages = data.data[userId].messages.messages;
      const person = data.data[userId];
      // console.log(data);
      console.log(person.fields.hasInboxCapacity);
      if (!person.fields.inactive && person.canMessage) {
        if (!messages || messages.length === 0) {
          // console.log('i havent sent her anything yet, sending her', createMessage(userId, messageArray));
          postMessage(createMessage(userId, messageArray));
          // console.log('we have not communicated', data);
        } else if (messages.length === 1) {
          if (messages[messages.length - 1].read) {
            console.log('she read it', Math.floor((Math.floor(Date.now() / 1000) - messages[messages.length - 1].timestamp) / 86400), 'days ago');
            if ((Math.floor((Math.floor(Date.now() / 1000) - messages[messages.length - 1].timestamp) / 86400)) > 3) {
              // console.log('sending her: ', createMessage(userId, secondMessageArray));
              // console.log('we have communicated, but im sending her a follow up');
              postMessage(createMessage(userId, secondMessageArray));
            }
          } else {
            console.log('she hasnt read it, and it has been ', Math.floor((Math.floor(Date.now() / 1000) - messages[messages.length - 1].timestamp) / 86400), 'days');
            if ((Math.floor((Math.floor(Date.now() / 1000) - messages[messages.length - 1].timestamp) / 86400)) > 5) {
              // console.log('sending her: ', createMessage(userId, secondMessageArray));
              // console.log('we have communicated, but im sending her a follow up');
              postMessage(createMessage(userId, secondMessageArray));
            }
          }
        } else console.log('we have too much history');
      } else console.log('she is inactive');
    },
  });
};

const sendMessages = function () {
  jQuery.ajax({
    url: searchUrl,
    type: 'POST',
    data: JSON.stringify(searchRequestData),
    headers: searchHeaders,
    success(data) {
      // console.log(data.data);
    // iterate through matches
      const msgArray = createMessagesArray(data.data, messageArray);
      // // check message history with each match and respond accordingly
      msgArray.forEach((message) => {
        getMessageHistory(message.receiverid, message);
      });
    },

  });
};

const deleteThread = function (threadId) {
  const deleteThreadUrl = `/1/apitun/messages/threads?threadids=${threadId}`;
  const deleteThreadHeaders = {
    accept: '*/*',
    authorization,
    'content-length': 30,
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-okcupid-platform': 'DESKTOP',
    'x-requested-with': 'XMLHttpRequest',
  };
  // const deleteThreadQuery = {
  //   threadids: threadId,
  // };

  jQuery.ajax({
    url: deleteThreadUrl,
    type: 'DELETE',
    contentType: 'application/json',
    headers: deleteThreadHeaders,
    success(data) {
      console.log('data from delete success', data);
    },
  });
};


const getSentMessages = function () {
  const getSentMessagesUrl = '/messages';
  const getSentMessagesQuery = {
    folder: 2,
  };
  const getSentMessagesHeaders = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.8',
    'x-requested-with': 'XMLHttpRequest',
  };

  jQuery.ajax({
    url: getSentMessagesUrl,
    type: 'GET',
    contentType: 'application/json',
    data: getSentMessagesQuery,
    headers: getSentMessagesHeaders,
    success(data) {
      console.log(data);
      const threads = data;
      threads.forEach((thread) => {
        if (!thread.replied && !thread.unread) {
          // console.log('i will attempt to delete a message from ', thread.user.username);
          // deleteThread(thread.threadid);
        }
      });
      console.log(data);
    },
  });
};

