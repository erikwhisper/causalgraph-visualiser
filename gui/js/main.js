//wir erstellen eine const von unserem "Convert" button aus der html in js
const convertButtonForPag = document.getElementById("pagConvertButton");

//wenn der button geklickt wird führen wir die funktion aus
convertButtonForPag.addEventListener("click", pagFileUpload);

// Nur für PAG Matrix, andere für ADMG erstellen
function pagFileUpload() {
  //wir erstellen eine const von unserer .csv Datei aus der html in js
  const pagFileInput = document.getElementById("pagCsvFileInput").files[0];
  if (pagFileInput) {
    readFile(pagFileInput, pagMatrixToDot);
  }
}

// Kann für PAG Matrix als auch für AMDG Matrices genutzt werden
//Für AMDG muss probably doch eine eigene her, da wir ja nur
//ein file und eine processFunction akzeptieren, maybe macht es das
//ganze dann auch übersichtlicher als alles in eine function zu stopfen
//TODO: rename into pagFileReader, aufpassen! nicht nur FileReader um 
//verwirrung zu vermeiden und für AMDG auch einen
function readFile(file, processFunction) {
  //Wir lesen unsere .csv datei hiermit ein (sollte auf für .txt gehen)
  const fr = new FileReader();

  //wenn fertig eingelesen erstellen wir eine const mit dem file Inhalt und rufen
  //unsere callback funktion auf, die hier für das übersetzen von matrix
  //zu dot-language code verantwortlich ist
  fr.onload = function (event) {
    const fileContent = event.target.result;

    //TODO: Das Ding hier entfernen, nur zum überprüfen ob der Inhalt der
    //.csv datei korrekt eingelesen wird, indem ich ihn im Feld für die
    //umgewandelte DOT-Language anzeige
    document.getElementById("pagToDotOutput").value = fileContent;

    processFunction(fileContent);
  };

  fr.readAsText(file);
}

function pagMatrixToDot(csvContent) {
  //to be implemented
  //Wir müssen iwie die definitionen der matrix auf die passenden
  //codes in der dot-language mappen und ausgeben, ausgeben in anderer
  //funktion machen
}
