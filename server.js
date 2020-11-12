// npm init -y  then npm i express to install express (npm init -y) stands for implicit yes to all prompts
// git add -A
// git commit -m "Add Heroku"
// git push heroku feature/MVP:main = to bypass heroku not willing to go to anything not main
// NOTE branch MUST be commited first indempendantly or this wont work. 
//to see life site, comand line heroku open
// to run with animals  https://shrouded-castle-54418.herokuapp.com/api/animals
// npm install
// npm  init express
//npm init y
//will have to run servers each time
//node server.js - this is how we run the code so we can see it on the server. The http will be http://localhost:PORTNUMBER/DATA/QUALIFIERS
//fetch() is the front end API equvalent to app.get

const fs = require('fs');
const path = require('path');
//bove is needed to make editing our database file possible
const express = require('express')
const { animals } = require('./data/animals'); //rout front end can get data from
const PORT = process.env.PORT || 3001;
const app = express(); //startes express
app.use(express.static('public'));//links all front end files in to live page client side
//!!!!!!!!!!____________Both ofhte section below MUST BE INCLUDED IF ACCEPTING POST DATA
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));//{ extended: true } means that we may have sub aray data coming in, so it will need ot parse it
// parse incoming JSON data
app.use(express.json());
//-----------------------------------------//
//------STARTING GET REQUESTS (Fetch API)-------------//
//-----------------------------------------//

//ROUT 1 Functions
//filter first, then plug how to filter into get formula
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults below:
    let filteredResults = animalsArray;//original data search (matches diet/species/name)
    if (query.personalityTraits) {
      // Save personalityTraits as a special array listed above.
      // If personalityTraits is a string, place it into a new array and save.
      if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
      } else {
        personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:

      personalityTraitsArray.forEach(trait => {//find
        // Check the trait against each animal in the filteredResults array.
        // Remember, it is initially a copy of the animalsArray,
        // but here we're updating it for each trait in the .forEach() loop.
        // For each trait being targeted by the filter, the filteredResults
        // array will then contain only the entries that contain the trait,
        // so at the end we'll have an array of animals that have every one 
        // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(//filter
          animal => animal.personalityTraits.indexOf(trait) !== -1
        );
      });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet)
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species)
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name)
    }
    return filteredResults
}


//Rout 2 function
function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}
//ROUT 1 CALL
//below /api/animals' = route string  to get data,   (req, res)call back funtion to execute every time rout is accesses with git request
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);// filterByQuery for multiple paramiters
    }
    res.json(results);
  });
    //res.json(animals);//replace send with .json to send normal API json data

//ROUT 2 CALL
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);//findByID for single search paramater
    if (result) {
      res.json(result);
    } else {
      res.send(404);//IF NO ANIMAL
    }
});
//!!!!!!!!!!!!!!!!!!!!_____________WHAT DOES THIS MEAN A param route must come after the other GET route.   
//findByID(req.params...) id when you only need to find ONE result becasue ID is unique. Consequently no need for coplicated query function used with filteredResults 

//-----------------------------------------//
//------STARTING POST REQUESTS-------------//
//-----------------------------------------//
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true
}

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);//pushes to local version, not real file 
  fs.writeFileSync(//pushes to real main file
    path.join(__dirname, './data/animals.json'),//defines sub directory and file tp add into to
    JSON.stringify({ animals: animalsArray }, null, 2)// save JS array as JSON. Null says dont edit existing data, 2 says give space between old and new data to keep it organized
  );
  return animal;
}

app.post('/api/animals', (req, res) => {
  // set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  // if any data in req.body is incorrect, send 400 error back
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {
    const animal = createNewAnimal(req.body, animals);
    res.json(animal);
  }
});

//-------------------------------------------------//
//-----STARTING CODE TO CONNECT WITH LIVE PAGE-----//
//-------------------------------------------------//
//belows app.get('/') is to default to homepage
//res.sendFile only sends astreight up file so for out uses our base page HTML file
//path.join is the universal to find a file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

//CALL SEARCHES LISTENER
//port below is one of many options, some have restrictions on then while 80 and 443(https) are normal for most sites
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });//listen