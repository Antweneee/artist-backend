export class InvalidSignInMethod extends Error {
    constructor(message?: string) {
        super(message);

        this.name = 'This account is logged in with google';
    }
}
