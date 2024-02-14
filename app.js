const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Define the port
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', async (message) => {
    const response = await processUserInput(message);
    socket.emit('botMessage', response);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// function to process inputs
async function processUserInput(input) {
  const lowerCaseInput = input.toLowerCase();

  try {
    const playerResponse = findPlayerResponse(lowerCaseInput);

  if (isGreeting(lowerCaseInput)) {
    return getRandomGreeting();
  }
  else if (playerResponse) {
    return playerResponse; }

  else if (lowerCaseInput.includes('espn takes') || lowerCaseInput.includes('espn')) {
    return await getESPNTakes();
    }

  else if (lowerCaseInput.includes('disagree'))
    return await disagreetakes();

  else if (lowerCaseInput.includes('agree'))
    return await agreetakes();

  else {
    return "I'm not sure what you're asking. Can you try a different NBA question?";
    }
  } catch (error) {
      console.error('Error processing user input:', error);
      return 'Sorry, I encountered an error while processing your request.';
  }
}

// Array of Players, Teams, and other Keywords
const topNBAPlayers = [
  "Kevin Durant", "James Harden", "Kawhi Leonard", "Anthony Davis", 
  "Joel Embiid", "Nikola Jokic", "Damian Lillard", "Luka Doncic", 
  "Jayson Tatum", "Devin Booker", "Bradley Beal", "Jimmy Butler", 
  "Paul George", "Donovan Mitchell", "Bam Adebayo", "Chris Paul", 
  "Rudy Gobert", "Karl-Anthony Towns", "Kyrie Irving", "Zion Williamson", 
  "Trae Young", "Klay Thompson", "Russell Westbrook", "Ben Simmons", 
  "Brandon Ingram", "Jaylen Brown", "Pascal Siakam", "CJ McCollum", 
  "De'Aaron Fox", "Ja Morant", "John Collins", "Shai Gilgeous-Alexander", 
  "Michael Porter Jr.", "Domantas Sabonis", "Julius Randle", 
  "Zach LaVine", "Jrue Holiday", "Christian Wood", "LaMelo Ball", 
  "Tyler Herro", "Fred VanVleet", "Tobias Harris", "Khris Middleton", 
  "DeMar DeRozan", "Gordon Hayward", "Malcolm Brogdon", "Nikola Vucevic", 
  "Buddy Hield", "Collin Sexton", "Jonas Valanciunas", "Steph Curry", "Lebron James",
  "Steven Adams", "Shai Gilgeous-Alexander", "De'Aaron Fox", "Tyrese Maxey",
  "Lauri Markkanen","Jaren Jackson Jr.","Cade Cunningham", "Victor Wembanyama",
  "Jerami Grant", "Kyle Kuzma","Dejounte Murray", "Terry Rozier","Jamal Murray",
  "RJ Barrett", "Coby White", "MVP", "Rookie of the Year", "ROY", "Defensive Player of the Year",
  "DPOY", "All-Star", "Supersonics", "future", "Best", "3-point", "climate", "chemistry", 'worst',
  "dominant", "Atlanta Hawks",
  "Boston Celtics",
  "Brooklyn Nets",
  "Charlotte Hornets",
  "Chicago Bulls",
  "Cleveland Cavaliers",
  "Dallas Mavericks",
  "Denver Nuggets",
  "Detroit Pistons",
  "Golden State Warriors",
  "Houston Rockets",
  "Indiana Pacers",
  "LA Clippers",
  "Los Angeles Lakers",
  "Memphis Grizzlies",
  "Miami Heat",
  "Milwaukee Bucks",
  "Minnesota Timberwolves",
  "New Orleans Pelicans",
  "New York Knicks",
  "Oklahoma City Thunder",
  "Orlando Magic",
  "Philadelphia 76ers",
  "Phoenix Suns",
  "Portland Trail Blazers",
  "Sacramento Kings",
  "San Antonio Spurs",
  "Toronto Raptors",
  "Utah Jazz",
  "Washington Wizards",
  "Atlanta",
  "Boston",
  "Brooklyn",
  "Charlotte",
  "Chicago",
  "Cleveland",
  "Dallas",
  "Denver",
  "Detroit",
  "Golden State",
  "Houston",
  "Indiana",
  "Los Angeles",
  "Los Angeles",
  "Memphis",
  "Miami",
  "Milwaukee",
  "Minnesota",
  "New Orleans",
  "New York",
  "Oklahoma City",
  "Orlando",
  "Philadelphia",
  "Phoenix",
  "Portland",
  "Sacramento",
  "San Antonio",
  "Toronto",
  "Utah",
  "Washington",
  "Hawks",
  "Celtics",
  "Nets",
  "Hornets",
  "Bulls",
  "Cavaliers",
  "Mavericks",
  "Nuggets",
  "Pistons",
  "Warriors",
  "Rockets",
  "Pacers",
  "Clippers",
  "Lakers",
  "Grizzlies",
  "Heat",
  "Bucks",
  "Timberwolves",
  "Pelicans",
  "Knicks",
  "Thunder",
  "Magic",
  "76ers",
  "Suns",
  "Trail Blazers",
  "Kings",
  "Spurs",
  "Raptors",
  "Jazz",
  "Wizards"
];

async function agreetakes() {
  return "Glad to hear, any other teams or players you want to hear about?"
}

async function disagreetakes() {
  return "Hmm...Maybe we can agree on another take. What else would you like to hear about?"
}
// Simple database of basketball takes
const basketballTakes = [
  'The Chicago Bulls are looking at a promising future.',
  'The Lakers are the team to beat this season!',
  'Steph Curry is the greatest shooter of all time.',
  'LeBron James deserves another MVP award this year.',
  'The NBA should bring back the Supersonics!',
  'Zion Williamson is the future of the NBA.',
  'The Golden State Warriors will make a strong comeback.',
  'Giannis Antetokounmpo is the most dominant player in the league.',
  'The Brooklyn Nets have the best "Big Three" in the NBA.',
  'Luka Dončić is a future MVP candidate.',
  'The Toronto Raptors are underrated and will surprise everyone this season.',
  'The 3-point shot has revolutionized modern basketball.',
  'The Chicago Bulls will return to championship contention soon.',
  'James Harden is the best scorer in the NBA.',
  'The NBA All-Star Game format is more exciting than ever.',
  'The Miami Heat culture is a key factor in their success.',
  'Devin Booker is one of the most underrated players in the league.',
  'The NBA needs to address load management issues.',
  'Ja Morant is the Rookie of the Year favorite.',
  'Small-ball lineups are changing the dynamics of the game.',
  'The Phoenix Suns will make a deep playoff run.',
  'Chris Pauls leadership is transforming the Phoenix Suns.',
  'Nikola Jokić is the most versatile big man in the NBA.',
  'The New York Knicks are making a comeback, thanks to Julius Randle.',
  'Anthony Edwards has a bright future in the NBA.',
  'The NBAs play-in tournament adds excitement to the end of the regular season.',
  'The defensive impact Rudy Gobert has is often underrated.',
  'The NBA draft class of 2021 is one of the most talented in recent years.',
  'The Houston Rockets are in a rebuilding phase with young talent.',
  // Eastern Conference
  'The Atlanta Hawks are building a young and exciting roster around Trae Young.',
  'The Boston Celtics need to address their center position to contend in the East.',
  'The Brooklyn Nets have the most potent offensive trio in the NBA.',
  'The Charlotte Hornets are a rising force in the East with LaMelo Ball leading the way.',
  'The Chicago Bulls are making a comeback with a revamped roster.',
  'The Cleveland Cavaliers are focused on developing their young talent for the future.',
  'The Detroit Pistons are in a rebuilding phase with promising rookies.',
  'The Indiana Pacers success relies on the health and performance of key players.',
  'The Miami Heat culture is their secret weapon for sustained success.',
  'The Milwaukee Bucks championship run showcased the importance of Giannis Antetokounmpo.',
  'The New York Knicks resurgence has brought excitement back to Madison Square Garden.',
  'The Orlando Magic are embracing a youth movement as they rebuild.',
  'The Philadelphia 76ers are championship contenders with Joel Embiid leading the way.',
  'The Toronto Raptors face the challenge of transitioning from their championship era.',
  'The Washington Wizards are relying on Bradley Beal and Russell Westbrook for a playoff push.',

  // Western Conference
  'The Dallas Mavericks have a bright future with Luka Doncic as their franchise player.',
  'The Denver Nuggets are a contender with Nikola Jokic\'s exceptional skills.',
  'The Golden State Warriors are aiming for another championship with their core returning.',
  'The Houston Rockets are in a rebuilding phase with a focus on young talent.',
  'The LA Clippers success hinges on the health and performance of Kawhi Leonard and Paul George.',
  'The Los Angeles Lakers are determined to repeat as champions with LeBron James and Anthony Davis.',
  'The Memphis Grizzlies are led by the dynamic duo of Ja Morant and Jaren Jackson Jr.',
  'The Minnesota Timberwolves are looking to build around Karl-Anthony Towns and Anthony Edwards.',
  'The New Orleans Pelicans future is promising with Zion Williamson at the forefront.',
  'The Oklahoma City Thunder have amassed a wealth of draft picks for future flexibility.',
  'The Phoenix Suns deep playoff run showcased their potential as a Western Conference powerhouse.',
  'The Portland Trail Blazers face challenges in balancing their backcourt dominance.',
  'The Sacramento Kings are striving for improvement with a focus on player development.',
  'The San Antonio Spurs continue to emphasize their renowned player development program.',
  'The Utah Jazz rely on team chemistry and three-point shooting for success.',
  // Playoffs
  'The Brooklyn Nets, if healthy, are the favorites to win the Eastern Conference and the NBA championship.',
  'The Phoenix Suns will make another deep playoff run, proving their success in the previous season was no fluke.',
  'A fully-loaded LA Lakers team will be a formidable force in the Western Conference, making a strong playoff push.',
  'The Milwaukee Bucks, with Giannis Antetokounmpo leading the way, will be a tough matchup for any team in the playoffs.',
  'The Golden State Warriors will secure a playoff spot with the return of Klay Thompson and a resurgent Stephen Curry.',
  'The Miami Heat\'s playoff success will hinge on Jimmy Butler\'s leadership and the team\'s defensive prowess.',
  'The Dallas Mavericks, behind Luka Doncic\'s brilliance, will be a dark horse in the Western Conference playoffs.',
  'The Philadelphia 76ers, with Joel Embiid dominating in the paint, have a strong chance to reach the NBA Finals.',
  'The Utah Jazz\'s three-point shooting will be a key factor in their playoff performance.',
  'The Atlanta Hawks, building on their momentum from last season, will surprise many with a deep playoff run.',
  // Awards
  'The MVP race will be highly contested, with players like Giannis Antetokounmpo, Kevin Durant, and Stephen Curry in the running.',
  'Rudy Gobert defensive prowess makes him a strong candidate for Defensive Player of the Year.',
  'LaMelo Ball exceptional playmaking secures him as the front-runner for Rookie of the Year.',
  'Chris Paul leadership on the Phoenix Suns makes him a top candidate for the NBA Sportsmanship Award.',
  'Standout performances from Jordan Clarkson and Tyler Herro will make the Sixth Man of the Year race exciting.',
  'Shai Gilgeous-Alexander and Michael Porter Jr. will be strong contenders for the Most Improved Player award.',
  'Joel Embiid dominance in the paint puts him in the mix for both MVP and Defensive Player of the Year.',
  'Coaches like Monty Williams, Steve Nash, and Tom Thibodeau will compete for the Coach of the Year award.',
  'Players like Damian Lillard and Jrue Holiday will be recognized for their impactful contributions off the court with the NBA Community Assist Award.',
  'Front office leaders who make impactful roster moves will contend for the NBA Executive of the Year award.',
  // NBA Draft Picks
  'Cade Cunningham is the consensus top pick, expected to be a franchise-changing player.',
  'Jalen Green, known for his scoring ability and athleticism, is likely to be selected early in the draft.',
  'Evan Mobley shot-blocking and versatility make him a highly sought-after big man in the draft.',
  'The NBA draft will see multiple trades as teams jockey for position to select preferred prospects.',
  'International prospects like Alperen Sengun and Usman Garuba will make a significant impact in the NBA.',
  'Davion Mitchell, known for his defensive tenacity, will be a valuable asset for teams in need of a point guard.',
  'The 2022 NBA draft class is considered one of the deepest in recent years, with talent available throughout the first round.',
  'Teams with multiple draft picks, such as the Oklahoma City Thunder and Houston Rockets, have a unique opportunity to reshape their rosters.',
  'Unexpected sleeper picks will emerge, surprising analysts and fans with their immediate impact in the league.',
  'The NBA draft will set the stage for the next generation of basketball stars, with young talents poised to make their mark on the league.',
  "The rise of small-market teams is changing the NBA landscape.",
  "Three-point shooting has never been more crucial in today's NBA.",
  "Defense still wins championships in the modern NBA era.",
    "The NBA's global influence continues to grow each year.",
    "Player empowerment is at an all-time high in the league.",
    "The debate over the greatest of all time heats up with each season.",
    "NBA analytics are revolutionizing how the game is played and understood.",
    "The importance of a strong bench has never been more evident.",
    "High school phenoms continue to make a direct impact in the NBA.",
    "The role of the traditional center has evolved in the modern NBA.",
    "Off-season moves and trades are becoming as exciting as the regular season.",
    "The battle for Los Angeles: Lakers vs. Clippers rivalry intensifies.",
    "Eastern Conference teams are closing the gap with the West.",
    "The play-in tournament adds a new level of excitement to the NBA playoffs.",
    "Player health and load management are key factors in a team's success.",
    "NBA social media interactions are influencing the league's popularity.",
    "The All-Star game's new format has reinvigorated interest in the event.",
    "Rookies are making immediate impacts on their teams.",
    "Undrafted players are becoming key contributors on many rosters.",
    "Mid-season tournaments could be the next big thing in the NBA.",
    "The Memphis Grizzlies' young core is making them a serious championship contender.",
    "Luka Doncic is on track to break several scoring records this season.",
    "The New Orleans Pelicans are emerging as a dark horse in the West.",
    "Jayson Tatum is making a strong case for MVP this season.",
    "The Chicago Bulls' rebuild is finally paying off with a strong playoff push.",
    "Anthony Edwards is emerging as a leader for the Minnesota Timberwolves.",
    "The Miami Heat's defense is the best in the league this year.",
    "Cade Cunningham is leading the Detroit Pistons' resurgence.",
    "The Utah Jazz's retooling strategy is yielding unexpected success.",
    "The Golden State Warriors' dynasty shows signs of vulnerability.",
    "Zach LaVine is proving to be one of the best shooters in the NBA.",
    "The Charlotte Hornets are becoming a must-watch team with LaMelo Ball.",
    "De'Aaron Fox is quietly becoming one of the best point guards in the league.",
    "The Toronto Raptors' unique style of play is disrupting the Eastern Conference.",
    "Jalen Green is having a breakout season with the Houston Rockets.",
    "Ben Simmons is making a strong comeback and proving his critics wrong.",
    "The Denver Nuggets are a top contender thanks to Nikola Jokic's consistent performance.",
    "Scottie Barnes is quickly becoming the face of the Toronto Raptors.",
    "The Atlanta Hawks are a prime example of how crucial team chemistry is.",
    "Tyrese Haliburton is showing star potential with the Indiana Pacers.",
    "The Portland Trail Blazers are facing a critical season for their future direction.",
    "Khris Middleton's role in the Milwaukee Bucks' success is often underrated.",
    "The Orlando Magic's young roster is showing promising development.",
    "The Phoenix Suns are facing challenges in maintaining their elite status.",
    "Darius Garland is becoming the cornerstone of the Cleveland Cavaliers.",
    "The Brooklyn Nets are facing a make-or-break season with their star-studded lineup.",
    "RJ Barrett is emerging as a cornerstone for the New York Knicks' future.",
    "The San Antonio Spurs' young squad is outperforming expectations.",
    "Kyle Kuzma has become an unexpected leader for the Washington Wizards.",
    "The Atlanta Hawks' offense is one of the most dynamic in the league.",
    "Bam Adebayo is redefining the center position with his versatility.",
    "The Sacramento Kings are finally breaking their playoff drought.",
    "Kristaps Porzingis is experiencing a resurgence with the Washington Wizards.",
    "The Oklahoma City Thunder's rebuild is starting to show promising results.",
    "The Boston Celtics are a prime example of the effectiveness of team-oriented basketball.",
    "Jonathan Kuminga is showing star potential with the Golden State Warriors.",
    "The Indiana Pacers are becoming a surprise package in the East.",
    "Michael Porter Jr. is becoming a consistent scoring threat for the Denver Nuggets.",
    "The Philadelphia 76ers are facing a crucial season with their core lineup.",
    "Franz Wagner is becoming a key player in the Orlando Magic's rebuild.",
    "The race for the top seed in the Western Conference is incredibly tight.",
    "Collin Sexton is proving to be a valuable asset for the Cleveland Cavaliers.",
    "The Detroit Pistons' young core is making significant strides this season.",
    "Lonzo Ball's playmaking is elevating the Chicago Bulls' offense.",
    "The Dallas Mavericks' reliance on Luka Doncic is both a strength and a vulnerability.",
    "Jaren Jackson Jr. is becoming a defensive powerhouse for the Memphis Grizzlies.",
    "The Toronto Raptors' defense is one of the most formidable in the league.",
    "Anthony Edwards is proving to be a future superstar for the Minnesota Timberwolves.",
    "The Milwaukee Bucks are continuing to dominate with their balanced approach.",
    "Obi Toppin is showing flashes of brilliance with the New York Knicks.",
    "The resurgence of the Golden State Warriors hinges on the health of their core players.",
    "Julius Randle is proving to be the leader the New York Knicks need.",
    "The Portland Trail Blazers are at a crossroads, with Damian Lillard's leadership being pivotal.",
    "Jalen Suggs is showing signs of becoming the Orlando Magic's franchise player.",
    "The growth of the Charlotte Hornets hinges on their defensive improvements.",
    "Jarrett Allen is becoming one of the premier centers in the Eastern Conference.",
    "The Los Angeles Lakers' success is increasingly dependent on their younger players.",
    "The Denver Nuggets' depth is making them a dark horse in the Western Conference.",
    "Jerami Grant's role in the Detroit Pistons' rebuild is proving crucial.",
    "The chemistry between Zion Williamson and Brandon Ingram is electrifying the Pelicans.",
    "The Utah Jazz's new-look roster is challenging the status quo in the West.",
    "Tyler Herro's development is key to the Miami Heat's offensive potency.",
    "The Phoenix Suns are balancing veteran experience with youthful energy.",
    "Miles Bridges is becoming a standout player for the Charlotte Hornets.",
    "The Washington Wizards are crafting a new identity around Bradley Beal.",
    "The Atlanta Hawks are emerging as a powerhouse in the East.",
    "LaMelo Ball's flair is bringing a new level of excitement to the Hornets.",
    "The Toronto Raptors are blending youth and experience seamlessly.",
    "Cleveland Cavaliers' young core is setting the foundation for future success.",
    "The Minnesota Timberwolves are on the cusp of becoming a playoff regular.",
    "Keldon Johnson's growth is a bright spot for the San Antonio Spurs.",
    "The Chicago Bulls are finding a new rhythm under Billy Donovan's coaching.",
    "Dejounte Murray is establishing himself as a top guard in the league.",
    "The Dallas Mavericks' supporting cast is stepping up alongside Luka Doncic.",
    "OG Anunoby is becoming a two-way force for the Toronto Raptors."
];

function findPlayerResponse(input) {
  for (const player of topNBAPlayers) {
      if (input.includes(player.toLowerCase())) {
          return findTakeRelatedTo(player) || `I don't have any specific takes on ${player}.`;
      }
  }
  return null;
}


function findTakeRelatedTo(keyword) {
  keyword = keyword.toLowerCase();
  const relatedTakes = basketballTakes.filter(take => take.toLowerCase().includes(keyword));

  if (relatedTakes.length > 0) {
    const randomIndex = Math.floor(Math.random() * relatedTakes.length);
    return relatedTakes[randomIndex];
  }

  return null; // or a default message if no related takes are found
}
// Define a route for handling incoming messages
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  // Check for specific keywords in user's message
  if (userMessage.includes('lakers')) {
    const response = getRandomTake();
    res.json({ reply: response });
  } else if (userMessage.includes('steph curry')) {
    const response = getRandomTake();
    res.json({ reply: response });
  } else if (userMessage.includes('lebron james')) {
    const response = getRandomTake();
    res.json({ reply: response });
  } else if (userMessage.includes('schedule')) {
    const scheduleResponse = await getNBASchedule();
    res.json({ reply: scheduleResponse });
  } else if (userMessage.includes('espn takes')) {
    const espnTakesResponse = await getESPNTakes();
    res.json({ reply: espnTakesResponse });
  } else {
    res.json({ reply: "I'm not sure what you're talking about. Let's discuss basketball!" });
  }
});

// Helper function to get a random basketball take
function getRandomTake() {
  const randomIndex = Math.floor(Math.random() * basketballTakes.length);
  return basketballTakes[randomIndex];
}



function isGreeting(input) {
  const greetings = ['hello', 'hi', 'hey', 'greetings', 'howdy', 
                     'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 
                     'hi there', 'hey there', 'hi bot', 'good day', 'hola', 'bonjour', 
                     'ciao', 'namaste', 'good to see you', 'nice to meet you', 
                    'what\'s happening', 'your day', 
                     'how do you do'];
  return greetings.some(greeting => input.includes(greeting));
}


function getRandomGreeting() {
  const greetings = [
      "Hello! How can I assist you today?",
      "Hi there! Ready to talk about basketball?",
      "Hey! What's on your mind?",
      "Greetings! Anything specific you'd like to discuss?",
      // Add more greetings as needed
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

