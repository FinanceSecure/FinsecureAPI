export interface RegisterUserRequestDto {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginUserRequestDto {
  email: string;
  senha: string;
}

export interface UpdateUserEmailRequestDto {
  emailAntigo: string;
  emailNovo: string;
}

export interface UpdateUserPasswordRequestDto {
  email: string;
  senhaAntiga: string;
  senhaNova: string;
}
