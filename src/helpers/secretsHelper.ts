import { type SecretStorage, window } from "vscode";

type Secrets = {
    apiToken: string;
};

export default class SecretsHelper {
    private static storage: SecretStorage | undefined;

    public static configureSecretsHelper(storage: SecretStorage) {
        this.storage = storage;
    }

    public static async getSecret(key: keyof Secrets) {
        if (!this.storage) {
            throw new Error("SecretsHelper is not configured");
        }
        return await this.storage.get(key);
    }

    public static setSecret<T extends keyof Secrets>(key: T, value: Secrets[T]) {
        if (!this.storage) {
            throw new Error("SecretsHelper is not configured");
        }
        this.storage.store(key, value);
    }

    public static async requestSecretInputToUser({ prompt }: { prompt: string }) {
        if (!this.storage) {
            throw new Error("SecretsHelper is not configured");
        }

        const userInput = await window.showInputBox({ prompt, password: true, ignoreFocusOut: true });

        return userInput;
    }

}
