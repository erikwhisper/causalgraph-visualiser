//TODO: pagMatrixToDot und textareaPagMatrixToDot iwie zu einer Funktion
//zusammenführen

//START: EVENT LISTENERS FOR BUTTONS//

//BUTTON 1: const von "Einlesen" button
const readinButtonForPag = document.getElementById("pagInitializeButton");
readinButtonForPag.addEventListener("click", pagFileUpload);

//BUTTON 2: const von unserem "pagToDot" button
const convertPagToDotButton = document.getElementById("pagToDotButton");
convertPagToDotButton.addEventListener("click", convertEditedMatrixToDot);

//START: EVENT LISTENERS FOR BUTTONS//

//FUNCTION FOR BUTTON 1: Nur für PAG Matrix, andere für ADMG erstellen
function pagFileUpload() {
  //Erstellt const von .csv Datei aus der html
  const pagFileInput = document.getElementById("pagCsvFileInput").files[0];
  if (pagFileInput) {
    readFile(pagFileInput, initializePagConversion);
  }
}

//TODO: rename into pagFileReader, aufpassen! nicht nur FileReader um
//TODO: für amdg eigene erstellen
function readFile(file, processFunction) {
  //Wir lesen unsere .csv datei hiermit ein (sollte auf für .txt gehen)
  const fr = new FileReader();

  fr.onload = function (event) {
    const fileContent = event.target.result;
    processFunction(fileContent);
  };

  fr.readAsText(file);
}

// NEU //

//to be implemented/refactored

// NEU //

//Wir haben die verwendung von "document" aus den anderen functions rausgezogen
function initializePagConversion(csvContent) {
  //zeigt matrix aus csv an
  const unchangedMatrixOutput = pagFormatMatrix(csvContent);
  document.getElementById("pagDotToMatrixOutput").value = unchangedMatrixOutput;

  //zeigt inhalt aus csv in dot-language umgewandelt an
  const dotGraph = pagMatrixToDot(csvContent);
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

function convertEditedMatrixToDot() {
  //matrix aus textfeld einlesen, anstatt aus file
  const currentPagMatrix = document.getElementById(
    "pagDotToMatrixOutput"
  ).value;

  //parsen, wie beim file und in dot-language uebersetzen und anzeigen
  const parsedPagMatrix = pagParseContent(currentPagMatrix);
  const dotGraph = textareaPagMatrixToDot(parsedPagMatrix);
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

function pagFormatMatrix(csvContent) {
  const zeilen = pagParseContent(csvContent);
  return zeilen.map((row) => row.join(", ")).join("\n");
}

//NEU//////////////////////////

//.csv content in angenehmeres Format umwandeln
function pagParseContent(csvContent) {
  return csvContent
    .trim()
    .split("\n")
    .map((row) => row.split(","));
}

function pagCreateDotEdges(
  quellKnoten,
  zielKnoten,
  kantenTypFromTo,
  kantenTypToFrom
) {
  //zunächst bidirectionale Kanten behandeln
  if (kantenTypFromTo === 2 && kantenTypToFrom === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=odot];`;
  } else if (kantenTypFromTo === 1 && kantenTypToFrom === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=odot];`;
  } else if (kantenTypFromTo === 1 && kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=normal];`;
  } else if (kantenTypFromTo === 2 && kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=normal];`;
  } else if (kantenTypFromTo === 2 && kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=none];`;
  } else if (kantenTypFromTo === 3 && kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=normal];`;
  } else if (kantenTypFromTo === 3 && kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=none];`;
  }
  //kantenTypFromTo = 1,2,3 und kanytenTypToFrom = 0:
  else if (kantenTypFromTo === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=none];`;
  } else if (kantenTypFromTo === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=none];`; //not tee!
  } else if (kantenTypFromTo === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=odot];`;
  }
  //kantenTypToFrom = 1,2,3 und kantenTypFromTo = 0:
  else if (kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=normal];`;
  } else if (kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=none];`; //not tee!
  } else if (kantenTypToFrom === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=normal];`;
  }
  return null;
}

//TODO: Diese Funktion ist für den Button verantwortlich der aus der
//Matrix aus der *.csv-datei* eine Dot-language variante erstellt
function pagMatrixToDot(csvContent) {
  //Inhalt mit pagParseContent vorbereiten und speichern
  const zeilen = pagParseContent(csvContent);

  //Erste Zeile und Spalte sind identisch, daher können wir uns einf aus einem
  //der beiden, hier jetzt der ersten Zeile die Knoten unseres Graphens
  //rausnehmen
  const knotenNamen = zeilen[0].slice(1);

  //Hier werden die umgewandelten kanten in dot-language drin gespeichert
  const dotEdges = new Set();

  //hier passiert die magie, wir wandeln die matrix in dot-language format um
  for (let i = 1; i < zeilen.length; i++) {
    const quellKnoten = zeilen[i][0];
    for (let j = i + 1; j < zeilen[i].length; j++) {
      const kantenTypFromTo = parseInt(zeilen[i][j]);
      const kantenTypToFrom = parseInt(zeilen[j][i]);
      const zielKnoten = knotenNamen[j - 1];

      //Wandle Kante von angepasstem Matrix format in dot-language um
      const edge = pagCreateDotEdges(
        quellKnoten,
        zielKnoten,
        kantenTypFromTo,
        kantenTypToFrom
      );
      //Fügt die edges in Dot-Language nem set hinzu
      if (edge) {
        dotEdges.add(edge);
      }
    }
  }

  return `digraph {\n${[...dotEdges].join("\n")}\n}`;
}

//TODO: Diese Funktion ist für den Button verantwortlich der aus der
//Matrix im *textfeld* eine Dot-language variante erstellt
function textareaPagMatrixToDot(parsedPagMatrix) {
  const knotenNamen = parsedPagMatrix[0].slice(1);

  //Hier werden die umgewandelten kanten in dot-language drin gespeichert
  const dotEdges = new Set();

  //hier passiert die magie, wir wandeln die matrix in dot-language format um
  for (let i = 1; i < parsedPagMatrix.length; i++) {
    const quellKnoten = parsedPagMatrix[i][0];
    for (let j = i + 1; j < parsedPagMatrix[i].length; j++) {
      const kantenTypFromTo = parseInt(parsedPagMatrix[i][j]);
      const kantenTypToFrom = parseInt(parsedPagMatrix[j][i]);
      const zielKnoten = knotenNamen[j - 1];

      //Wandle Kante von angepasstem Matrix format in dot-language um
      const edge = pagCreateDotEdges(
        quellKnoten,
        zielKnoten,
        kantenTypFromTo,
        kantenTypToFrom
      );
      //Fügt die edges in Dot-Language nem set hinzu
      if (edge) {
        dotEdges.add(edge);
      }
    }
  }

  return `digraph {\n${[...dotEdges].join("\n")}\n}`;
}
