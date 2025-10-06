// ====================================================================
// CLASSE BATALHAPOKEMON: Lógica principal da aplicação e UI
// ====================================================================
import { PokeAPI } from "./classes/pokeApi.js";
import { Fila } from "./classes/fila.js";

class BatalhaPokemon {
    constructor(api) {
        this.api = api;
        this.filaDesafiantes = new Fila();
        this.rankingVencedores = [];
        this.chefe = null;
        this.chefeNome = "mewtwo"; // Nome fixo do Chefe

        // Mapeamento dos elementos da UI
        this.elementos = {
            chefeImg: document.getElementById("chefe-img"),
            chefeInfo: document.getElementById("chefe-info"),
            filaLista: document.getElementById("fila-lista"),
            rankingLista: document.getElementById("ranking-lista"),
            resultado: document.getElementById("resultado"),
            addBtn: document.getElementById("add-btn"),
            battleBtn: document.getElementById("battle-btn"),
            searchInput: document.getElementById("search-input"),
            searchBtn: document.getElementById("search-btn"),
            statusMessage: document.getElementById("status-message")
        };

        this.inicializarEventos();
        // Chama a função assíncrona para carregar o chefe
        this.carregarChefe();
    }

    // Carrega o Pokémon Chefe fixo (Mewtwo) do cache.
    async carregarChefe() {
        this.atualizarStatus("Carregando Chefe...", "info");
        try {
            this.chefe = await this.api.buscarPorNomeDoCache(this.chefeNome);

            if (this.chefe) {
                this.elementos.chefeImg.src = this.chefe.imagem;
                this.elementos.chefeImg.alt = `Imagem de ${this.chefe.nome}`;
                this.elementos.chefeInfo.innerHTML = `
                    ${this.chefe.nome.toUpperCase()} | Tipo: ${this.chefe.tipo}<br>
                    ATQ: ${this.chefe.ataqueBase} | DEF: ${this.chefe.defesaBase}`;
                this.atualizarStatus("", "info"); // Limpa o status
            } else {
                this.elementos.chefeInfo.innerText = "Erro: Chefe não encontrado no cache.";
                this.atualizarStatus("Erro: Chefe não encontrado.", "erro");
            }
        } catch (e) {
            console.error("Falha ao carregar Chefe:", e);
            this.atualizarStatus("Falha crítica ao carregar Chefe.", "erro");
        }
    }

    // Busca um Pokémon aleatório válido do cache e adciona a fila.
    async adicionarDesafianteAleatorio() {
        this.atualizarStatus("Buscando desafiante aleatório...", "info");
        // Usa o método dedicado e eficiente da PokeAPI
        const pokemon = await this.api.buscarAleatorioDoCache();

        if (pokemon) {
            console.log("Desafiante aleatório carregado e adicionado à fila:", pokemon);
            this.filaDesafiantes.enfileirar(pokemon);
            this.atualizarFilaUI();
            this.atualizarStatus("", "info");
        } else {
            this.atualizarStatus("Falha ao adicionar desafiante. (Cache vazio ou erro de rede)", "erro");
        }
    }

   // Busca por nome no cache e adiciona à fila.
    async buscarEAdicionarDesafiante() {
        const termo = this.elementos.searchInput.value.trim();
        if (!termo) {
            this.atualizarStatus("Digite um nome para buscar.", "aviso");
            return;
        }

        this.atualizarStatus(`Buscando ${termo.toUpperCase()}...`, "info");

        const pokemon = await this.api.buscarPorNomeDoCache(termo);

        if (pokemon) {
            console.log(`Pokémon "${termo.toUpperCase()}" carregado e adicionado à fila:`, pokemon);
            this.filaDesafiantes.enfileirar(pokemon);
            this.atualizarFilaUI();
            this.atualizarStatus("", "info");
            this.elementos.searchInput.value = ''; // Limpa a busca
        } else {
            this.atualizarStatus(`Pokémon "${termo.toUpperCase()}" não encontrado no cache.`, "erro");
        }
    }


    //Atualiza o HTML do contêiner de desafiantes.
    atualizarFilaUI() {
        const container = this.elementos.filaLista;

        // Uso de Map para simplificar a construção do HTML
        const htmlCards = this.filaDesafiantes.todos.map(p => `
            <div class="desafiante-card">
                <img src="${p.imagem}" alt="${p.nome.toUpperCase()}">
                <p>
                    #${p.id} ${p.nome.toUpperCase()}<br>
                    ATQ: ${p.ataqueBase} | DEF: ${p.defesaBase}
                </p>
            </div>
        `).join('');

        container.innerHTML = htmlCards || '<p class="empty-list">Fila Vazia</p>';
    }

    // atualizarRankingUI - Atualiza o HTML da lista de vencedores.
    atualizarRankingUI() {
        const lista = this.elementos.rankingLista;

        // Uso de Map para simplificar a construção do HTML
        lista.innerHTML = this.rankingVencedores.map(p =>
            `<li>${p.nome.toUpperCase()} (Ataque: ${p.ataqueBase})</li>`
        ).join('');
    }

    // atualizarStatus - Exibe mensagens de feedback na UI.
    atualizarStatus(msg, tipo = "info") {
        this.elementos.statusMessage.textContent = msg;
        // Garante que a classe base 'status-message' esteja sempre presente
        this.elementos.statusMessage.className = `status-message ${tipo}`;
    }

    //o simularBatalha - Executa a lógica da batalha.
    simularBatalha() {
        if (!this.chefe) {
            this.atualizarStatus("O Chefe ainda não carregou.", "aviso");
            return;
        }
        if (this.filaDesafiantes.estaVazia()) {
            this.atualizarStatus("A fila está vazia. Adicione um desafiante!", "aviso");
            this.elementos.resultado.innerText = "Aguardando Desafiantes...";
            return;
        }

        // 1. Desenfileirar
        const desafiante = this.filaDesafiantes.desenfileirar();
        this.atualizarFilaUI();

        // 2. Cálculo do Poder de Batalha Total (PBT)
        // PBT = (Ataque * 1.5) + Defesa
        const pbtDesafiante = (desafiante.ataqueBase * 1.5) + desafiante.defesaBase;
        const pbtChefe = (this.chefe.ataqueBase * 1.5) + this.chefe.defesaBase;

        // 3. Condição de Vitória (Comparação Direta)
        const vitoriaDesafiante = pbtDesafiante > pbtChefe;

        // 4. Registrar e Exibir Resultado
        const infoDesafiante = `(Poder: ${pbtDesafiante.toFixed(1)})`;
        const infoChefe = `(Poder: ${pbtChefe.toFixed(1)})`;
        
        if (vitoriaDesafiante) {
            this.rankingVencedores.push(desafiante);
            this.atualizarRankingUI();
            const msg = `${desafiante.nome.toUpperCase()} ${infoDesafiante} venceu o Chefe ${infoChefe}! 🎉`;
            this.elementos.resultado.innerHTML = `<span class="sucesso">${msg}</span>`;
        } else {
            const msg = `${desafiante.nome.toUpperCase()} ${infoDesafiante} perdeu para o Chefe ${infoChefe}! 😢`;
            this.elementos.resultado.innerHTML = `<span class="erro">${msg}</span>`;
        }
    }

    // Configura os listeners dos botões.
    inicializarEventos() {
        // Uso de Arrow Functions para manter o 'this' no contexto da classe
        this.elementos.addBtn.addEventListener("click", () => this.adicionarDesafianteAleatorio());
        this.elementos.battleBtn.addEventListener("click", () => this.simularBatalha());
        this.elementos.searchBtn.addEventListener("click", () => this.buscarEAdicionarDesafiante());
    }
}

// ====================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ====================================================================
(async function init() {
    // 1. Carregar Cache de TODOS os Pokémons ANTES de tudo
    const pokeApi = new PokeAPI();
    await pokeApi.carregarCache();

    // 2. Iniciar a lógica da aplicação
    new BatalhaPokemon(pokeApi);
})();