export class Transacao {
    constructor(
        public id: number | null,
        public usuarioId: number,
        public tipo: string,
        public valor: number,
        public descricao?: string,
        public data?: Date,
    ) { }
}
