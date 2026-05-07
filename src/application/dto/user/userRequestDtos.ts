export interface RegisterUserRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserRequestDto {
  email: string;
  password: string;
}

export interface UpdateUserEmailRequestDto {
  newEmail: string;
}

export interface UpdateUserPasswordRequestDto {
  oldPassword: string;
  newPassword: string;
}
