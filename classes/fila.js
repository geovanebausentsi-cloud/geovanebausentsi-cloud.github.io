// ====================================================================
// CLASSE FILA: Estrutura de dados FIFO
// ====================================================================
export class Fila {
    itens = [];

    constructor() {}
       
     //Adiciona um elemento ao final da fila.
    enfileirar(pokemon) {
        this.itens.push(pokemon);
    }

    //desenfileirar - Remove e retorna o primeiro elemento (FIFO), ou undefined se vazia.
    desenfileirar() {
        return this.itens.shift();
    }

    estaVazia() {
        return this.itens.length === 0;
    }

    get todos() {
        return this.itens;
    }
}
