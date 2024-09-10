import { Address, toNano } from '@ton/core';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';
import { NFTItem } from '../wrappers/NFTItem';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Nft address'));

    const nftItem = provider.open(NFTItem.createFromAddress(address));

        await nftItem.sendTransfer(provider.sender(), {
            value: toNano('1'),
            fwdAmount: toNano('0.02'),
            queryId: Date.now(),
            newOwner: randomAddress(),
            responseAddress: randomAddress()
        });

    ui.write('Transaction sent');
}