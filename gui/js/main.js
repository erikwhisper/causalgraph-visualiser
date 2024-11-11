//---------------------------------//
//--------PAG SECTION START--------//
//---------------------------------//

//START: EVENT LISTENERS FOR BUTTONS FOR PAG//

//BUTTON 1: const von "Einlesen" button
const readinButtonForPag = document.getElementById("pagInitializeButton");
readinButtonForPag.addEventListener("click", pagFileUpload);

//BUTTON 2: const von unserem "MatrixToDot" button
const convertPagToDotButton = document.getElementById("pagToDotButton");
convertPagToDotButton.addEventListener("click", convertEditedMatrixToDot);

//BUTTON 3: const von userem "DotToMatrix"
const convertDotToMatrixButton = document.getElementById("dotToMatrixButton");
convertDotToMatrixButton.addEventListener("click", convertDotToMatrix);

//END: EVENT LISTENERS FOR BUTTONS FOR PAG//

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

//das kann ich doch einfach zu einer function zusammenfügen für PAG und ADMG
//das ist ja deadass 1:1 das selbe
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

//könnte man auch refactorn und doch einen bauen der für PAG und ADMG funktioniert
//man müsste einfach nur bei der aufrufenden funktion für den PAG nen neuen typ
//"pag" erstellen und könnte weiterhin damit arbeiten, processFunction dann
//halt auch entsprechend anpassen
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

//das kann ich doch einfach zu einer function zusammenfügen für PAG und ADMG
//das ist ja deadass 1:1 das selbe
function parseAdmgContent(csvContent) {
  return csvContent
    .trim()
    .split("\n")
    .map((row) => row.split(","));
}

//das ist doch auch 1:1 das selbe oder?
function formatMatrix(parsedMatrix) {
  return parsedMatrix.map((row) => row.join(", ")).join("\n");
}

//TODO: Errorcase einbauen, falls z.B. in directional matrix (A,B)=(B,A)=1 auftritt
//TODO: BidirectionalEdges überschreiben aktuell die directional edges
//stattdessen wollen wir aber natürlich bei ADMGs zwsichen zwei knoten
//eine directed edge sowie eine bidirected edge haben können.
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
    //TODO: Reihenfolge an Matrix reihenfolge anpassen? notwenig ja/nein?
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

//START: EVENT LISTENERS FOR BUTTONS FOR VISUALIZATION//

//BUTTON 1: dot in json umwandeln -> anschließend visualisieren mit d3
document
  .getElementById("pagDotVisualizationButton")
  .addEventListener("click", function () {
    const dotSyntax = document.getElementById("pagMatrixToDotOutput").value;

    //convert dot language into d3 readable json
    const jsonData = convertPagDotToJson(dotSyntax);

    //visualize in a basic way with d3
    visualizeGraphWithD3(jsonData);
  });

//END: EVENT LISTENERS FOR BUTTONS FOR VISUALIZATION//

//------FUNCTION FOR BUTTON 1------//
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
  //document.getElementById("dotToMatrixButton").value = jsonDataString;

  return jsonData;
}

//nur none und normal edgetypes, aber dynamisch mit kanten
function visualizeGraphWithD3(jsonData) {
  //START CANVAS SETUP://

  //clear canvas
  d3.select("#graph-container").selectAll("*").remove();

  //container maße übernehmen
  const container = d3.select("#graph-container");
  const width = container.node().offsetWidth; //container höhe nutzen oder lieber px?
  const height = 600; //höhe einf an container auch anpassen oder px lassen?

  //d3 svg container erstellen
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //END CANVAS SETUP://

  //TODO: arrowmarkers needed: normal(head/tail), odot(head/tail), tail(head/tail), "none(head/tail)"

  //arrowmarker (1.1): normal arrowhead
  svg
    .append("defs")
    .append("marker")
    .attr("id", "normal-head")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 22) //position abhängig vom knoten kern
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto") //bei arrowheads nutzt man auto
    .append("path")
    .attr("d", "M0,-5L10,0L0,5") //arrowtype shape definition
    .attr("fill", "black");

  //arrowmarker (1.2): normal arrowtail
  svg
    .append("defs")
    .append("marker")
    .attr("id", "normal-tail")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 22) //position abhängig vom knoten kern
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse") //bei arrowtails nutzt man auto-start-reverse
    .append("path")
    .attr("d", "M0,-5L10,0L0,5") //arrowtype shape definition
    .attr("fill", "red");

  // Create a force simulation
  const simulation = d3
    .forceSimulation(jsonData.nodes)
    .force(
      "link",
      d3
        .forceLink(jsonData.links)
        .id((d) => d.id)
        .distance(150)
    )
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2));

  //links, also unsere edges zum svg hinzufügen
  const link = svg
    .selectAll(".link")
    .data(jsonData.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
    .attr("marker-end", (d) => {
      //add arrowtype für links mit arrowhead=normal
      if (d.arrowhead === "normal") {
        return "url(#normal-head)";
      }
      return null;
    })
    .attr("marker-start", (d) => {
      //add arrowtype für links mir arrowtail=normal
      if (d.arrowtail === "normal") {
        return "url(#normal-tail)";
      }
      return null;
    });

  //nodes, also unsere knoten zum svg hinzufügen
  const node = svg
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
  const labels = svg
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
  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
  });
}

//------FUNCTION FOR BUTTON 1------//
