const section = document.getElementById(`cards`)
if(localStorage.getItem('language')==null)
    localStorage.setItem('language', 'EN')
var modal = document.getElementById("myModal")
var modalText = document.getElementById("modalText")
var free = document.getElementById("analcoholic")
var span = document.getElementsByClassName("close")[0];
var langSelect=document.getElementById('langSelect')
const prep = []




function setLang(){
    //Effettuo un controllo per vedere se nel Localstorage vi è già salvata una impostazione di linguaggio,
    // in modo che se la pagina venisse ricaricata resta salvata l'impostazione, altrimenti verrà impostato il linguaggio rilevato dal OS.
    var key=localStorage.getItem('language')
    if(!key){
        var navlang=navigator.language
        var defaultLang=navlang.split(/[ -]+/)
        localStorage.setItem('language', defaultLang[0])
    }
    //Event listener che controlla se il select viene aggiornato, cambiando l'impostazione del OS
    langSelect.addEventListener('change', (event)=>{
        localStorage.setItem('language', langSelect.value)
        cleanResults()
        search()
    })
}

function cleanResults(res) {
    section.innerHTML = ""
    clearStorage()
}

function clearStorage() {
    for (var key in localStorage) {
        if (key != "language")
            localStorage.removeItem(key)
    }
}

function search() {
    var xhttp = new XMLHttpRequest()
    xhttp.open(`POST`, `/getResult`, true)
    xhttp.setRequestHeader(`Content-Type`, `application/json; charset=UTF-8`)
    var e = document.getElementById("searchBox")
    var param = document.getElementById("searchParams")
    clearStorage()
    /*INPUT CHECK -  IF IS A SINGLE CHAR, A STRING OR AN INGREDIENT*/
    //if radio.cocktail is checked
    if (param.value == "cocktail") {
        //if has 1 char -> ?f=
        if (e.value.length == 1) {
            cleanResults()
            var strpayload = "search.php?f=" + e.value
        }
        //else if has 2 or more char -> ?s=
        //i leave it without specifying 2 or more since the api if asked empty it returns some default drinks
        else if (e.value.length > 1) {
            cleanResults()
            var strpayload = "search.php?s=" + e.value
        }
        else {
            cleanResults()
            var strpayload = "random.php"
        }
        //else if radio.ingredients is checked
        //-> ?i=
    }
    else if (param.value == "ingredient") {
        if (e.value.length > 0) {
            //the api if asked empty it returns a default ingredient
            cleanResults()
            var strpayload = "search.php?i=" + e.value
        }
        else {
            cleanResults()
            return
        }
    }
    xhttp.send(
        JSON.stringify({ payload: strpayload })
    )
    xhttp.onload = function (e) {
        // Check if the request was a success
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            var response = xhttp.responseText;
            var json = JSON.parse(response);
            //print a card for each result
            if (json.drinks) {
                cleanResults()
                json.drinks.forEach(drink => {
                    if (localStorage.getItem('language') == 'it') {
                        if (drink.strInstructionsIT != null){
                            var instructions = drink.strInstructionsIT
                            var btnText="Scopri di più"
                        }
                        else{
                            var instructions = drink.strInstructions
                            var btnText="Discover more"
                        }
                    }
                    else if (localStorage.getItem('language') == 'de') {
                        if (drink.strInstructionsDE != null){
                            var instructions = drink.strInstructionsDE
                            var btnText="Finde mehr heraus"
                        }
                        else{
                            var instructions = drink.strInstructions
                            var btnText="Discover more"
                        }
                    }
                    else if (localStorage.getItem('language') == 'en') {
                        var instructions = drink.strInstructions
                        var btnText="Discover more"
                    }
                    else {
                        var instructions = "no instructions available in this language"
                    }
                    //RIMUOVO EVENTUALI LINE BREAKS DALLE ISTRUZIONI
                    tempStr = instructions.replaceAll(/(\r\n|\n|\r)/gm, "");
                    strInstructions = tempStr.replaceAll('"', "'")
                    //ISTRUZIONI E QUANTITÀ PER LA PREPARAZIONE
                    prep.push(strInstructions)
                    for (var i = 17; i < 32; i++) {
                        var arr = Object.values(drink)
                        if (arr[i] != null) {
                            prep.push(arr[i])
                            prep.push(arr[i + 15])
                        }
                    }
                    results =
                        '<div id="cocktail" class="col-3 col-s-6">'+
                            '<div class="card">' +
                                '<div class="card-cocktail-image">' +
                                    '<img src="' + drink.strDrinkThumb + '" style="width:100%">' +
                                '</div>' +
                                '<div class="card-cocktail-body">' +
                                    '<h3 class="card-cocktail-title" id="name">' + drink.strDrink + '</h3>' +
                                    '<p class="card-cocktail-text" id="isAlcoholic">' + drink.strAlcoholic + '</p>' +
                                    '<p><button onclick=showInstructions(' + drink.idDrink + ')>'+btnText+'</button></p>'+
                                '</div>' +
                            '</div>' +
                        '</div>'
                    // STAMPO LA CARTA CON IL DRINK
                    section.innerHTML += results
                    // SETTO NEL LOCALSTORAGE UN ARRAY CON ISTRUZIONI E QUANTITÀ PER PREPARAZIONE
                    localStorage.setItem(drink.idDrink, JSON.stringify(prep))
                    //svuoto l'array preparandolo per il prossimo drink
                    while (prep.length > 0) {
                        prep.pop()
                    }
                })
            }
            else if (json.ingredients) {
                cleanResults()
                var results = ``
                json.ingredients.forEach(ingredient => {
                    results += `
                        <div id="ingredient" class="card centered">
                            <div class="card-ingredient-body">
                                <h3 class="card-ingredient-title" id="name">`+ ingredient.strIngredient + `</h3>
                                <p class="card-ingredient-text" id="isAlcoholic">`+ ingredient.strDescription + `</p>
                            </div>
                        </div>
                    `
                })
                section.innerHTML = results
            }
        }
    }
}
function showInstructions(res) {
    //FORMAT PREP
    var prep = localStorage.getItem(res)
    var arr = JSON.parse(prep)
    var message = `<h1>Preparation</h1>
                            <p>`+ arr[0] + `</p>
                            <h1>Quantities</h1>
                            <ul>`
    for (var i = 1; i < arr.length; i++) {
        message += `<li>` + arr[i] + ` - ` + arr[i + 1] + `</li>`
        i++
    }
    message += `</ul>`
    modalText.innerHTML = message
    modal.style.display = "block";
    span.onclick = function () {
        modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}