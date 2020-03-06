// ==UserScript==
// @name         Manga Release Date Grabber
// @namespace    https://github.com/gboi
// @version      1.0
// @description  Recupera la data di uscita dei volumi uscenti sulla pagina del calendario di AnimeClick e calcola la spesa totale
// @author       gboi
// @match        https://www.animeclick.it/calendario-manga
// @grant        GM_addStyle
// @supportURL   https://github.com/gboi/Manga-Release-Date-Grabber
// ==/UserScript==

// Lista dei titoli da considerare, in lowercase
var want = ["vinland saga",
            "mob psycho 100",
            "dungeon food",
            "bloom into you",
            "boruto",
            "dragon quest saga - l'emblema di roto ii - gli eredi dell'emblema",
            "born to be on air!"];

var myDiv;

(function() {
    'use strict';
    
    addCss();
    
    var listButton = createListButton('#calendario-pagination-div');

    listButton.click(() => printList() );

})();

function createListButton(parentDiv){
	var buttonParagraph = $('<p/>', {
        id: "button-paragraph"
    }).appendTo(parentDiv);
    
    var listButton = $('<button/>', {
        id: "list-button",
        class: 'btn btn-default',
        html: 'Miei manga in pagina'
    }).appendTo(buttonParagraph);
	
	return listButton;
}

function addCss(){
    GM_addStyle('#list-button { margin: 10px }');
    GM_addStyle('#mie-uscite {background-color: white; border-radius: 25px; padding: 1px 20px 20px 20px; }');
    GM_addStyle('#mie-uscite h3 { color: #ec1f27; }');
    GM_addStyle('#mie-uscite h4 { color: #39548d; }');
    GM_addStyle('#mie-uscite p { font-style: italic }');
    GM_addStyle('#mie-uscite p.date { font-weight: bold }');
}

function printMangas(){
    $('.panel-evento-calendario').each(function() {
        var box = $(this);
        
        var title = box.find('h5').html();
        if(want.includes(title.toLowerCase())){
            var volume = box.find('h3').html();
            var url = box.find('a').attr("href");

            fetch(url).then((response) => response.text()
                           ).then((result) => {
                var manga = {
                    'title': title,
                    'volume': volume,
                    'url': url,
                    'date': getDate(result),
                    'price': getPrice(result)
                }
                printManga(manga, myDiv);
            });
        }
    });
}

function printList(){
    myDiv = $('#mie-uscite');
    if(myDiv.length!=0){
        return;
    }

    myDiv = $('<div/>', {
        id: 'mie-uscite'
    }).appendTo('.calendario-mese');

    printHeader();
    printMangas();
}

function printHeader(){
    myDiv.append('<h3>Uscite che m\'interessano</h3>');

    var totalButton = $('<button/>', {
        id: "total-button",
        html: 'Totale spese',
        class: 'btn btn-default'
    }).appendTo(myDiv);
	
    totalButton.click(printTotal);
}

function printManga(manga){
    myDiv.append('<h4>' + manga.volume + '</h4>');
    myDiv.append('<p><span class="date">' + manga.date + '</span> - <span class="price">' + manga.price + '</span> €</p>');
}

function printTotal(){
    if($('#totale-spese').length != 0){
        return;
    }
    var total = 0;
    $('#mie-uscite .price').each(function(index, price) {
        total += parseFloat(price.innerHTML.replace(',','.'));
    });
    myDiv.append('<strong id="totale-spese">Totale:</strong> ' + total.toFixed(2).replace('.',',') + ' €');
}

function getPrice(data){
    var regex = /<strong>Prezzo:<\/strong>&nbsp;(\d*,\d*)&nbsp;/;
    var price = regex.exec(data)[1];
    return price;
}

function getDate(data){
    var regex = /<strong>Data pubblicazione:<\/strong>&nbsp;(\d*\/\d*)\/\d*/;
    var date = regex.exec(data)[1];
    return date;
}
