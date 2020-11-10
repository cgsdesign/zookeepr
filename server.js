// npm init -y  then npm i express to install express (npm init -y) stands for implicit yes to all prompts
const express = require('express')
const { animals } = require('./data/animals'); //rout front end can get data from

const app = express(); //startes express

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

//below /api/animals' = route string  to get data,   (req, res)call back funtion to execute every time rout is accesses with git request
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });
    //res.json(animals);//replace send with .json to send normal API json data



//port below is one of many options, some have restrictions on then while 80 and 443(https) are normal for most sites
app.listen(3001, () => {
    console.log(`API server now on port 3001!`);
  });//listen