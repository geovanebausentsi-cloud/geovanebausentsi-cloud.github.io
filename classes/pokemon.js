// ====================================================================
// CLASSE POKEMON: Estrutura para manter apenas os dados importantes
// ====================================================================
export class Pokemon {
    id;
    nome;
    tipo;
    ataqueBase;
    defesaBase;
    imagem;

    constructor(data) {
        this.id = data.id;
        this.nome = data.name;
        this.tipo = data.types[0].type.name;
        // O ataque base é o segundo 'stat' no array da API (índice 1)
        this.ataqueBase = data.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 50;
        // Adicionando a Defesa Base (terceiro 'stat', índice 2)
        this.defesaBase = data.stats.find(stat => stat.stat.name === 'defense')?.base_stat || 50;
        this.imagem = data.sprites.front_default;
    }
}
