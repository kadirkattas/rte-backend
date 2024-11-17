export default class AuthService {
  public static async authenticate(
    email: string,
    password: string
  ): Promise<boolean> {
    return (
      email === process.env.USER_EMAIL && password === process.env.USER_PASSWORD
    );
  }
}
