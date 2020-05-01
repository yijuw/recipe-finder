import { apiKey } from './config.js';

const search = document.getElementById('search');
const submit = document.getElementById('submit');
const mealsEl = document.getElementById('meals');
const resultHeading = document.getElementById('result-heading');
const single_mealEl = document.getElementById('single-meal-element');
const backdrop = document.querySelector('.backdrop');


//Search Meal and fetch from API
function searchMeal(e) {
    e.preventDefault();
  
    //Clear single meal
    single_mealEl.innerHTML = '';
  
    //Get search term
    const term = search.value;
    //Check for empty
    if(term.trim()) {
      fetch(`
      https://api.spoonacular.com/recipes/search?query=${term}&apiKey=${apiKey}
      `)

        .then(response => {
          if(response.status >= 200 && response.status <= 300) {
            return response.json();
          } else {
           return response.json().then(errData => {
            console.log(errData)
            throw new Error('Something went wrong - server-side');
            })
          }
        })
        .catch(error => {
            console.log(error);
            throw new Error('Something went wrong!')
        })
        .then(data => {
          console.log(data.results);
          resultHeading.innerHTML = `<h2>Search results for '${term}':</h2>`
          if(data.results.length === 0) {
            resultHeading.innerHTML = `<p>There are no search results. Try again.</p>`
          } else {
            mealsEl.innerHTML = data.results.map(meal => {
              let imageType
              if(meal.image) {
                imageType = meal.image.slice((meal.image.lastIndexOf(".") - 1 >>> 0) + 2);
              } 
            return `
                <div class="meal"> 
                <img src="https://spoonacular.com/recipeImages/${meal.id}-312x231.${imageType}" alt="${meal.title}"/>
                    <div class="meal-info" data-mealID="${meal.id}">
                        <h3>${meal.title}</h3>
                    </div>
                </div>
            `})
            .join('');
          }
        });
      
    } else {
      alert('Please enter a search term')
    }
  
  }

//Fetch meal by ID
function getMealById(mealID) {
  fetch(` https://api.spoonacular.com/recipes/${mealID}/information?includeNutrition=false&apiKey=${apiKey}`)
  .then(response => {
    if(response.status >= 200 && response.status <= 300) {
    
      return response.json();
    } else {
     return response.json().then(errData => {
      console.log(errData)
      throw new Error('Something went wrong - server-side');
      })
    }
  })
  .catch(error => {
      console.log(error);
      throw new Error('Something went wrong!')
  })
  .then(meal => {
    addMealInfoToDOM(meal);
  })
}



// Add meal to DOM
function addMealInfoToDOM(meal) {
  console.log(meal)
  
  single_mealEl.innerHTML = `
    <h1>${meal.title}</h1>
    <img src="https://spoonacular.com/recipeImages/${meal.id}-556x370.${meal.imageType}" alt="${meal.title}" />
    <div class="single-meal-info">
      <div class="single-meal-serving">  Servings: ${meal.servings? `<p>${meal.servings}</p>` : ''}</div>
      <div class="single-meal-time">  Ready in: ${meal.readyInMinutes ? `<p>${meal.readyInMinutes} minutes</p>` : ''}  </div>
    </div>
    <div class="main">
      <h2>Ingredients</h2>
        <div class="ingredients">
            ${meal.extendedIngredients.map(ing =>{
              return `
                <div>${ing.name}</div>
                <div>${ing.measures.metric.amount} ${ing.measures.metric.unitShort}</div>
              `
            }
            ).join('')}
        </div>
        <div class="instructions">
        <h2>Instructions</h2>
        <div class=steps>
        ${meal.analyzedInstructions.length > 0 ?
          meal.analyzedInstructions[0].steps.map(instruction => `
            <div>${instruction.number}:</div>
            <div>${instruction.step}</div>
          `).join('') : ''}
        </div>
        </div>
    </div>
`
;

}

submit.addEventListener('submit', searchMeal);
mealsEl.addEventListener('click', e => {
  const mealInfo = e.target.closest('.meal-info');
  if(mealInfo) {
    const mealID = mealInfo.getAttribute('data-mealID');
    getMealById(mealID);
    backdrop.classList.add('open');
    single_mealEl.style.display = 'block'

  } else {
    return false
  }

})
backdrop.addEventListener('click', function() {
  single_mealEl.style.display = 'none'
  backdrop.classList.remove('open');
})