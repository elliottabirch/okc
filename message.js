const OKCupid = require('okcupidjs');
const hl = require('highland');

OKCupid.prototype.searchStream = hl.wrapCallback(OKCupid.prototype.search);
OKCupid.prototype.loginStream = hl.wrapCallback(OKCupid.prototype.login);

const okc = new OKCupid();


const generateMessage = name => `What is your biggest fear ${name}? Snakes, Spinach, or saying "you too" when the waiter tells you to enjoy your meal?`;

const generateFollowUp = () => 'I am sensing your silence as a distress signal. Do I need to fetch my suit and cape and come to the rescue?';

const CREDENTIALS = ['master_of_robots', '1234qwer1234'];

const PERMUTATION_OPTIONS = {
  bodyTypes: [
    'thin',
    'fit',
    'average',
    'jacked',
    'curvy',
    // 'full_figured',
    // 'a_little_extra',
    // 'overweight',
  ],
};

const baseQuery = {
  order_by: 'SPECIAL_BLEND',
  i_want: 'women',
  they_want: 'men',
  minimum_age: 21,
  maximum_age: 27,
  radius: 10,
  speaks_my_language: true,
  availability: 'single',
  monogamy: 'yes',
  last_login: 604800,
  limit: 1000, // max number of results
};

// generate permutations
const generatePermutations = (options) => {
  const results = [];
  for (let attractiveness = 10; attractiveness > 0; attractiveness -= 2) {
    const minimum_attractiveness = Math.max((attractiveness - 2) * 1000, 0);
    const maximum_attractiveness = attractiveness * 1000;

    options.bodyTypes.forEach((bodyType) => {
      results.push({
        ...baseQuery,
        maximum_attractiveness,
        minimum_attractiveness,
        bodyType: [bodyType],
      });
    });
  }
  return results;
};
hl(okc.loginStream(...CREDENTIALS))
  .doto(() => {
    console.log;
  })
  .flatMap(() => hl(generatePermutations(PERMUTATION_OPTIONS))
    .take(1))
  .flatMap(permutation => okc.searchStream(permutation))
  .flatten()
  .filter(({ inactive, isAdmin, staff }) => !inactive && !isAdmin && !staff)

  .doto((data) => {
    console.log;
  })
  .stopOnError(err => console.error(err))
  .done(() => console.log('done'));
// iterate through options
//  add permutation options to object
//  push object to results array
// return results array

// bulk import
// iterate through permutations
//  save user data


// save user data
// search users from okc api with given query
// filter out admin, inactive, staff
// bulk import into database
//  if total_matches < max results
//    set options.after to resonse.paging.after
//  run query again

// Send Ice Breakers
// get all users without a 'messages' array
//  for each user
//    get messages from okc api
//    messages = larger message repo between okc and db
//      if no messages
//        send ice breaker message
//        add ice breaker message to messages
//      add messages to messages array in
//      save messages to user in db


// send follow up
//    get all users in db with messages length = 1
//    for each user
//      get user from okc api
//      set messages to larger message array
//      set messages in db to resolved message array
//      filter user if messages.length > 2
//      filter user if lastMessage.hasbeenViewed, and lastMessage.createdAt - date.now < 2 days
//      filter user if !lestMessage.hasbeenViewed and lastmessage.createdAt - date.now < 5 days
//      send user follow up message
//      add follow up message to database
