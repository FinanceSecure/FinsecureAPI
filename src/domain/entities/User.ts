export class User {
  constructor(
    public id: string | null,
    public name: string,
    public email: string,
    public password: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) { }

  changePassword(newPassword: string) {
    this.password = newPassword;
  }
}
