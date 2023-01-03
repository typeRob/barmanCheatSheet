const section = document.getElementById(`cards`)
var h2=document.getElementById('randomH2')
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
    // in modo che se la pagina venisse ricaricata resta salvata l'impostazione, 
    //altrimenti verrà impostato il linguaggio rilevato dal OS.
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
    //pulizia del div con i drink ottenuti dall'API
    section.innerHTML = ""
    clearStorage()
}

function clearStorage() {
    //pulizia dello storage, lasciando la lingua selezionata per mantenere l'UI integra
    for (var key in localStorage) {
        if (key != "language")
            localStorage.removeItem(key)
    }
}

function search() {
    //ricerca di drink/ingredienti tramite l'API via nodejs, parametri passati tramite AJAX per una
    //ricerca asincrona e ottenuti in JSON
    var xhttp = new XMLHttpRequest()
    xhttp.open(`POST`, `/getResult`, true)
    xhttp.setRequestHeader(`Content-Type`, `application/json; charset=UTF-8`)
    var e = document.getElementById("searchBox")
    var param = document.getElementById("searchParams")
    clearStorage()
    /*CONTROLLO INPUT E PULIZIA, se un solo char o più di uno*/
    //controllo se è selezionato cocktail o ingredient
    if (param.value == "cocktail") {
        //se ha 1 char -> ?f=
        if (e.value.length == 1) {
            cleanResults()
            h2.textContent=""
            var strpayload = "search.php?f=" + e.value
        }
        //se ha 2 o più char -> ?s=
        //l'api gestisce automaticamente la ricerca non completa delle parole, quindi specifico semplicemente
        //se ne ha più di uno
        else if (e.value.length > 1) {
            cleanResults()
            h2.textContent=""
            var strpayload = "search.php?s=" + e.value
        }
        //se la barra di ricerca è vuota(quindi anche al caricamento della pagina) stampo a video un cocktail random
        else {
            cleanResults()
            if(localStorage.getItem('language')=='it')
                h2.textContent="Cocktail consigliato:"
            else if(localStorage.getItem('language')=='de')
                h2.textContent="Empfohlener cocktail:"
            else
                h2.textContent="Suggested cocktail:"
            var strpayload = "random.php"
        }
        //se è checkato ingredient -> ?i=
    }
    else if (param.value == "ingredient") {
        if (e.value.length > 0) {
            //se l'api non riceve input torna un ingrediente di default
            cleanResults()
            h2.textContent=""
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
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            var response = xhttp.responseText;
            var json = JSON.parse(response);
            //stampo una card per ogni cocktail
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
    //formattazione istruzioni
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
    // chiude il modal quando l'utente clicca al di fuori della sua area
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}