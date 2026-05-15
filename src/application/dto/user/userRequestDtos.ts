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
  oldEmail: string;
  newEmail: string;
}

export interface UpdateUserPasswordRequestDto {
  email: string;
  oldPassword: string;
  newPassword: string;
}
