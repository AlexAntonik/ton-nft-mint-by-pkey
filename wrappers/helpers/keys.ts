import { mnemonicToPrivateKey, mnemonicNew } from "ton-crypto";
import {mnemonic} from './mnemonic';
export async function createKeys() {
    return mnemonicToPrivateKey(mnemonic);
}