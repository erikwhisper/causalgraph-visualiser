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

//END: EVENT LISTENERS FOR BUTTONS//

//---------------------------------//
//--------PAG SECTION START--------//
//---------------------------------//

//------FUNCTION FOR BUTTON 1------//
//Nur für PAG Matrix, andere für ADMG erstellen
function pagFileUpload() {
  const pagFileInput = document.getElementById("pagCsvFileInput").files[0];
  if (pagFileInput) {
    pagFileReader(pagFileInput, initializePagConversion);
  }
}

//TODO: für amdg eigene erstellen
//TODO: .txt support hinzufügen
function pagFileReader(file, processFunction) {
  const fr = new FileReader();

  fr.onload = function (event) {
    const fileContent = event.target.result;
    processFunction(fileContent);
  };

  fr.readAsText(file);
}

function initializePagConversion(csvContent) {
  const parsedPagMatrix = pagParseContent(csvContent);

  //zeigt matrix aus csv an
  const unchangedMatrixOutput = pagFormatMatrix(csvContent);
  document.getElementById("pagDotToMatrixOutput").value = unchangedMatrixOutput;

  //zeigt inhalt aus csv in dot-language umgewandelt an
  const dotGraph = convertMatrixToDot(parsedPagMatrix); //NEU csvContent -> parsedPagMatrix && pagMatrixToDot -> convertMatrixToDot
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

function pagFormatMatrix(csvContent) {
  const zeilen = pagParseContent(csvContent);
  return zeilen.map((row) => row.join(", ")).join("\n");
}

//------FUNCTION FOR BUTTON 1------//

//---------------------------------//

//------FUNCTION FOR BUTTON 2------//

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

//------FUNCTION FOR BUTTON 2------//

//---------------------------------//

//----ALLGEMEINE FUNCTION (1&2)----//

//.csv content in angenehmeres Format umwandeln
function pagParseContent(csvContent) {
  return csvContent
    .trim()
    .split("\n")
    .map((row) => row.split(","));
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

function pagCreateDotEdges(
  quellKnoten,
  zielKnoten,
  kantenTypFromTo,
  kantenTypToFrom
) {
  //zunächst bidirectionale Kanten behandeln
  //alle cases mit 1 vorne
  if (kantenTypFromTo === 1 && kantenTypToFrom === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=odot];`;
  } else if (kantenTypFromTo === 1 && kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=normal];`;
  } else if (kantenTypFromTo === 1 && kantenTypToFrom === 3) {
    //fehlte!!
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=tail];`;
  }

  //alle cases mit 2 vorne
  else if (kantenTypFromTo === 2 && kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=normal];`;
  } else if (kantenTypFromTo === 2 && kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=tail];`;
  } else if (kantenTypFromTo === 2 && kantenTypToFrom === 1) {
    //fehlte!!
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=odot];`;
  }

  //alle cases mit 3 vorne
  else if (kantenTypFromTo === 3 && kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=tail, arrowtail=normal];`;
  } else if (kantenTypFromTo === 3 && kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=tail, arrowtail=tail];`;
  } else if (kantenTypFromTo === 3 && kantenTypToFrom === 1) {
    //fehlte!
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=tail, arrowtail=odot];`;
  }

  //kantenTypFromTo = 1,2,3 und kanytenTypToFrom = 0:
  else if (kantenTypFromTo === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=none];`;
  } else if (kantenTypFromTo === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=tail, arrowtail=none];`; //not tee!
  } else if (kantenTypFromTo === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=none];`; //unsure, maybe switch
  }
  //kantenTypToFrom = 1,2,3 und kantenTypFromTo = 0:
  else if (kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=normal];`;
  } else if (kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=tail];`; //not tee!
  } else if (kantenTypToFrom === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=odot];`; //unsure, maybe switch
  }
  return null;
}

//----ALLGEMEINE FUNCTION (1&2)----//

//---------------------------------//

//------FUNCTION FOR BUTTON 3------//

//Converts Dot-language syntax into matrix
function convertDotToMatrix() {
  //dotSyntax aus der zweiten textarea
  const dotSyntax = document.getElementById("pagMatrixToDotOutput").value;

  //1: Knoten sammeln
  const knoten = [];
  const knotenSet = new Set();
  const kantenPatternRegEx =
    /"(\w+)"\s*->\s*"(\w+)"\s*\[dir=both,\s*arrowhead=(\w+),\s*arrowtail=(\w+)\]/g;
  let match;

  while ((match = kantenPatternRegEx.exec(dotSyntax)) !== null) {
    const quellKnoten = match[1];
    const zielKnoten = match[2];

    //erst alle quellKnoten auf der rechten seite des Pfeils...
    if (!knotenSet.has(quellKnoten)) {
      knoten.push(quellKnoten);
      knotenSet.add(quellKnoten);
    }
    //...dann alle zielKnoten von der linken Seite des Pfeils einlesen.
    //sonst bleibt die in der Matrix gewünschte reihenfolge der knoten
    //nicht erhalten, bzw wird durcheinander geworfen
    if (!knotenSet.has(zielKnoten)) {
      knoten.push(zielKnoten);
      knotenSet.add(zielKnoten);
    }
  }

  //2: matrix leer initialisieren
  const matrixSize = knoten.length;
  const matrix = Array.from({ length: matrixSize + 1 }, () =>
    Array(matrixSize + 1).fill(0)
  );

  //knoten namen setzen
  matrix[0][0] = '""'; //hardcoded, ist dieser eintrag in der ecke
  knoten.forEach((knoten, index) => {
    matrix[0][index + 1] = `"${knoten}"`;
    matrix[index + 1][0] = `"${knoten}"`;
  });

  //3: unsere verschiedenen kanten definieren
  const kantenArtenMap = {
    none: 0,
    odot: 1,
    normal: 2,
    tail: 3,
  };

  //4: matrix mit korrekten werten befüllen
  kantenPatternRegEx.lastIndex = 0;
  while ((match = kantenPatternRegEx.exec(dotSyntax)) !== null) {
    const [_, quellKnoten, zielKnoten, arrowhead, arrowtail] = match;
    const quellKnotenIndex = knoten.indexOf(quellKnoten) + 1;
    const zielKnotenIndex = knoten.indexOf(zielKnoten) + 1;

    matrix[quellKnotenIndex][zielKnotenIndex] = kantenArtenMap[arrowhead];
    matrix[zielKnotenIndex][quellKnotenIndex] = kantenArtenMap[arrowtail];
  }

  //5: Matrix in anzuzeigendes format umwandeln
  //hierfür maybe die funktion die das eh macht aufrufen?
  //TODO: iwann mal genauer angucken, aktuell läufts ja lol
  const matrixCsv = matrix.map((row) => row.join(", ")).join("\n");
  document.getElementById("pagDotToMatrixOutput").value = matrixCsv;
}

//------FUNCTION FOR BUTTON 3------//

//---------------------------------//
//---------PAG SECTION END---------//
//---------------------------------//

