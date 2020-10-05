proposicao_base = "P . Q + r -> s <-> p' + q . (r' + (s . p')')";
/*proposicao_base = "(p'+q)'+s+q.r.((p -> q <-> s)')'";
proposicao_base = "p+q.r";
proposicao_base = "p -> r <-> q + r'";
proposicao_base = "p.q -> (p <-> q+r)";
proposicao_base = "p+q.r+(p+q)";
proposicao_base = "(p+q).r+(p+q)+(p').(p'.p')";
proposicao_base = "(p->q) + (p->q)";*/

//console.log(proposicao_base);

/*

pseudocódigo

remover espaços em branco
deixar tudo em lowercase
substituir -> por > e <-> por =
localizar proposições simples e adiciona-las a lista de proposicoes nos primeiros indices
resolver e substituir os parenteses, começando do mais interno e pela esquerda, adicionando-os na lista de proposicoes

*/

function gerarTabela(prop) {
	proposicao_base = prop;

	function indiceProposicao(str) {
		for (let i=0; i<proposicoes.length; i++)
			if (proposicoes[i].str == str)
				return i;
		return -1;
	}

	function substituirTudo() {
		for (let i=proposicoes.length-1; i>=0; i--)
			proposicao = proposicao.replaceAll(proposicoes[i].str, i);
	}

	function substituirTudoInverso(str) {
		for (let i=proposicoes.length-1; i>=0; i--) {
			let r = proposicoes[i].str;
			if (proposicoes[i].type != 0)
				r = "("+r+")";
			str = str.replaceAll(i.toString(), r);
		}
		str = str.replaceAll("&", ".");
		str = str.replaceAll(">", "->");
		str = str.replaceAll("=", "<->");
		return str;
	}

	function numeroEm(str, posicao) {
		let inicio, fim, i;
		for (i = posicao-1; i>=0; i--)
			if (isNaN(str.charAt(i)))
				break;
		inicio = i+1;
		for (i = posicao+1; i<str.length; i++)
			if (isNaN(str.charAt(i)))
				break;
		fim = i-1;
		return str.substring(inicio, fim+1);
	}

	function addZeros(v, n) {
		while(v.length < n)
			v = "0"+v;
		return v;
	}

	try {

		// validar parenteses
		let parentesesAbertos = 0;
		let valido = true;
		let p;
		for (p=0; p<proposicao_base.length; p++) {
			let c = proposicao_base.charAt(p);
			if (c=='(')
				parentesesAbertos++;
			else if (c==')')
				parentesesAbertos--;
			if (parentesesAbertos < 0)
				break;
		}
		if (p!=proposicao_base.length || parentesesAbertos!=0)
			valido = false;
		if (!valido)
			return {tabela: [[]], euler: []};
		// remover espaços em branco
		proposicao = proposicao_base.replaceAll(" ", "");

		// deitar tudo em lowercase
		proposicao = proposicao.replace(/[A-Z]/g, (s) => s.toLowerCase())

		// substituir -> por > e <-> por = e . por &
		proposicao = proposicao.replaceAll(".", "&");
		proposicao = proposicao.replaceAll("<->", "=");
		proposicao = proposicao.replaceAll("->", ">");

		//localizar proposicoes simples
		let n = 0;
		proposicoes = [];
		proposicoesSimples = [];
		proposicao.match(/[a-z]/g).forEach((p) => {
			if (proposicoesSimples.indexOf(p) == -1)
				proposicoesSimples.push(p);
		})
		proposicoesSimples = proposicoesSimples.sort((a, b) => a.localeCompare(b));
		proposicoesSimples.forEach((p) => proposicoes[n++] = {str: p, type: 0, values: []});

		substituirTudo();

		let limit = 10000;
		while(isNaN(proposicao)) {
			if (--limit == 0)
				return {tabela: [[]], euler: []};
			//console.log(proposicao);
			fimParenteses = proposicao.indexOf(")");
			if (fimParenteses == -1) {
				inicioParenteses = 0;
				fimParenteses = proposicao.length;
			}
			else
				for (let i = fimParenteses-1; i>=0; i--)
					if (proposicao.charAt(i) == '(') {
						inicioParenteses = i+1;
						break;
					}
			pedaco = proposicao.substring(inicioParenteses, fimParenteses);
			let novoPedaco = pedaco;
			if (pedaco.indexOf("'") !=-1) {
				let elemento = numeroEm(pedaco, pedaco.indexOf("'")-1);
				let indice = indiceProposicao(elemento+"'");
				if (indice == -1) {
					proposicoes[n++] = {str: elemento+"'", type: 1, values: [elemento]};
					indice = n-1;
				}
				novoPedaco = pedaco.replace(/([0-9]+\')/, indice);
			} else if (pedaco.indexOf("&") !=-1) {
				let elemento1 = numeroEm(pedaco, pedaco.indexOf("&")-1);
				let elemento2 = numeroEm(pedaco, pedaco.indexOf("&")+1);
				let indice = indiceProposicao(elemento1+"&"+elemento2);
				if (indice == -1) {
					proposicoes[n++] = {str: elemento1+"&"+elemento2, type: 2, values: [elemento1, elemento2]};
					indice = n-1;
				}
				novoPedaco = pedaco.replace(/([0-9]+\&[0-9]+)/, indice);
			} else if (pedaco.indexOf("+") !=-1) {
				let elemento1 = numeroEm(pedaco, pedaco.indexOf("+")-1);
				let elemento2 = numeroEm(pedaco, pedaco.indexOf("+")+1);
				let indice = indiceProposicao(elemento1+"+"+elemento2);
				if (indice == -1) {
					proposicoes[n++] = {str: elemento1+"+"+elemento2, type: 3, values: [elemento1, elemento2]};
					indice = n-1;
				}
				novoPedaco = pedaco.replace(/([0-9]+\+[0-9]+)/, indice);
			} else if (pedaco.indexOf(">") !=-1) {
				let elemento1 = numeroEm(pedaco, pedaco.indexOf(">")-1);
				let elemento2 = numeroEm(pedaco, pedaco.indexOf(">")+1);
				let indice = indiceProposicao(elemento1+">"+elemento2);
				if (indice == -1) {
					proposicoes[n++] = {str: elemento1+">"+elemento2, type: 4, values: [elemento1, elemento2]};
					indice = n-1;
				}
				novoPedaco = pedaco.replace(/([0-9]+\>[0-9]+)/, indice);
			} else if (pedaco.indexOf("=") !=-1) {
				let elemento1 = numeroEm(pedaco, pedaco.indexOf("=")-1);
				let elemento2 = numeroEm(pedaco, pedaco.indexOf("=")+1);
				let indice = indiceProposicao(elemento1+"="+elemento2);
				if (indice == -1) {
					proposicoes[n++] = {str: elemento1+"="+elemento2, type: 5, values: [elemento1, elemento2]};
					indice = n-1;
				}
				novoPedaco = pedaco.replace(/([0-9]+\=[0-9]+)/, indice);
			}
			//console.log(proposicao);
			proposicao = proposicao.substring(0, inicioParenteses) + novoPedaco + proposicao.substring(fimParenteses, proposicao.length);
			if (!isNaN(pedaco))
				proposicao = proposicao.replace("("+pedaco+")", pedaco);
		}
		//console.log(proposicao);
		let tabela = [];
		tabela[0] = [];

		let str = "";
		for (let i=0; i<proposicoes.length; i++) {
			if (str != "") str+= " | ";
			let substituido = substituirTudoInverso(proposicoes[i].str);
			str += substituido;
			tabela[0].push(substituido);
		}
		//console.log(str);

		for (let caso = 0; caso < Math.pow(2, proposicoesSimples.length); caso++) {
			let binario = addZeros(caso.toString(2), proposicoesSimples.length);
			//console.log(binario);
			for (let i=0; i<proposicoesSimples.length; i++) {
				proposicoes[i].value = binario.charAt(i) == '1';
			}
			for (let i=proposicoesSimples.length; i<proposicoes.length; i++) {
				switch(proposicoes[i].type) {
					case 1:
						proposicoes[i].value = !proposicoes[proposicoes[i].values[0]].value;
					break;
					case 2:
						proposicoes[i].value = proposicoes[proposicoes[i].values[0]].value && proposicoes[proposicoes[i].values[1]].value;
					break;
					case 3:
						proposicoes[i].value = proposicoes[proposicoes[i].values[0]].value || proposicoes[proposicoes[i].values[1]].value;
					break;
					case 4:
						proposicoes[i].value = !proposicoes[proposicoes[i].values[0]].value || proposicoes[proposicoes[i].values[1]].value;
					break;
					case 5:
						proposicoes[i].value = proposicoes[proposicoes[i].values[0]].value == proposicoes[proposicoes[i].values[1]].value;
					break;
				}
			}
			tabela.push([]);
			let str = "";
			for (let i=0; i<proposicoes.length; i++) {
				if (str != "") str+= " | ";
				let valor = (proposicoes[i].value)?"1":"0"
				str += valor;
				tabela[tabela.length-1].push(valor);
			}
			//console.log(str);
		}

		// diagrama de euler
		let base64s = [];

		if (proposicao_base.match(/(\-\>)|(\<\-\>)/) == null) {

			let eulerWidth = 100;
			let eulerHeight = 100;
			let eulerInnerRadius = 15;
			let eulerOuterRadius = 25;
			let eulerImages = [];

			for (let i=0; i<proposicoesSimples.length; i++) {
				eulerImages.push([]);
				let circleX = eulerWidth/2+Math.cos((360/proposicoesSimples.length*i + 180) / 180 * Math.PI)*eulerInnerRadius;
				let circleY = eulerHeight/2+Math.sin((360/proposicoesSimples.length*i + 180) / 180 * Math.PI)*eulerInnerRadius;
				for (let pixel = 0; pixel<eulerWidth*eulerHeight; pixel++) {
					let x = pixel % eulerWidth;
					let y = Math.floor(pixel / eulerWidth);
					if (Math.sqrt(Math.pow(x-circleX, 2)+Math.pow(y-circleY, 2)) <= eulerOuterRadius) {
						eulerImages[i].push(0);
						eulerImages[i].push(0);
						eulerImages[i].push(0);
						eulerImages[i].push(255);
					} else {
						eulerImages[i].push(255);
						eulerImages[i].push(255);
						eulerImages[i].push(255);
						eulerImages[i].push(255);
					}
				}
			}

			for (let i=proposicoesSimples.length; i<proposicoes.length; i++) {
				eulerImages.push([]);
				for (let pixel = 0; pixel<eulerWidth*eulerHeight; pixel++) {
					let paint;
					switch(proposicoes[i].type) {
						case 1:
							paint = eulerImages[proposicoes[i].values[0]][pixel*4] == 255;
						break;
						case 2:
							paint = eulerImages[proposicoes[i].values[0]][pixel*4] == 0 && eulerImages[proposicoes[i].values[1]][pixel*4] == 0;
						break;
						case 3:
							paint = eulerImages[proposicoes[i].values[0]][pixel*4] == 0 || eulerImages[proposicoes[i].values[1]][pixel*4] == 0;
						break;
					}
					if (paint) {
						eulerImages[i].push(0);
						eulerImages[i].push(0);
						eulerImages[i].push(0);
						eulerImages[i].push(255);
					} else {
						eulerImages[i].push(255);
						eulerImages[i].push(255);
						eulerImages[i].push(255);
						eulerImages[i].push(255);
					}
				}
			}

			let canvas =  document.createElement("canvas");
			canvas.width = eulerWidth;
			canvas.height = eulerHeight;
			let ctx = canvas.getContext('2d');
			let myImageData = ctx.createImageData(eulerWidth, eulerHeight);

			for (let i=0; i<eulerImages.length; i++) {
				for (let j=0; j<eulerImages[i].length; j++)
					myImageData.data[j] = eulerImages[i][j];
				// draw blue circles
				for (let j=0; j<proposicoesSimples.length; j++)
					for (let a=0; a<360; a++) {
						let circleX = eulerWidth/2+Math.cos((360/proposicoesSimples.length*j + 180) / 180 * Math.PI)*eulerInnerRadius;
						let circleY = eulerHeight/2+Math.sin((360/proposicoesSimples.length*j + 180) / 180 * Math.PI)*eulerInnerRadius;
						let x = Math.round(circleX + Math.cos(a / 180 * Math.PI)*eulerOuterRadius);
						let y = Math.round(circleY + Math.sin(a / 180 * Math.PI)*eulerOuterRadius);
						myImageData.data[(y * eulerWidth + x)*4] = 0;
						myImageData.data[(y * eulerWidth + x)*4+1] = 0;
						myImageData.data[(y * eulerWidth + x)*4+2] = 255;
						myImageData.data[(y * eulerWidth + x)*4+3] = 255;
					}
				ctx.putImageData(myImageData, 0, 0);
				base64s.push(canvas.toDataURL("image/png"));
				//console.log(base64s[base64s.length-1]);
			}
		}
		// fim diagrama de euler

		return {tabela: tabela, euler: base64s};
	} catch (error) {
		return {tabela: [[]], euler: []};
	}	
}