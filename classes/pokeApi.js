// ====================================================================
// CLASSE POKEAPI: Focada em Cache, implementa Busca Binária 
// ====================================================================
import { Pokemon } from "./pokemon.js";
export class PokeAPI {
    constructor() {
        this.apiBase = "https://pokeapi.co/api/v2/pokemon/";
        this.urlTodos = "https://pokeapi.co/api/v2/pokemon?limit=1302";
        this.cacheTodosPokemon = []; // Lista de {name, url} ordenada por NOME.
       
    }

    // Faz a requisição de todos os Pokémons, armazena e ORDENA por NOME.
    async carregarCache() {
        console.log("Carregando Cache de Pokémons...");
        try {
            const resp = await fetch(this.urlTodos);
            const data = await resp.json();
            // Armazena e ordena por nome para permitir a Busca Binária
            this.cacheTodosPokemon = data.results.sort((a, b) => a.name.localeCompare(b.name));
            console.log(`Cache de ${this.cacheTodosPokemon.length} Pokémons carregado e ordenado.`);
        } catch (erro) {
            console.error("Erro ao carregar o cache de Pokémons:", erro);
        }
          console.log("pokemons carregado e exibidos:", this.cacheTodosPokemon);
    }

    // AUXILIAR: Faz a requisição dos detalhes de um Pokémon
    async _buscarDetalhesPorURL(url) {
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            return new Pokemon(data);
        } catch (erro) {
            console.error("Erro ao buscar detalhes da URL:", url, erro);
            return null;
        }
    }

    // =========================================================
    // Busca Binária por Nome
    // =========================================================
    async buscarPorNomeDoCache(nome) {
        if (!nome) return null;
        const termoBusca = String(nome).toLowerCase();

        // Se o cache estiver vazio, tenta carregar.
        if (this.cacheTodosPokemon.length === 0) {
            await this.carregarCache();
            if (this.cacheTodosPokemon.length === 0) return null;
        }

        let pokemonBaseEncontrado = null;


        let inicio = 0;
        let fim = this.cacheTodosPokemon.length - 1;

        while (inicio <= fim) {
            const meio = Math.floor((inicio + fim) / 2);
            const nomePokemon = this.cacheTodosPokemon[meio].name;

            if (nomePokemon === termoBusca) {
                pokemonBaseEncontrado = this.cacheTodosPokemon[meio];
                break;
            } else if (nomePokemon < termoBusca) {
                inicio = meio + 1;
            } else {
                fim = meio - 1;
            }
        }

        // Se encontrado no cache, busca os detalhes e retorna.
        if (pokemonBaseEncontrado) {
            return this._buscarDetalhesPorURL(pokemonBaseEncontrado.url);
        }

        return null; // Não encontrado
    }

    //buscarAleatorioDoCache - Seleciona um Pokémon aleatório VÁLIDO do cache.
    async buscarAleatorioDoCache() {
        if (this.cacheTodosPokemon.length === 0) {
            await this.carregarCache();
            if (this.cacheTodosPokemon.length === 0) return null;
        }

        const indiceAleatorio = Math.floor(Math.random() * this.cacheTodosPokemon.length);
        const pokemonBase = this.cacheTodosPokemon[indiceAleatorio];

        return this._buscarDetalhesPorURL(pokemonBase.url);
    }
}