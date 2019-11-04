
function randomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

function sumRangeInArray(arr, start, end) {
  if (start > end) {
    [start, end] = [end, start];
  } 
  return arr.slice(start, end+1).reduce((total, value) => Number(total) + Number(value))
}

function createRandomObjects(numberOfObjects, maxValue, maxWeight) {
  let object = {
    value: Array.from({length: numberOfObjects}, () => randomNumber(maxValue)),
    weight: Array.from({length: numberOfObjects}, () => randomNumber(maxWeight))
  }
  
  return object;
}

function createRandomKnapsack(maxWeight, objects) {
  let arr = [];
  let i = 0;
  let knapsackWeight = 0;
  
  //this might be cheating
  /*while(knapsackWeight < maxWeight && objects.weight.some(item => item <= (maxWeight - knapsackWeight))) {
    
    let validWeightPicks = objects.weight.reduce((acc,cur,idx) => {
      if(cur <= (maxWeight - knapsackWeight) && !arr.includes(idx)) {
        acc.push(idx);
      }
      return acc;
    },[]);
    
    if (!validWeightPicks.length) {
      break;
    }
    
    //console.log("valid: " + validWeightPicks);
    
    randomPick = randomNumber(validWeightPicks.length - 2);
    
    //console.log("pick: " + randomPick);
    arr.push(validWeightPicks[randomPick]);
    //console.log(arr);
    knapsackWeight += objects.weight[validWeightPicks[randomPick]];
    //console.log(knapsackWeight);
  }
  */
  //truly random, no cheating
  while (knapsackWeight < maxWeight && i <= maxWeight * 3) {
    randomPick = randomNumber(objects.weight.length - 2);
    
    if (!arr.includes(randomPick) && objects.weight[randomPick] + knapsackWeight <= maxWeight) {
      arr.push(randomPick);
      knapsackWeight += objects.weight[randomPick];
    }
    i++;
  }
  
  return arr;
} 

function checkFitness(knapsack, objects) {
  let fitness = 0;
  
  knapsack.forEach(item => fitness += objects.value[item]);
  
  return fitness;
}

function checkWeight(knapsack, objects) {
  let weight = 0;
  
  knapsack.forEach(item => weight += objects.weight[item]);

  return weight;
}

function enforceWeightLimit(knapsack, maxWeight, objects) {
  let weight = checkWeight(knapsack, objects);
  
  //knapsack.forEach(item => weight += objects.weight[item]);
  
  while(weight > maxWeight) {
    let randomRemove = randomNumber(knapsack.length - 2);
    weight -= objects.weight[knapsack[randomRemove]];
    knapsack.splice(randomRemove, 1);
  }
}

function mutateRandom(knapsack, objects) {
  let randomPick = randomNumber(objects.weight.length - 2);

  //only tries once, if no success there is no mutation.
  if (!knapsack.includes(randomPick)) {
    knapsack[randomNumber(knapsack.length - 2)] = randomPick; 
  }
}

function pairParents([...arr]) {
  let arrPaired = [];

  for(let sack in arr) {
    randomSack = randomNumber(arr.length - 1);
    arrPaired.push([arr[0], arr[randomSack]]);
    arr.splice(randomSack, 1);
    arr.shift();
  }
  
  
  return arrPaired;
}

function geneticRangeCrossover(knapsacks, maxWeight, generations, objects) {
  let reproductionArray = [];
  let survivalArray = [];
  let gens = generations;
  survivalArray[0] = Array.from({length: knapsacks.length}, (v, i) => 0);
  survivalArray[1] = Array.from({length: knapsacks.length}, (v, i) => knapsacks[i]);
  
  //Pair parents sacks
  for(let sack in knapsacks) {
    randomSack = randomNumber(knapsacks.length - 1);
    reproductionArray.push([knapsacks[0], knapsacks[randomSack]]);
    knapsacks.splice(randomSack, 1);
    knapsacks.shift();
  }
  
  while (gens > 0) {
    //loop
    
    if (gens !== generations) {
      reproductionArray = pairParents(survivalArray[1]);
      //survivalArray[0] = Array.from({length: survivalArray[0].length}, (v, i) => 0);
    }
    
    let rangeStartIndex = randomNumber(reproductionArray[0][0].length -1);
    let rangeEndIndex = randomNumber(reproductionArray[0][0].length -1);
    if (rangeStartIndex > rangeEndIndex) {
      [rangeStartIndex, rangeEndIndex] = [rangeEndIndex, rangeStartIndex];
    }
    
    //console.log(rangeStartIndex);
    //console.log(rangeEndIndex);
    
    for(let arr in reproductionArray) {
            
      reproductionArray[arr][2] = Array.from(reproductionArray[arr][0], x => x);   
      reproductionArray[arr][3] = Array.from(reproductionArray[arr][1], x => x); 
      let crossFrom0 = reproductionArray[arr][0].slice(rangeStartIndex, rangeEndIndex + 1);
      let crossFrom1 = reproductionArray[arr][1].slice(rangeStartIndex, rangeEndIndex + 1);
      //reproductionArray[arr][2].splice(rangeStartIndex, crossFrom1.length, ...crossFrom1);
      //reproductionArray[arr][3].splice(rangeStartIndex, crossFrom1.length, ...crossFrom0);
      //this might also be cheating or... dunno. reproduction method is free choice.
      reproductionArray[arr][2].splice(rangeStartIndex, 0, ...crossFrom1);
      reproductionArray[arr][3].splice(rangeStartIndex, 0, ...crossFrom0);
      
      //console.log(reproductionArray[arr][2]);
      //console.log(reproductionArray[arr][3]);
      
      let set2 = new Set(reproductionArray[arr][2]);
      reproductionArray[arr][2] = [...set2];
      let set3 = new Set(reproductionArray[arr][3]);
      reproductionArray[arr][3] = [...set3];

      //console.log(reproductionArray[arr][2]);
      //console.log(reproductionArray[arr][3]);
      
      //chance: random mutation
      reproductionArray[arr].forEach(sack => {
        if (Math.random() > 0.5) {
          for (let i = 1; i > 0; i--) {
            mutateRandom(sack, objects);
          }
        }
      });
            
      //remove excessive weight
      reproductionArray[arr].forEach(sack => enforceWeightLimit(sack, maxWeight, objects));
      
      //check wheight limit
      /*
      let weight = [];
      reproductionArray[arr].forEach(sack => weight.push(checkWeight(sack, objects)));
      console.log("wgt "+ weight);
      */
      
      //check fitness
      /*
      let fitness = [];
      reproductionArray[arr].forEach(sack => fitness.push(checkFitness(sack, objects)));
      console.log("fit " + fitness);    
      */
      
      //put best knapsacks into same length array as original
      reproductionArray[arr].forEach(sack => {
        let sackFitness = checkFitness(sack, objects);
        let leastFitIndex = survivalArray[0].findIndex(item => item == Math.min(...survivalArray[0]));
        if (survivalArray[0][leastFitIndex] <= sackFitness) {
          survivalArray[0][leastFitIndex] = sackFitness;
          survivalArray[1][leastFitIndex] = [...sack];
        }
      });

      //kick duplicates | might not need this if there is the no change after x tries kick
      /*
      console.log(survivalArray[0]);
      survivalArray[0].forEach((item, index) => {
        if(survivalArray[0].indexOf(item) !== index) {
          //survivalArray[0][index] = 0;
          console.log(survivalArray[1][index]);
          console.log(survivalArray[0][index]);
          for (let i = 10; i > 0; i--) {
            mutateRandom(survivalArray[1][index], objects);
            console.log(survivalArray[1][index]);
          }
          enforceWeightLimit(survivalArray[1][index], maxWeight, objects);
          survivalArray[0][index] = checkFitness(survivalArray[1][index], objects);
          console.log(survivalArray[1][index]);
          console.log(survivalArray[0][index]);
        }
      });
      */
      
      //console.log(reproductionArray[arr]);
      console.log(survivalArray[0]);
    }
  gens--;
  }
  
  return survivalArray; 
}

//let myObjects = createRandomObjects(100, 99, 10);
let myObjects = {
  value: [50, 67, 48, 53, 21, 53, 4, 1, 90, 88, 30, 49, 1, 77, 49, 60, 33, 61, 20, 2, 8, 2, 91, 29, 36, 47, 27, 41, 24, 32, 9, 56, 27, 32, 31, 1, 79, 31, 85, 25, 47, 5, 64, 90, 10, 79, 93, 87, 9, 61, 76, 83, 31, 44, 43, 25, 51, 20, 12, 86, 34, 87, 48, 70, 53, 52, 26, 51, 23, 99, 28, 48, 66, 37, 50, 68, 32, 97, 90, 4, 98, 93, 85, 21, 58, 19, 99, 36, 58, 94, 73, 36, 86, 97, 15, 41, 18, 37, 27, 24],
  weight: [9, 10, 2, 4, 6, 10, 8, 7, 1, 4, 4, 10, 8, 2, 10, 5, 6, 10, 5, 3, 10, 7, 6, 10, 3, 6, 7, 5, 4, 7, 9, 5, 4, 1, 10, 8, 8, 7, 7, 2, 5, 1, 7, 6, 9, 8, 1, 9, 10, 6, 3, 3, 10, 2, 7, 5, 1, 2, 6, 4, 1, 3, 9, 8, 8, 5, 4, 8, 7, 5, 2, 9, 5, 5, 6, 1, 7, 7, 4, 1, 7, 4, 7, 5, 10, 3, 10, 8, 7, 4, 2, 7, 6, 1, 1, 10, 1, 4, 8, 8]
}
let knapsacks = [];
for (let i = 4; i > 0; i--) {
  knapsacks.push(createRandomKnapsack(35, myObjects));
}

console.log(myObjects);

let before = knapsacks;
console.log(before);

let after = geneticRangeCrossover(knapsacks, 35, 50, myObjects);
console.log(after);

//let again = geneticRangeCrossover(after[1], 35, 50, myObjects);
//console.log(again);


/*
function genetic (point crossover)
check randomNumber -2 stuff is working
random range pick isn't good. it picks from [0][0]. It should pick from the longeste maybe? dunno
probably the random objects has a lot to do with start fitness and end results not changing much

no change kick it
!:
true random init
try push with mutate
try move range random inside for loop
ARE DUPLICATES WEHIGHT AND NTO INDEX?
*/


