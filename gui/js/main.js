//START: EVENT LISTENERS FOR BUTTONS//

//BUTTON 1: const von "Einlesen" button
const readinButtonForPag = document.getElementById("pagInitializeButton");
readinButtonForPag.addEventListener("click", pagFileUpload);

//BUTTON 2: const von unserem "MatrixToDot" button
const convertPagToDotButton = document.getElementById("pagToDotButton");
convertPagToDotButton.addEventListener("click", convertEditedMatrixToDot);

//BUTTON 3: const von userem "DotToMatrix"
const convertDotToMatrixButton = document.getElementById("dotToMatrixButton");
convertDotToMatrixButton.addEventListener("click", convertDotToMatrix);

//START: EVENT LISTENERS FOR BUTTONS//

// NEU //
function convertDotToMatrix() {/*to be implemented*/}
// NEU //

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

//Wir haben die verwendung von "document" aus den anderen functions rausgezogen
function initializePagConversion(csvContent) {
  const parsedPagMatrix = pagParseContent(csvContent); //NEU +line

  //zeigt matrix aus csv an
  const unchangedMatrixOutput = pagFormatMatrix(csvContent);
  document.getElementById("pagDotToMatrixOutput").value = unchangedMatrixOutput;

  //zeigt inhalt aus csv in dot-language umgewandelt an
  const dotGraph = convertMatrixToDot(parsedPagMatrix); //NEU csvContent -> parsedPagMatrix && pagMatrixToDot -> convertMatrixToDot
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

function convertEditedMatrixToDot() {
  //holt sich den inhalt der textarea mit gegebeber id
  const currentPagMatrix = document.getElementById(
    "pagDotToMatrixOutput"
  ).value;
  //bereitet aktuelle textfeld matrix vor
  const parsedPagMatrix = pagParseContent(currentPagMatrix);
  //sorgt fürs magische matrix to dot umformen
  const dotGraph = convertMatrixToDot(parsedPagMatrix);
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

function pagFormatMatrix(csvContent) {
  const zeilen = pagParseContent(csvContent);
  return zeilen.map((row) => row.join(", ")).join("\n");
}

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

//refactored variante die die schon angepasste .csv und textarea direkt umwandelt
function convertMatrixToDot(parsedPagMatrix) {
  const knotenNamen = parsedPagMatrix[0].slice(1);
  const dotEdges = new Set();

  for (let i = 1; i < parsedPagMatrix.length; i++) {
    const quellKnoten = parsedPagMatrix[i][0];
    for (let j = i + 1; j < parsedPagMatrix[i].length; j++) {
      const kantenTypFromTo = parseInt(parsedPagMatrix[i][j]);
      const kantenTypToFrom = parseInt(parsedPagMatrix[j][i]);
      const zielKnoten = knotenNamen[j - 1];

      const edge = pagCreateDotEdges(
        quellKnoten,
        zielKnoten,
        kantenTypFromTo,
        kantenTypToFrom
      );
      if (edge) {
        dotEdges.add(edge);
      }
    }
  }

  return `digraph {\n${[...dotEdges].join("\n")}\n}`;
}
