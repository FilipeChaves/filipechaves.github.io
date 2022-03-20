import logo from './logo.svg';
import './App.css';
import React from 'react';

class App extends React.Component{

  constructor(props) {
    super(props);
    const squareNumber = 10
    const word = this.array[Math.floor(Math.random() * this.array.length)].toUpperCase();

    const maxPositions = squareNumber * squareNumber;
    var same = false;
    const arrayPositions = [];
    const closeBy = [];
    const lettersFound = [];
    const inputLetters = [];
    const inputTries = 2;

    for (var i = 0; i < 6;){
      var rnd = Math.floor(Math.random() * maxPositions);

      for(var j = 0; j < i; j++){
        if(arrayPositions[j] === rnd)
          same = true;
      }
      if (same){
        same = false;
        continue;
      }
      i++;
      arrayPositions.push(rnd);

      lettersFound.push(<td className='td-notSelected' key={"notFound" + i}>?</td>)
      for (var t = 0; t < inputTries; t++) {
        inputLetters.push(<td className='td-notSelected' key={"input" + (t*6 + i)}></td>)
      }
      closeBy.push({rowLetter: String.fromCharCode(65 + Math.floor(rnd / squareNumber)), row: rnd % squareNumber, line: Math.floor(rnd / squareNumber), found: false, key: rnd, value: word[j]});
    }
    
    console.log(JSON.stringify(closeBy, null, "  "));
    
    var tds = [];
    const allCells = [];
    for (i = 0; i < squareNumber; i++) {
        var lines = [];
        for(j = 0; j < squareNumber; j++) {
          const row = <td className='td-notSelected' key={i*squareNumber+j} data-key={i*squareNumber+j} onClick={this.cellPressed.bind(this)}></td>
          lines.push(row);
          allCells.push(row);
        }

        var value = "tr-" + (i*squareNumber+j);
        tds.push(<tr key={value} children={lines}/>);
    }
      
    this.state = { found: 0, arrayPositions: arrayPositions, word: word, squareNumber: squareNumber, cells: allCells, tds: tds, close: closeBy, lettersFound: lettersFound, inputLetters: inputLetters, matrixTriesLeft: squareNumber, inputTries: inputTries, inputArrayLetters: [] };
  }
    
  render() {

    var toShow;

    if (this.state.matrixTriesLeft !== 0){
      const tds= [];
      for(var i = 0; i < this.state.squareNumber; i++){
        var initialCell = <td className='td-selected' key={"hed" + i}>{String.fromCharCode(65 + i)}</td>;
        var lineCells= [initialCell];
        for(var j = 0; j < this.state.squareNumber; j++){
          lineCells.push(this.state.cells[i*this.state.squareNumber+j]);
        }
  
        var value = "tr-" + (i*this.state.squareNumber+j);
        tds.push(<tr key={value} children={lineCells}/>);
      }

      toShow = <div className='center'><p>Find the letters to form the word of the day, you have {this.state.matrixTriesLeft} tries left</p><table>{tds}</table>
      <p>The letters you've found</p><table>{this.state.lettersFound}</table></div>
    }
    else {    
      const tds = [];
      for(var i = 0; i < 2; i++){
        const lineCells = [];
        for(var j = 0; j < 6; j++){
          lineCells.push(this.state.inputLetters[i*6+j]);
        }

        var value = "tr-" + (i*this.state.squareNumber+j);
        tds.push(<tr key={value} children={lineCells}/>);
      }

      toShow = <div className='center'><p>The letters you've found</p><table>{this.state.lettersFound}</table><p>Now you just need to take a guess, you have 2 tries</p>
      <table>{tds}</table></div>
    }

    return (
      <div className="App">
        <header className="App-header">
          <h2>MineWordle</h2>
            {toShow}
        </header>
      </div>
    );
  }

  keyboardPressed(event){
    const inputLetters = this.state.lettersFound;
    const inputTries = this.state.inputTries;
    const inputArrayLetters = this.state.inputArrayLetters;
    
    let isLetter = event.key.toLowerCase() != event.key.toUpperCase();
    if (isLetter && inputArrayLetters.length < 6){
      inputLetters[inputArrayLetters.length] = <td className='td-notSelected' key={"input" + (inputArrayLetters.length)}>{event.key.toUpperCase()}</td>;
      inputArrayLetters.push(event.key.toUpperCase());
      this.setState({inputLetters, inputArrayLetters});
    }
    else if (!isLetter && (inputArrayLetters.length > 0 || inputArrayLetters > 6)){
      if (event.keyCode === 46){
        inputArrayLetters.pop();
        inputLetters[inputArrayLetters.length] = <td className='td-notSelected' key={"input" + (inputArrayLetters.length)}></td>;
        this.setState({inputLetters, inputArrayLetters});
      }
    }


    console.log(event);
  }

  cellPressed(event) {
    var boxNumber = Number(event.target.attributes["data-key"].value);
    const allCells = this.state.cells;
    const closeBy = this.state.close;
    const numFound = this.state.found;
    const lettersFound = this.state.lettersFound;
    
    if (numFound === 6 || this.state.matrixTriesLeft === 0){
      return;
    }
    
     for(var i = 0; i < this.state.squareNumber; i++){
      if(boxNumber === this.state.arrayPositions[i]){

        allCells[boxNumber] = <td className='td-found' key={boxNumber} data-key={boxNumber} ></td>
        closeBy[i].found = true;
        lettersFound[numFound] = <td className='td-found' key={"found" + boxNumber} data-key={boxNumber} >{closeBy[i].value}</td>

        this.setState({ cells: allCells, close: closeBy, lettersFound: lettersFound, found: numFound + 1, matrixTriesLeft: this.state.matrixTriesLeft - 1});

        if (numFound + 1 === 6) {
          document.addEventListener("keydown", this.keyboardPressed.bind(this), false);
        }
        return;
      }
    }

    var pressedRow = boxNumber % this.state.squareNumber;
    var pressedLine = Math.floor(boxNumber / this.state.squareNumber);
    var closest = {leftRight: false, lineDist: this.state.squareNumber+1, row: this.state.squareNumber+1, line: 0};

    for(i = 0; i < 6; i++) {
      var lineDif = Math.abs(closeBy[i].line - pressedLine);
      var rowDif = Math.abs(pressedRow - closeBy[i].row);

      if(!closeBy[i].found && lineDif === 0 ) {
        if (!closest.leftRight) {
          closest.lineDist = rowDif;
        }else if (rowDif < closest.lineDist ) {
          closest.lineDist = rowDif;
        }
        closest.leftRight = true;
      }
      if(!closeBy[i].found && !closest.leftRight && lineDif < closest.lineDist ) {
        closest.row = rowDif;
        closest.lineDist = lineDif;
        closest.line = closeBy[i].line - pressedLine;
      }
    }

    var show = closest.leftRight ? closest.lineDist : String.fromCharCode(65 + pressedLine + closest.line);

    allCells[boxNumber] = <td className='td-selected' key={boxNumber} data-key={boxNumber} >{show}</td>

    if (this.state.matrixTriesLeft - 1 === 0) {
      document.addEventListener("keydown", this.keyboardPressed.bind(this), false);
    }

    this.setState({ cells: allCells, matrixTriesLeft: this.state.matrixTriesLeft - 1 });
  }

  array = ["âmbito",
    "néscio",
    "índole",
    "exceto",
    "vereda",
    "convém",
    "mister",
    "alusão",
    "inócuo",
    "infame",
    "anseio",
    "apogeu",
    "mérito",
    "afável",
    "exímio",
    "pressa",
    "facção",
    "nocivo",
    "aferir",
    "apreço",
    "escopo",
    "júbilo",
    "isento",
    "adesão",
    "adorno",
    "paixão",
    "cínico",
    "hostil",
    "eficaz",
    "alheio",
    "idôneo",
    "casual",
    "lúdico",
    "abster",
    "receio",
    "ciente",
    "astuto",
    "idiota",
    "hábito",
    "cômico",
    "êxtase",
    "dispor",
    "sanção",
    "sessão",
    "formal",
    "cessão",
    "dúvida",
    "ocioso",
    "difuso",
    "escusa",
    "dádiva",
    "alento",
    "decoro",
    "maroto",
    "solene",
    "lograr",
    "avidez",
    "perene",
    "ensejo",
    "lírico",
    "ênfase",
    "utopia",
    "ímpeto",
    "gentil",
    "legado",
    "eximir",
    "lábaro",
    "lícito",
    "coagir",
    "alçada",
    "rancor",
    "cortês",
    "otário",
    "alocar",
    "inerte",
    "coesão",
    "julgar",
    "outrem",
    "aludir",
    "sisudo",
    "também",
    "cobiça",
    "remoto",
    "tácito",
    "herege",
    "embora",
    "vedado",
    "prover",
    "asseio",
    "acento",
    "método",
    "altivo",
    "pensar",
    "encher",
    "etéreo",
    "objeto",
    "buscar",
    "patife",
    "inepto",
    "lacuna",
    "agonia",
    "quanto",
    "esteio",
    "danado",
    "acesso",
    "exalar",
    "sóbrio",
    "aguçar",
    "rotina",
    "esboço",
    "cético",
    "desejo",
    "avante",
    "proeza",
    "nativo",
    "axioma",
    "abjeto",
    "vulgar",
    "deixar",
    "emitir",
    "linear",
    "adágio",
    "adepto",
    "cessar",
    "arguir",
    "apatia",
    "passar",
    "idílio",
    "porfia",
    "amiúde",
    "insano",
    "omisso",
    "gitano",
    "bênção",
    "alarde",
    "franco",
    "polido",
    "espaço",
    "sereno",
    "trazer",
    "emanar",
    "viagem",
    "enxuto",
    "suprir",
    "cismar",
    "acordo",
    "origem",
    "esvair",
    "forjar",
    "mártir",
    "ilação",
    "inibir",
    "faceta",
    "ínfimo",
    "emoção",
    "ancião",
    "deriva",
    "crença",
    "jamais",
    "menção",
    "tríade",
    "sentir",
    "exílio",
    "galgar",
    "limiar",
    "tópico",
    "atraso",
    "diante",
    "prazer",
    "evocar",
    "servir",
    "penhor",
    "cingir",
    "arrimo",
    "súbito",
    "início",
    "vetado",
    "ousado",
    "bordão",
    "sátira",
    "sempre",
    "esmero",
    "feição",
    "provém",
    "fático",
    "conter",
    "inútil",
    "cassar",
    "ironia",
    "chapéu",
    "súdito",
    "cólera",
    "devido",
    "brando",
    "delito",
    "estima",
    "piegas",
    "desdém",
    "sádico",
    "tornar",
    "secção",
    "coação",
    "cerrar",
    "aduzir",
    "inveja",
    "crível",
    "nuance",
    "glória",
    "iníquo",
    "função",
    "amanhã",
    "limite",
    "seguir",
    "evadir",
    "tirano",
    "nômade",
    "clamar",
    "aderir",
    "amável",
    "onerar",
    "motriz",
    "léxico",
    "cálido",
    "exigir",
    "comigo",
    "lúcido",
    "exíguo",
    "escuso",
    "várias",
    "mítico",
    "lavrar",
    "pátria",
    "pleito",
    "embate",
    "grande",
    "clichê",
    "fraude",
    "teoria",
    "loquaz",
    "devoto",
    "pueril",
    "erigir",
    "acatar",
    "abismo",
    "mazela",
    "bélico",
    "plebeu",
    "férias",
    "sabido",
    "talvez",
    "chiste",
    "tímido",
    "frisar",
    "fulgor",
    "torpor",
    "engodo",
    "tensão",
    "íntimo",
    "xingar",
    "perfil",
    "tratar",
    "manter",
    "compor",
    "relato",
    "purgar",
    "ofício",
    "gênero",
    "gênese",
    "dotado",
    "célere",
    "peleja",
    "expiar",
    "práxis",
    "surgir",
    "credor",
    "prisma",
    "mácula",
    "colher",
    "exibir",
    "tolher",
    "emenda",
    "ofensa",
    "formos",
    "contém",
    "pudico",
    "elogio",
    "mostra",
    "adorar",
    "estado",
    "servil",
    "ceifar",
    "elidir",
    "florão",
    "melhor",
    "poente",
    "divino",
    "evasão",
    "ilidir",
    "dicção",
    "coibir",
    "pacato",
    "omitir",
    "rapina",
    "propor",
    "alguma",
    "beleza",
    "erário",
    "inapto",
    "sermos",
    "acerca",
    "índice",
    "pessoa",
    "aurora",
    "quando",
    "demais",
    "prezar",
    "aporte",
    "querer",
    "semear",
    "prévio",
    "áspero",
    "matriz",
    "caução",
    "arguto",
    "voltar",
    "dilema",
    "obstar",
    "agouro",
    "vermos",
    "abolir",
    "ajudar",
    "pairar",
    "brecha",
    "apesar",
    "asceta",
    "destra",
    "despir",
    "condiz",
    "cativo",
    "charco",
    "aflige",
    "jovial",
    "lastro",
    "flanco",
    "padrão",
    "álcool",
    "abonar",
    "arroio",
    "saciar",
    "depois",
    "trevas",
    "efeito",
    "apenas",
    "porvir",
    "oposto",
    "findar",
    "enlace",
    "lisura",
    "exação",
    "ventre",
    "acervo",
    "gestão",
    "colega",
    "vileza",
    "cuidar",
    "aceder",
    "ilusão",
    "imagem",
    "expert",
    "enigma",
    "cobrir",
    "máximo",
    "insumo",
    "motivo",
    "adular",
    "velado",
    "triste",
    "sovina",
    "social",
    "condão",
    "pranto",
    "boceta",
    "roubar",
    "saíram",
    "burlar",
    "nascer",
    "severo",
    "margem",
    "ufanar",
    "jiboia",
    "primor",
    "fastio",
    "chofer",
    "serrar",
    "avesso",
    "mandar",
    "vieram",
    "pesado",
    "mestre",
    "biltre",
    "típico",
    "viável",
    "baleia",
    "imolar",
    "enfado",
    "arauto",
    "saguão",
    "captar",
    "grafar",
    "jocoso",
    "fértil",
    "estará",
    "pregar",
    "imerso",
    "prever",
    "desuso",
    "bonito",
    "alegar",
    "descer",
    "missão",
    "evitar",
    "fluido",
    "obtuso",
    "regalo",
    "tutela",
    "vexame",
    "evento",
    "perdão",
    "sentar",
    "tentar",
    "regaço",
    "quiser",
    "nítido",
    "frágil",
    "trégua",
    "remido",
    "mentor",
    "cediço",
    "adotar",
    "côvado",
    "frugal",
    "junção",
    "arisco",
    "reaver",
    "cúmulo",
    "bíblia",
    "esfera",
    "safado",
    "perder",
    "convir",
    "afinco",
    "açoite",
    "vítima",
    "tarefa",
    "máxima",
    "primar",
    "labuta",
    "míngua",
    "cartel",
    "contar",
    "porção",
    "língua",
    "lotado",
    "romper",
    "poupar",
    "amante",
    "antigo",
    "imundo",
    "balela",
    "imoral",
    "fulcro",
    "afetar",
    "agente",
    "aflito",
    "abstém",
    "título",
    "moroso",
    "rápido",
    "símile",
    "sofrer",
    "dentre",
    "venham",
    "ditoso",
    "fausto",
    "sustar",
    "causar",
    "munido",
    "módulo",
    "ciscar",
    "larica",
    "pseudo",
    "zombar",
    "ansiar",
    "vários",
    "começo",
    "modelo",
    "imenso",
    "fálico",
    "afoito",
  "autuar"];

}
export default App;
