//wir erstellen eine const von unserem "Convert" button aus der html in js
const convertButtonForPag = document.getElementById("pagConvertButton");

//wenn der button geklickt wird führen wir die funktion aus
convertButtonForPag.addEventListener("click", pagFileUpload);

// Nur für PAG Matrix, andere für ADMG erstellen
function pagFileUpload() {
  //wir erstellen eine const von unserer .csv Datei aus der html in js
  const pagFileInput = document.getElementById("pagCsvFileInput").files[0];
  if (pagFileInput) {
    //AENDERUNG: neue processFunction, jetzt mit umweg
    readFile(pagFileInput, handlePagConversion);
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
    processFunction(fileContent);
  };

  //Ich versteh das noch nicht ganz von der positionierung
  //aber yt-tutorial-atze sagt muss so :(
  fr.readAsText(file);
}

//Wir haben die verwendung von "document" aus den anderen functions rausgezogen
function handlePagConversion(csvContent) {
  //zeigt matrix aus csv an
  const matrixOutput = pagFormatMatrix(csvContent);
  document.getElementById("pagDotToMatrixOutput").value = matrixOutput;

  //zeigt inhalt aus csv in dot-language umgewandelt an
  const dotGraph = pagMatrixToDot(csvContent);
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

//Diese Funktion erzeugt die passenden Kanten zwischen zwei Knoten
//TODO (solved): Die ganzen typen mit sich selbst fehlen, also (A&A=1) oder so
//ANTWORT TODO: quellKnoten==zielKnoten wird bei der eingabe ignoriert, da
//schleifen bei PAGs nicht elaubt sind (für ADMGs gilt das selbe)
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

//Verarbeitet den Matrix Inhalt eines PAGs aus der csv Datei
function pagMatrixToDot(csvContent) {
  //Inhalt mit pagParseContent vorbereiten und speichern
  const zeilen = pagParseContent(csvContent);

  //Erste Zeile und Spalte sind identisch, daher können wir uns einf aus einem
  //der beiden, hier jetzt der ersten Zeile die Knoten unseres Graphens
  //rausnehmen
  const knotenNamen = zeilen[0].slice(1);

  //AENDERUNG: Den schritt haben wir rausgenommen
  //Hiermit wird einfach die matrix aus der .csv datei angezeigt
  //const matrixOutput = zeilen.map((row) => row.join(", ")).join("\n");
  //document.getElementById("pagDotToMatrixOutput").value = matrixOutput;

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

  //AENDERUNG: Den schritt haben wir rausgenommen.
  //Jetzt wird anstatt dem .csv content, unser content in dot-language ausgegeben
  //const dotDigraph = `digraph {\n${[...dotEdges].join("\n")}\n}`;
  //document.getElementById("pagMatrixToDotOutput").value = dotDigraph;
  return `digraph {\n${[...dotEdges].join("\n")}\n}`;
}
