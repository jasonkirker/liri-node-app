require("dotenv").config();
var chalk = require('chalk');
var fs = require('fs');
// Import the keys.js file.
var keys = require("./keys.js");
var moment = require('moment');
var request = require('request');
var Spotify = require('node-spotify-api');

var log = console.log;

// for command line arguments
var cmd = process.argv[2];
var input = process.argv[3];
for (var i = 4; i < process.argv.length; i++) {
    input += (" " + process.argv[i]);
};

// switch
switch (cmd) {
    case "concert-this":
        concertThis();
        break;
    case "spotify-this-song":
        spotifyThisSong();
        break;
    case "movie-this":
        movieThis();
        break;
    case "do-what-it-says":
        break;    
    default:
        help();
        break;
};

// Function definitions
function help() {
    log("\n" + chalk.bgMagenta.bold("Not a command. Here are vailable commands:") + "\n\n" +
      "   " + chalk.green("concert-this") + " <artist name>\n" +
      "   " + chalk.green("spotify-this-song") + " <song name>\n" +
      "   " + chalk.green("movie-this") + " <movie name>\n" +
      "   " + chalk.green("do-what-it-says") + " (Runs command in random.txt)\n");
    process.exit(1);
  };
  
  function concertThis() {
    if (!input) {
      log("\n" + chalk.bgMagenta.underline("Error - please add an artist!\n"));
      log("Usage: node liri.js concert-this <artist-name>\n");
      return;
    } else {
      var artist = input.trim();
    };
  
    var queryUrl = "https://rest.bandsintown.com/artists/" + artist.replace(/ /g, "+") + "/events?app_id=" + keys.BIT;
    request(queryUrl, function (error, response, body) {
      if (error) return console.log(error);
      if (!error && response.statusCode === 200) {
        if (body.length < 20) {
          return log(chalk.bgMagenta.underline("\nNo results found...\n"));
        };
        var data = JSON.parse(body);
        for (var i = 0; i < 3; i++) {
          log(chalk.red.bold("#" + (i + 1)));
          log(chalk.green.bold("Venue:     ") + data[i].venue.name);
          log(chalk.green.bold("Location:  ") + data[i].venue.city + ", " + data[i].venue.country);
          log(chalk.green.bold("Date:      ") + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n");
          var logData =
            `Artist: ${artist}\n` +
            `Venue: ${data[i].venue.name}\n` +
            `Location: ${data[i].venue.city}, ${data[i].venue.country}\n` +
            "Date: " + moment(data[i].datetime, 'YYYY-MM-DD').format('MM/DD/YYYY') + "\n";
          logFile(logData);
          logFile("-\n");
        };
      };
    });
  };
  
  function movieThis() {
    if (!input) {
      log(chalk.blue.underline("\nNo movie specified. How about Rush Hour?"))
      var movie = "Rush Hour";
    } else {
      var movie = input.trim().replace(/ /g, "+");
    };
  
    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=" + keys.omdb;
    request(queryUrl, function (error, response, body) {
      if (error) return console.log(error);
      
        var data = JSON.parse(body);
        console.log(data);
        if (data.Response === "False") return log(chalk.bgMagenta.underline("\nMovie not found.\n"));
        var actors = data.Actors;
        var actorsArr = actors.split(',');
        if (data.Ratings == []) {
          var rottenTomatoes = "N/A"
        } else {
          if (data.Ratings.find(rating => rating.Source === "Rotten Tomatoes")) {
            var rottenTomatoes = data.Ratings.find(rating => rating.Source === "Rotten Tomatoes").Value;
          } else {
            var rottenTomatoes = "N/A";
          }
        };
        log('');
        log(chalk.blue.bold("Title: ") + data.Title);
        log(chalk.blue.bold("Year: ") + data.Year);
        log(chalk.blue.bold("IMDB rating: ") + data.imdbRating);
        log(chalk.blue.bold("Rotten Tomatoes rating: ") + rottenTomatoes);
        log(chalk.blue.bold("Produced in: ") + data.Country);
        log(chalk.blue.bold("Language: ") + data.Language);
        log(chalk.blue.bold("Plot: \n") + data.Plot);
        log(chalk.blue.bold("Actors:"));
        for (var j = 0; j < actorsArr.length; j++) {
          log('- ' + actorsArr[j].trim());
        };
        log('');
  
        var logData =
          `Title: ${data.Title}\n` +
          `Year: ${data.Year}\n` +
          `IMDB rating: ${data.imdbRating}\n` +
          `Rotten Tomatoes rating: ${rottenTomatoes}\n` +
          `Produced in: ${data.Country}\n` +
          `Language: ${data.Language}\n` +
          `Plot: ${data.Plot}\n` +
          `Actors: ${actors}\n`;
        logFile(logData);
        logFile("-\n");
      
    });
  };
  
  
  function spotifyThisSong() {
    var spotify = new Spotify({
      id: keys.spotify.id,
      secret: keys.spotify.secret,
    });
    if (!input) {
      log(chalk.bgCyan.underline("\nNo song specified. How about South Park Mexican by South Park Mexican?"));
      var song = "South Park Mexican";
    } else {
      var song = input.trim();
    }
    spotify.search({ type: 'track', query: song }, function (err, data) {
      if (err) return log(chalk.bgMagenta.underline('\nSong not found.\n'))
      console.log(data.tracks);
      log('');
      log(chalk.blue.bold("Title: ") + name);
      log(chalk.blue.bold("Artist: ") + artist);
      log(chalk.blue.bold("Album: ") + album);
      if (preview) {
        log(chalk.blue.bold("Preview (30 sec): ") + preview);
      } else {
        log(chalk.bgMagenta.bold("No preview available."));
      };
      log('');
  
      var logData =
        `Title: ${name}\n` +
        `Artist: ${artist}\n` +
        `Album: ${album}\n` +
        `Preview: ${preview}\n`;
  
      logFile(logData);
      logFile("-\n");
    });
  };
  
  
  function doWhatItSays() {
    fs.readFile('random.txt', 'utf8', function (err, data) {
      if (err) return console.log(err);
  
      if (data.trim().includes("do-what-it-says")) {
        log(chalk.bgMagenta.underline("\nError:") + " Error - choose another command.\n");
        return;
      };
      var arr = data.split(',');
      switch (arr[0]) {
        case "concert-this":
          input = arr[1].trim();
          concertThis();
          break;
        case "spotify-this-song":
          input = arr[1].trim();
          spotifyThisSong();
          break;
        case "movie-this":
          input = arr[1].trim();
          movieThis();
          break;
        default:
          help();
          break;
      };
    });
  };
  
  function logFile(appendThisToLog) {
    fs.appendFile('log.txt', appendThisToLog, function (err) {
      if (err) return console.log(err);
    });
  };