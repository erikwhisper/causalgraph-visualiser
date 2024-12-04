//---------------------------------//
//--------PAG SECTION START--------//
//---------------------------------//

//----------------TODOS FOR PAG-----------------//

/*convertMatrixToDot und pagCreateDotEdges die stelle finden die die überflüssige leerstelle hinzufügt
in der dotsyntax wenn ich den "Matrix->DOT" Knopf drücke*/

/*In pagDotToMatrixConversion kommentar ganz unten in der function verstehen*/

//----------------TODOS FOR PAG-----------------//

//------------------------------------------------------------//

//----------------TODOS FOR PAG AND ADMG-----------------//

/*TODO: Es fehlt noch der basic ass .txt readin neben dem .csv readin bei function pagFileReader()*/

/*parsePagContent und parseAdmgContent sind tatsächlich 1:1 gleich und können zusammen gelegt werden.*/
/*formatMatrix (für den ADMG) und pagFormatMatrix sind auch 1:1 gleich und können zsm gelegt werden.*/

/*TODO: pagFileReader und admgFileReader sind !FAST! gleich. Bei der ADMG variante wird noch eine
Variable "type" übergeben, könnte man theoretisch beim PAG dann immer mit "null" aufrufen,
aber idk ob das so schön ist, dann könnte man die beiden zu einer function pagAndAdmgFileReader() 
vereigigen ==> Würde auch änderung von processFunction() nach sich ziehen.*/

//----------------TODOS FOR PAG AND ADMG-----------------//

//------------------------------------------------------------//

//---------------TODOS FOR VISUALISIERUNG PAG-----------------//

//TODO: edge-länge und node-radius abhängig von der menge an knoten machen,
//dabei beachten das dann auch die arrowtypen variablen als parameter brauchen, damit sie
//am knoten korrekt abgebildet werden

//TODO: Als USER die kantenlänge einstellen können, einmal mit einem wert für alle kanten
//und dann kann man doch bestimmt auch iwie einzelne kanten individuell anwählen
//und deren länge dann anpassen

//---------------TODOS FOR VISUALISIERUNG PAG-----------------//

//START: EVENT LISTENERS FOR BUTTONS FOR PAG//

//BUTTON 1: const von "Einlesen" button
const readinPagButton = document.getElementById("pagInitializeButton");
readinPagButton.addEventListener("click", pagFileUpload);

//BUTTON 2: const von unserem "MatrixToDot" button
const convertPagToDotButton = document.getElementById("pagToDotButton");
convertPagToDotButton.addEventListener("click", pagMatrixToDotConversion);

//BUTTON 3: const von userem "DotToMatrix"
const convertDotToMatrixButton = document.getElementById("dotToMatrixButton");
convertDotToMatrixButton.addEventListener("click", pagDotToMatrixConversion);

//END: EVENT LISTENERS FOR BUTTONS FOR PAG//

//------FUNCTION FOR BUTTON 1------//

function pagFileUpload() {
  const pagFileInput = document.getElementById("pagCsvFileInput").files[0];
  if (pagFileInput) {
    pagFileReader(pagFileInput, initializePagConversion);
  }
}

function pagFileReader(file, processFunction) {
  const fr = new FileReader();

  fr.onload = function (event) {
    const fileContent = event.target.result;
    processFunction(fileContent);
  };

  fr.readAsText(file);
}

function initializePagConversion(csvContent) {
  const parsedPagMatrix = parsePagContent(csvContent);

  //zeigt matrix aus csv an
  const unchangedMatrixOutput = pagFormatMatrix(csvContent);
  document.getElementById("pagDotToMatrixOutput").value = unchangedMatrixOutput;

  //zeigt inhalt aus csv in dot-language umgewandelt an
  const dotGraph = convertMatrixToDot(parsedPagMatrix); //NEU csvContent -> parsedPagMatrix && pagMatrixToDot -> convertMatrixToDot
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

function pagFormatMatrix(csvContent) {
  const zeilen = parsePagContent(csvContent);
  return zeilen.map((row) => row.join(", ")).join("\n");
}

//------FUNCTION FOR BUTTON 1------//

//---------------------------------//

//------FUNCTION FOR BUTTON 2------//

function pagMatrixToDotConversion() {
  //holt sich den inhalt der textarea mit gegebeber id
  const currentPagMatrix = document.getElementById(
    "pagDotToMatrixOutput"
  ).value;
  //bereitet aktuelle textfeld matrix vor
  const parsedPagMatrix = parsePagContent(currentPagMatrix);
  //sorgt fürs magische matrix to dot umformen
  const dotGraph = convertMatrixToDot(parsedPagMatrix);
  document.getElementById("pagMatrixToDotOutput").value = dotGraph;
}

//------FUNCTION FOR BUTTON 2------//

//---------------------------------//

//----ALLGEMEINE FUNCTION (1&2)----//

//.csv content in angenehmeres Format umwandeln
function parsePagContent(csvContent) {
  return csvContent
    .trim()
    .split("\n")
    .map((row) => row.split(","));
}

//nimmt die schon angepasste .csv und textarea direkt umwandelt
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

  return `digraph PAG {\n${[...dotEdges].join("\n")}\n}`;
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
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=tail, arrowtail=odot];`;
  }

  //kantenTypFromTo = 1,2,3 und kanytenTypToFrom = 0:
  else if (kantenTypFromTo === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=none];`;
  } else if (kantenTypFromTo === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=tail, arrowtail=none];`;
  } else if (kantenTypFromTo === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=odot, arrowtail=none];`;
  }
  //kantenTypToFrom = 1,2,3 und kantenTypFromTo = 0:
  else if (kantenTypToFrom === 2) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=normal];`;
  } else if (kantenTypToFrom === 3) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=tail];`;
  } else if (kantenTypToFrom === 1) {
    return `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=odot];`;
  }
  return null;
}

//----ALLGEMEINE FUNCTION (1&2)----//

//---------------------------------//

//------FUNCTION FOR BUTTON 3------//

//Converts Dot-language syntax into matrix
function pagDotToMatrixConversion() {
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

    //erst alle quellKnoten auf der rechten seite des Pfeils, dann links, aber eig is reihenfolge egal
    if (!knotenSet.has(quellKnoten)) {
      knoten.push(quellKnoten);
      knotenSet.add(quellKnoten);
    }
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

//---------------------------------------------------------------//

//---------------------------------------------------------------//

//---------------------------------//
//-------ADMG SECTION START--------//
//---------------------------------//

//START: EVENT LISTENERS FOR BUTTONS FOR ADMG//

//BUTTON 1: initale einlese, ausgabe und übersetzung
const readinButtonForAdmg = document.getElementById("admgInitializeButton");
readinButtonForAdmg.addEventListener("click", admgFileUpload);

//BUTTON 2: textarea zu dot, nach änderung
const admgMatrixToDotButton = document.getElementById("admgMatrixToDotButton");
admgMatrixToDotButton.addEventListener("click", admgMatrixToDotConversion);

//BUTTON 3: dot zu jeweiligen matritzen conversion
const dotToMatricesButton = document.getElementById("admgDotToMatrixButton");
dotToMatricesButton.addEventListener("click", admgDotToMatricesConversion);

//END: EVENT LISTENERS FOR BUTTONS FOR ADMG//

//------FUNCTION FOR BUTTON 1------//

function admgFileUpload() {
  const bidirectionalFile = document.getElementById("admgBidirectionalCsvInput")
    .files[0];
  const directedFile = document.getElementById("admgDirectedCsvInput").files[0];

  if (bidirectionalFile && directedFile) {
    admgFileReader(
      bidirectionalFile,
      initializeAdmgConversion,
      "bidirectional"
    );
    admgFileReader(directedFile, initializeAdmgConversion, "directed");
  } else {
    //TODO: bei PAG falls keine eingabe auch alert werfen
    alert("Bitte beide CSV-Dateien auswählen (gerichtet und bidirektional).");
  }
}

function admgFileReader(file, processFunction, type) {
  const fr = new FileReader();
  fr.onload = function (event) {
    const fileContent = event.target.result;
    processFunction(fileContent, type);
  };
  fr.readAsText(file);
}

function initializeAdmgConversion(csvContent, type) {
  const parsedMatrix = parseAdmgContent(csvContent);

  if (type === "bidirectional") {
    document.getElementById("admgBidirectionalMatrixOutput").value =
      formatMatrix(parsedMatrix);
  } else if (type === "directed") {
    document.getElementById("admgDirectedMatrixOutput").value =
      formatMatrix(parsedMatrix);
  }

  //Converting both matrices to DOT syntax
  const bidirectionalMatrix = parseAdmgContent(
    document.getElementById("admgBidirectionalMatrixOutput").value
  );
  const directedMatrix = parseAdmgContent(
    document.getElementById("admgDirectedMatrixOutput").value
  );

  const dotGraph = convertAdmgToDot(bidirectionalMatrix, directedMatrix);
  document.getElementById("admgDotOutput").value = dotGraph;
}

function parseAdmgContent(csvContent) {
  return csvContent
    .trim()
    .split("\n")
    .map((row) => row.split(","));
}

function formatMatrix(parsedMatrix) {
  return parsedMatrix.map((row) => row.join(", ")).join("\n");
}

//TODO: Errorcase einbauen, falls z.B. in directional matrix (A,B)=(B,A)=1 auftritt
function convertAdmgToDot(bidirectionalMatrix, directedMatrix) {
  const knoten = bidirectionalMatrix[0].slice(1);
  const dotEdges = new Set();

  for (let i = 1; i < bidirectionalMatrix.length; i++) {
    const quellKnoten = bidirectionalMatrix[i][0];

    for (let j = 1; j < bidirectionalMatrix[i].length; j++) {
      if (i < j) {
        const zielKnoten = knoten[j - 1];
        const bidirectionalEdge = parseInt(bidirectionalMatrix[i][j]);
        const reverseBidirectionalEdge = parseInt(bidirectionalMatrix[j][i]);
        const directedEdge = parseInt(directedMatrix[i][j]);
        const reverseDirectedEdge = parseInt(directedMatrix[j][i]);

        //1. bidirected edge zwischen A und B
        if (bidirectionalEdge === 2 && reverseBidirectionalEdge === 2) {
          dotEdges.add(
            `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=normal, style=dashed];`
          );
        }
        //2. directed edge von A nach B
        if (directedEdge === 1 && reverseDirectedEdge === 0) {
          dotEdges.add(
            `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=normal, arrowtail=none];`
          );
        }
        //3. directed edge von B nach A
        if (directedEdge === 0 && reverseDirectedEdge === 1) {
          dotEdges.add(
            `${quellKnoten} -> ${zielKnoten} [dir=both, arrowhead=none, arrowtail=normal];`
          );
        }
      }
    }
  }

  return `digraph ADMG {\n${[...dotEdges].join("\n")}\n}`;
}

//------FUNCTION FOR BUTTON 1------//

//------FUNCTION FOR BUTTON 2------//

//liest matrix aus textareas ein
function admgMatrixToDotConversion() {
  const bidirectionalMatrix = parseAdmgContent(
    document.getElementById("admgBidirectionalMatrixOutput").value
  );
  const directedMatrix = parseAdmgContent(
    document.getElementById("admgDirectedMatrixOutput").value
  );

  const dotGraph = convertAdmgToDot(bidirectionalMatrix, directedMatrix);

  document.getElementById("admgDotOutput").value = dotGraph;
}

//------FUNCTION FOR BUTTON 2------//

//------FUNCTION FOR BUTTON 3------//

//TODO: Hierfür fr Tests schreiben sonst katastrophe das zu checken
//Alle möglichkeiten prüfen und randfälle
function admgDotToMatricesConversion() {
  const dotSyntax = document.getElementById("admgDotOutput").value;

  //Im Knoten array werden die Knoten für die weiteren Arbeitsschritte gespeichert
  const knoten = [];
  /*Das knotenSet ist als einfache Filter-Funktion implementiert, damit
    jeder Knoten nur einmal vorkommt, da ein Knoten ja als Quellknoten
    und zusätzlich noch als Zielknoten vorkommen kann*/
  const knotenSet = new Set();

  const kantenPatternRegEx = /"(\w+)"\s*->\s*"(\w+)"\s*\[(.*?)\]/g;
  let match;

  while ((match = kantenPatternRegEx.exec(dotSyntax)) !== null) {
    const quellKnoten = match[1];
    const zielKnoten = match[2];

    //knoten dem array hinzufügen wie bei pag
    //hier wird auch die knotenreihenfolge bestimmt
    if (!knotenSet.has(quellKnoten)) {
      knoten.push(quellKnoten);
      knotenSet.add(quellKnoten);
    }
    if (!knotenSet.has(zielKnoten)) {
      knoten.push(zielKnoten);
      knotenSet.add(zielKnoten);
    }
  }

  //matrix leer initialisieren
  const matrixSize = knoten.length;
  const directedMatrix = Array.from({ length: matrixSize + 1 }, () =>
    Array(matrixSize + 1).fill(0)
  );
  const bidirectionalMatrix = Array.from({ length: matrixSize + 1 }, () =>
    Array(matrixSize + 1).fill(0)
  );

  //Knotennamen einsetzen in vorher gesetzter reihenfolge einsetzen
  directedMatrix[0][0] = '""';
  bidirectionalMatrix[0][0] = '""';
  knoten.forEach((knoten, index) => {
    directedMatrix[0][index + 1] = `"${knoten}"`;
    directedMatrix[index + 1][0] = `"${knoten}"`;
    bidirectionalMatrix[0][index + 1] = `"${knoten}"`;
    bidirectionalMatrix[index + 1][0] = `"${knoten}"`;
  });

  //ander machen?
  const kantenArtenMap = {
    none: 0,
    normal: 1,
  };

  //directed und bidirected edges zur Matrix hinzufügen
  kantenPatternRegEx.lastIndex = 0;
  while ((match = kantenPatternRegEx.exec(dotSyntax)) !== null) {
    const [_, quellKnoten, zielKnoten, attributeString] = match;
    const quellKnotenIndex = knoten.indexOf(quellKnoten) + 1;
    const zielKnotenIndex = knoten.indexOf(zielKnoten) + 1;

    //bidirect kanten sind dashed style edges, daher darauf prüfen
    if (attributeString.includes("style=dashed")) {
      bidirectionalMatrix[quellKnotenIndex][zielKnotenIndex] = 2;
      bidirectionalMatrix[zielKnotenIndex][quellKnotenIndex] = 2;
    } else {
      //die anderen sind directed
      //holt sich den wert für arrowhead/tail raus und speichert ihn in variable
      const arrowheadMatch = /arrowhead=(\w+)/.exec(attributeString);
      const arrowtailMatch = /arrowtail=(\w+)/.exec(attributeString);
      //wenn arrowhead vorhanden speichere Wert 1 sonst none, das selbe für arrowtail
      const arrowheadType = arrowheadMatch ? arrowheadMatch[1] : "none";
      const arrowtailType = arrowtailMatch ? arrowtailMatch[1] : "none";

      //TODO: beide auf 1 haben sollte ja nicht erlaubt sein, frage ist
      //ob man das enforcen muss mit einer message oder ob man korrekte
      //eingabe erwarten kann, das mit prof später abklären
      directedMatrix[quellKnotenIndex][zielKnotenIndex] =
        kantenArtenMap[arrowheadType];
      directedMatrix[zielKnotenIndex][quellKnotenIndex] =
        kantenArtenMap[arrowtailType];
    }
  }

  //ausgabe
  const directedMatrixCsv = directedMatrix
    .map((row) => row.join(", "))
    .join("\n");
  document.getElementById("admgDirectedMatrixOutput").value = directedMatrixCsv;

  const bidirectionalMatrixCsv = bidirectionalMatrix
    .map((row) => row.join(", "))
    .join("\n");
  document.getElementById("admgBidirectionalMatrixOutput").value =
    bidirectionalMatrixCsv;
}

//------FUNCTION FOR BUTTON 3------//

//---------------------------------//
//--------ADMG SECTION END---------//
//---------------------------------//

//---------------------------------------------------------------//

//---------------------------------------------------------------//

//---------------------------------//
//-------VISUAL SECTION START------//
//---------------------------------//

//ARTEN VON SIMULATIONEN: 1. Kraftbasiert, 2. Grid, (3. Hierachie/Tree?)
let selectedNode1 = null;
let selectedNode2 = null;

//START: EVENT LISTENERS FOR BUTTONS FOR VISUALIZATION//

//BUTTON 1.1: dot in json umwandeln -> anschließend mit force visualisieren mit d3 (PAG)
document
  .getElementById("pagDotVisualizationButton")
  .addEventListener("click", function () {
    const dotSyntax = document.getElementById("pagMatrixToDotOutput").value;

    //convert dot language into d3 readable json
    const jsonData = convertPagDotToJson(dotSyntax);

    //visualize in a basic way with d3
    visualizePagForceBasedWithD3(jsonData);
  });

//BUTTON 1.2: dot in json umwandeln -> anschließend visualisieren mit d3 (ADMG)
document
  .getElementById("admgDotVisualizationButton")
  .addEventListener("click", function () {
    const dotSyntax = document.getElementById("admgDotOutput").value;

    // Konvertiere DOT-Syntax in ein JSON-Format, das D3.js versteht
    const jsonData = convertAdmgDotToJson(dotSyntax);

    // Visualisiere die Daten mit D3.js
    visualizeAdmgForceBasedWithD3(jsonData);
  });

//BUTTON 2.1: dot in json umwandeln -> anschließend mit grid visualisieren mit d3 (PAG)
document
  .getElementById("pagDotGridBasedVisualizationButton")
  .addEventListener("click", function () {
    const dotSyntax = document.getElementById("pagMatrixToDotOutput").value;

    //convert dot language into d3 readable json
    const jsonData = convertPagDotToJson(dotSyntax);

    //visualize in a basic way with d3
    visualizePagGridBasedWithD3(jsonData);

    //zeigt jsondata an unsere resafe/safe/reenter datenstructure
    displayJsonData(jsonData);
  });

//BUTTON 2.2: dot in json umwandeln -> anschließend mit grid visualisieren mit d3 (ADMG)
document
  .getElementById("admgDotGridBasedVisualizationButton")
  .addEventListener("click", function () {
    const dotSyntax = document.getElementById("admgDotOutput").value;

    // Konvertiere DOT-Syntax in ein JSON-Format, das D3.js versteht
    const jsonData = convertAdmgDotToJson(dotSyntax);

    // Visualisiere die Daten mit D3.js
    visualizeAdmgGridBasedWithD3(jsonData);
  });

//END: EVENT LISTENERS FOR BUTTONS FOR VISUALIZATION//

//------FUNCTION FOR BUTTON 1.1 (PAG, Force)------//
function convertPagDotToJson(dotSyntax) {
  //set für kanten aufgrund der uniqueness
  const knoten = new Set();
  //links sind unsere kanten, so nennt man die in d3 dann später auch
  const links = [];

  const edgeRegex =
    /"([^"]+)"\s*->\s*"([^"]+)"\s*\[dir=both, arrowhead=([^,]+), arrowtail=([^,]+)\];/g;
  let match;

  while ((match = edgeRegex.exec(dotSyntax)) !== null) {
    const source = match[1];
    const target = match[2];
    const arrowhead = match[3].trim();
    const arrowtail = match[4].trim();

    knoten.add(source);
    knoten.add(target);

    links.push({ source, target, arrowhead, arrowtail });
  }

  const nodesArray = Array.from(knoten).map((node) => ({ id: node }));

  const jsonData = {
    nodes: nodesArray,
    links: links,
  };

  //überprüfen ob json in richtigem format
  //const jsonDataString = JSON.stringify(jsonData, null, 2);
  //document.getElementById("pagMatrixToDotOutput").value = jsonDataString;

  return jsonData;
}

function visualizePagForceBasedWithD3(jsonData) {
  //START CANVAS SETUP://
  const containerId = "#graph-container";
  const width = d3.select(containerId).node().offsetWidth;
  const height = 600;
  const { svg, g } = createSvgCanvas(containerId, width, height);
  //END CANVAS SETUP://

  setupArrowMarker(svg, "normal-head", "path", "black", null, "auto");
  setupArrowMarker(
    svg,
    "normal-tail",
    "path",
    "red",
    null,
    "auto-start-reverse"
  );
  setupArrowMarker(
    svg,
    "odot-head",
    "circle",
    "rgb(238, 241, 219)",
    "black",
    "auto"
  );
  setupArrowMarker(
    svg,
    "odot-tail",
    "circle",
    "rgb(238, 241, 219)",
    "red",
    "auto-start-reverse"
  );
  setupArrowMarker(svg, "tail-head", "rect", "black", null, "auto");
  setupArrowMarker(svg, "tail-tail", "rect", "red", null, "auto-start-reverse");

  //create a force simulation
  const simulation = setupForceSimulation(
    jsonData.nodes,
    jsonData.links,
    width,
    height
  );

  //links, also unsere edges zum svg hinzufügen
  const link = g
    .selectAll(".link")
    .data(jsonData.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
    .attr("marker-end", (d) => {
      if (d.arrowhead === "normal") {
        return "url(#normal-head)";
      } else if (d.arrowhead === "odot") {
        return "url(#odot-head)";
      } else if (d.arrowhead === "tail") {
        return "url(#tail-head)";
      }
      return null;
    })
    .attr("marker-start", (d) => {
      if (d.arrowtail === "normal") {
        return "url(#normal-tail)";
      } else if (d.arrowtail === "odot") {
        return "url(#odot-tail)";
      } else if (d.arrowtail === "tail") {
        return "url(#tail-tail)";
      }
      return null;
    });

  //nodes, also unsere knoten zum svg hinzufügen
  const node = g
    .selectAll(".node")
    .data(jsonData.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 15)
    .attr("fill", "blue")
    .call(
      d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  //labels, also knotennamen zum svg hinzufügen
  const labels = g
    .selectAll(".label")
    .data(jsonData.nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text((d) => d.id)
    .attr("fill", "white")
    .style("pointer-events", "none");

  //positionen immer updaten
  simulation.on("tick", tickHandler(link, node, labels));
}

function tickHandler(link, node, labels) {
  return () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
  };
}

//------FUNCTION FOR BUTTON 1.1 (PAG, Force)------//

//------FUNCTION FOR BUTTON 2.1------//

function convertAdmgDotToJson(dotSyntax) {
  const knoten = new Set();

  const links = [];

  const edgeRegex =
    /"([^"]+)"\s*->\s*"([^"]+)"\s*\[dir=both, arrowhead=([^,]+), arrowtail=([^,]+)(?:, style=dashed)?\];/g;
  let match;

  while ((match = edgeRegex.exec(dotSyntax)) !== null) {
    const source = match[1];
    const target = match[2];
    const arrowhead = match[3].trim();
    const arrowtail = match[4].trim();
    const isDashed = /style=dashed/.test(match[0]);

    knoten.add(source);
    knoten.add(target);

    if (isDashed) {
      //bidirected edges
      links.push({
        source,
        target,
        type: "bidirected-dashed",
        arrowhead: "normal",
        arrowtail: "normal",
      });
    } else {
      //directed edges mit richtung
      if (arrowhead === "normal" && arrowtail === "none") {
        links.push({
          source,
          target,
          type: "directed",
          arrowhead: "normal",
          arrowtail: "none",
        });
      } else if (arrowhead === "none" && arrowtail === "normal") {
        links.push({
          source,
          target,
          type: "directed",
          arrowhead: "none",
          arrowtail: "normal",
        });
      }
    }
  }

  //knoten zu knotenarray
  const nodesArray = Array.from(knoten).map((node) => ({ id: node }));

  const jsonData = {
    nodes: nodesArray,
    links: links,
  };

  //const jsonDataString = JSON.stringify(jsonData, null, 2);
  //document.getElementById("pagMatrixToDotOutput").value = jsonDataString;

  return jsonData;
}

function visualizeAdmgForceBasedWithD3(jsonData) {
  //canvas setup
  const containerId = "#graph-container";
  const width = d3.select(containerId).node().offsetWidth;
  const height = 600;
  const { svg, g } = createSvgCanvas(containerId, width, height);

  //setup ADMG arrow markers, with general pag and admg arrowmarker helper-function
  setupArrowMarker(svg, "admg-normal-head", "path", "black", null, "auto");
  setupArrowMarker(
    svg,
    "admg-normal-tail",
    "path",
    "red",
    null,
    "auto-start-reverse"
  );

  //force simulation
  const simulation = setupForceSimulation(
    jsonData.nodes,
    jsonData.links,
    width,
    height
  );

  //add links
  const link = g
    .selectAll(".link")
    .data(jsonData.links)
    .enter()
    .append("path") //path is more flexibal than line, maybe change in others, if needed for interactivity
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("stroke-dasharray", (d) =>
      d.type === "bidirected-dashed" ? "5,5" : ""
    )
    .attr("marker-end", (d) => {
      return d.arrowhead === "normal" ? "url(#admg-normal-head)" : null;
    })
    .attr("marker-start", (d) => {
      return d.arrowtail === "normal" ? "url(#admg-normal-tail)" : null;
    });

  //add nodes
  const node = g
    .selectAll(".node")
    .data(jsonData.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 15)
    .attr("fill", "blue")
    .call(
      d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  //add labels
  const labels = g
    .selectAll(".label")
    .data(jsonData.nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text((d) => d.id)
    .attr("fill", "white")
    .style("pointer-events", "none");

  //simulation is different, because of the curve, maybe helper function maybe not idk yet
  simulation.on("tick", () => {
    link.attr("d", (d) => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy); //distanz zwischen zwei nodes

      //curve for bidirected
      if (d.type === "bidirected-dashed") {
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      } else {
        //straight for directed
        return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
      }
    });

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
  });
}

//------FUNCTION FOR BUTTON 2.1------//

//------FUNCTION FOR BUTTON 1.1 AND 2.1 (PAG, ADMG, Force)------//

function setupForceSimulation(nodes, links, width, height) {
  return d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(150)
    )
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));
}

//------FUNCTION FOR BUTTON 1.1 AND 2.1 (PAG, ADMG, Force)------//

//TODO iwann: gucken wie die initiale visualisierung schöner wird, was für clippings es gibt
//automatic layouts etc, damit das ganze schöner aussieht, wie bei dagitty oder so

//TODO: Basic interativity einbauen, also per click die farbe von einer edge oder einem knoten
//ändern können, einen knoten hinzufügen, den namen angeben können, die kante zeichnen können
//dann die arrowmarker der kante auswählen können und das ganze in dot-syntax übersetzen
//von da aus kann ich dann ja schon dot->matrix übersetzung machen.

//TODO: colission avoidance

//------FUNCTION FOR BUTTON 2.1 (PAG, Grid)------//

function visualizePagGridBasedWithD3(jsonData) {
  // START CANVAS SETUP
  const containerId = "#graph-container";
  const width = d3.select(containerId).node().offsetWidth;
  const height = 600;
  const { svg, g } = createSvgCanvas(containerId, width, height);

  //EXPERIMENTAL: Static GRID:
  setupGridToggle(svg, width, height, 100);
  // END CANVAS SETUP

  setupArrowMarker(svg, "normal-head", "path", "black", null, "auto");
  setupArrowMarker(
    svg,
    "normal-tail",
    "path",
    "red",
    null,
    "auto-start-reverse"
  );
  setupArrowMarker(
    svg,
    "odot-head",
    "circle",
    "rgb(238, 241, 219)",
    "black",
    "auto"
  );
  setupArrowMarker(
    svg,
    "odot-tail",
    "circle",
    "rgb(238, 241, 219)",
    "red",
    "auto-start-reverse"
  );
  setupArrowMarker(svg, "tail-head", "rect", "black", null, "auto");
  setupArrowMarker(svg, "tail-tail", "rect", "red", null, "auto-start-reverse");

  jsonData.links.forEach((link) => {
    link.source = jsonData.nodes.find((node) => node.id === link.source);
    link.target = jsonData.nodes.find((node) => node.id === link.target);
  });

  const numColumns = Math.ceil(Math.sqrt(jsonData.nodes.length));
  const gridSpacing = 100;

  jsonData.nodes.forEach((node, index) => {
    node.x = (index % numColumns) * gridSpacing + gridSpacing / 2;
    node.y = Math.floor(index / numColumns) * gridSpacing + gridSpacing / 2;
  });

  //edges
  const link = g
    .selectAll(".link")
    .data(jsonData.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
    .attr("marker-end", (d) => {
      if (d.arrowhead === "normal") return "url(#normal-head)";
      if (d.arrowhead === "odot") return "url(#odot-head)";
      if (d.arrowhead === "tail") return "url(#tail-head)";
      return null;
    })
    .attr("marker-start", (d) => {
      if (d.arrowtail === "normal") return "url(#normal-tail)";
      if (d.arrowtail === "odot") return "url(#odot-tail)";
      if (d.arrowtail === "tail") return "url(#tail-tail)";
      return null;
    })
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  const node = g
    .selectAll(".node")
    .data(jsonData.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    //ADDED for drawing interactive edges
    .attr("id", (d) => `node-${d.id}`) // Eindeutige ID für jedes SVG-Element
    .on("click", handleNodeClick) // Klick-Event hinzufügen
    //ADDED for drawing interactive edges
    .call(
      d3
        .drag()
        .on("drag", (event, d) => {
          d.x = event.x;
          d.y = event.y;
        })
        .on("end", (event, d) => {
          d.x =
            Math.round((d.x - gridSpacing / 2) / gridSpacing) * gridSpacing +
            gridSpacing / 2;
          d.y =
            Math.round((d.y - gridSpacing / 2) / gridSpacing) * gridSpacing +
            gridSpacing / 2;
        })
    );

  const labels = g
    .selectAll(".label")
    .data(jsonData.nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text((d) => d.id)
    .attr("fill", "white")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);

  //ADDED for drawing interactive edges
  svg.on("click", (event) => {
    if (!event.target.closest(".node")) {
      resetSelection(); // Auswahl zurücksetzen
    }
  });
  //ADDED for drawing interactive edges

  updatePagGrid(node, link, labels);
}

function updatePagGrid(node, link, labels) {
  function update() {
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    labels.attr("x", (d) => d.x).attr("y", (d) => d.y);

    requestAnimationFrame(update);
  }
  update(); //animation loop
}

//------FUNCTION FOR BUTTON 2.1 (PAG, Grid)------//

//------FUNCTION FOR BUTTON 2.2 (ADMG, Grid)------//

function visualizeAdmgGridBasedWithD3(jsonData) {
  const containerId = "#graph-container";
  const width = d3.select(containerId).node().offsetWidth;
  const height = 600;
  const { svg, g } = createSvgCanvas(containerId, width, height);

  setupArrowMarker(svg, "admg-normal-head", "path", "black", null, "auto");
  setupArrowMarker(
    svg,
    "admg-normal-tail",
    "path",
    "red",
    null,
    "auto-start-reverse"
  );

  jsonData.links.forEach((link) => {
    link.source = jsonData.nodes.find((node) => node.id === link.source);
    link.target = jsonData.nodes.find((node) => node.id === link.target);
  });

  const numColumns = Math.ceil(Math.sqrt(jsonData.nodes.length));
  const gridSpacing = 100;

  jsonData.nodes.forEach((node, index) => {
    node.x = (index % numColumns) * gridSpacing + gridSpacing / 2;
    node.y = Math.floor(index / numColumns) * gridSpacing + gridSpacing / 2;
  });

  const link = g
    .selectAll(".link")
    .data(jsonData.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", (d) =>
      d.type === "bidirected-dashed" ? "5,5" : null
    )
    .attr("fill", "none")
    .attr("marker-end", (d) =>
      d.arrowhead === "normal" ? "url(#admg-normal-head)" : null
    )
    .attr("marker-start", (d) =>
      d.arrowtail === "normal" ? "url(#admg-normal-tail)" : null
    )
    .attr("d", (d) => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);

      return d.type === "bidirected-dashed"
        ? `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
        : `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
    });

  const node = g
    .selectAll(".node")
    .data(jsonData.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .call(
      d3
        .drag()
        .on("drag", (event, d) => {
          d.x = event.x;
          d.y = event.y;
          updateAdmgGrid(node, link, labels);
        })
        .on("end", (event, d) => {
          d.x =
            Math.round((d.x - gridSpacing / 2) / gridSpacing) * gridSpacing +
            gridSpacing / 2;
          d.y =
            Math.round((d.y - gridSpacing / 2) / gridSpacing) * gridSpacing +
            gridSpacing / 2;
          updateAdmgGrid(node, link, labels);
        })
    );

  const labels = g
    .selectAll(".label")
    .data(jsonData.nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text((d) => d.id)
    .attr("fill", "white")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);

  updateAdmgGrid(node, link, labels);
}

function updateAdmgGrid(nodes, links, labels) {
  nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  links.attr("d", (d) => {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);

    return d.type === "bidirected-dashed"
      ? `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`
      : `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
  });

  labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
}

//------FUNCTION FOR BUTTON 2.2 (ADMG, Grid)------//

//------FUNCTION FOR BUTTON 1.1, 2.1 AND 1.2, 2.2 (PAG, ADMG, Force, Grid)------//

function createSvgCanvas(containerId, width, height) {
  //clear container
  d3.select(containerId).selectAll("*").remove();

  //svg element erstelllen
  const container = d3.select(containerId);
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //everything in g is now zoomable, knotem, kanten, labels
  const g = svg.append("g");

  //zoom behavior
  const zoom = d3
    .zoom()
    .on("zoom", (event) => g.attr("transform", event.transform));

  //by deafault zoom is enabled
  svg.call(zoom);

  //EXPERIMENTELL: TOGGELING ZOOM
  //helperfunction to disable/toggle zoom
  setupZoomToggle(svg, zoom);

  return { svg, g };
}

function setupArrowMarker(svg, id, shape, fillColor, strokeColor, orient) {
  //arrowmarker (0.1): none arrowhead //falls kein marker vorhanden -> null bzw. in Matrix 0.
  //arrowmarker (0.2): none arrowtail //falls kein marker vorhanden -> null bzw. in Matrix 0.
  //arrowmarker (1.1): normal arrowhead
  //arrowmarker (1.2): normal arrowtail
  //arrowmarker (2.1): odot arrowhead
  //arrowmarker (2.2): odot arrowtail
  //arrowmarker (3.1): tail arrowhead //später unsichtbar machen
  //arrowmarker (3.2): tail arrowtail //später unsichtbar machen
  const marker = svg
    .append("defs")
    .append("marker")
    .attr("id", id)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 22)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", orient);

  if (shape === "path") {
    marker.append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", fillColor);
  } else if (shape === "circle") {
    marker
      .append("circle")
      .attr("cx", 5)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", fillColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 2);
  } else if (shape === "rect") {
    marker
      .append("rect")
      .attr("x", 0)
      .attr("y", -5)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", fillColor);
  }
}

//------FUNCTION FOR BUTTON 1.1, 2.1 AND 1.2, 2.2 (PAG, ADMG, Force, Grid)------//

//-------------------------------------------------------------------------//

//--------Hier kommt jetzt die svg interactivity hin----------//

//IMPLEMENTED FOR: (Pag, Grid) ONLY!

function getJsonDataFromDot() {
  const dotSyntax = document.getElementById("pagMatrixToDotOutput").value;
  return convertPagDotToJson(dotSyntax);
}

function handleNodeClick(event, node) {
  event.stopPropagation();

  if (!selectedNode1) {
    selectedNode1 = node;
    highlightNode(node, "green");
  } else if (!selectedNode2 && node !== selectedNode1) {
    selectedNode2 = node;
    highlightNode(node, "green");

    //add new edge
    addEdgeBetweenSelectedNodes();
  } else {
    resetSelection();
  }
}

function addEdgeBetweenSelectedNodes() {
  if (!selectedNode1 || !selectedNode2) return;

  const dotField = document.getElementById("pagMatrixToDotOutput");
  let dotSyntax = dotField.value.trim();

  //define new edge, console warnings obsolete
  if (dotSyntax.endsWith("}")) {
    dotSyntax = dotSyntax.slice(0, -1).trim();
  } else {
    console.warn("DOT-Syntax hat keine schließende Klammer, sie wird ergänzt.");
  }

  //define new edge
  const newEdge = `"${selectedNode1.id}" -> "${selectedNode2.id}" [dir=both, arrowhead=normal, arrowtail=none];`;

  //checks if edge already exist, currently jus
  //1:1, muss darauf reduzieren zu checken ob
  //zwischen den zwei knoten IRGENDeine edge existiert
  if (!dotSyntax.includes(newEdge)) {
    dotSyntax += `\n${newEdge}`;
    console.log("Neue Kante hinzugefügt:", newEdge);
  } else {
    console.warn("Die Kante existiert bereits in der DOT-Syntax.");
  }

  //hardcoded klammer ans ende wegen dot-syntax vorgabe
  dotSyntax += "\n}";

  //update dot-syntax
  dotField.value = dotSyntax;

  //update jsonData
  const jsonData = getJsonDataFromDot(); //json aus der DOT-Syntax holen
  //das hier anders lösen.
  jsonData.links.push({
    source: selectedNode1.id,
    target: selectedNode2.id,
    arrowhead: "normal",
    arrowtail: "none",
  }); //kante in jsonData hinzufügen

  //visualisierung aktualisieren

  visualizePagGridBasedWithD3(jsonData);
  displayJsonData(jsonData);

  //auswahl der knoten zurücksetzen
  resetSelection();
}

//TODO: aktuell malen wir das komplette ding wieder einfach basiert auf der jsonData
//ohne koordinaten oder? Wir wollen aber natürlich das ganze dann mit koordinaten haben
//und nicht wieder mit initial daten, also müssen wir wieder irgendwie die letzten
//daten zwischenspeichern und damit dann zeichnen. Wir wollen ja auch eine
//jsonData version in die textarea von uns aus schreiben können und diese dann
//visualisieren lassen. Aktuell ist dem programm ja egal was drin steht, aktuell
//können wir mit einem knopf nur dot-syntax -> jsondata -> visualisierung
//aber wir wollen den dot-syntax step skippen und dafür jsondata direkt mit
//koordinaten verarbeiten.

function updateGraphVisualization() {
  const jsonData = getJsonDataFromDot();
  visualizePagGridBasedWithD3(jsonData);
}

function resetSelection() {
  selectedNode1 = null;
  selectedNode2 = null;
  d3.selectAll(".node").attr("fill", "blue"); //zurücksetzen der knotenfarben
}

function highlightNode(node, color) {
  d3.selectAll(".node")
    .filter((d) => d === node)
    .attr("fill", color);
}

//--------Hier kommt jetzt die svg interactivity hin----------//

function displayJsonData(jsonData) {
  const outputField = document.getElementById("pagVisToFooOutput");

  function updateJsonOutput() {
    outputField.value = JSON.stringify(jsonData, null, 2);
    requestAnimationFrame(updateJsonOutput);
  }

  updateJsonOutput();
}

//---------------------------------//
//--------VISUAL SECTION END-------//
//---------------------------------//

//-------------------------------------------------------------------------//

//---------------------------------//
//-----EXPERIMENT SECTION START----//
//---------------------------------//

//Button for toggeling of the force in the forcesimulation to be able to freely
//drag and drop something

//EXPERIMENTELL: TOGGELING ZOOM

function setupZoomToggle(svg, zoom) {
  d3.select("#zoom-checkbox").on("change", function () {
    if (this.checked) {
      svg.on(".zoom", null);
      //disable zoom
    } else {
      //enable toom
      svg.call(zoom);
    }
  });
}

//EXPERIMENTELL: TOGGELING ZOOM

//EXPERIMENTELL: GRID, STATIC as of rn

function setupGridToggle(svg, width, height, gridSpacing) {
  d3.select("#grid-checkbox").on("change", function () {
    if (this.checked) {
      drawGrid(svg, width, height, gridSpacing);
    } else {
      svg.select(".grid-lines").remove();
    }
  });
}

function drawGrid(svg, width, height, gridSpacing) {
  const gridGroup = svg.append("g").attr("class", "grid-lines");

  for (let x = gridSpacing / 2; x <= width; x += gridSpacing) {
    gridGroup
      .append("line")
      .attr("x1", x)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", height)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);
  }

  for (let y = gridSpacing / 2; y <= height; y += gridSpacing) {
    gridGroup
      .append("line")
      .attr("x1", 0)
      .attr("y1", y)
      .attr("x2", width)
      .attr("y2", y)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);
  }
}

//EXPERIMENTELL: GRID, STATIC as of rn

//REFACTORN DEN CODE OMG ES SMELLED

//Eingabe hinzufügen um universal alle knoten und alle kanten zu vergrößern oder zu verkleinern
//Dann später auch individuelle anpassungen durchführen

//TODO: Clear Checkboxes when Grid/Force-Visu button is pressed

//Bei der Force visualization einen checkbox adden um die force auszustellen zum freien moven.

//Bei der Grid veisualization eine checkbox adden um das clippen auszustellen
