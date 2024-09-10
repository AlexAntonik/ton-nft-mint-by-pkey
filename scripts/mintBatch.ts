import { Address, toNano } from '@ton/core';
import { NetworkProvider} from '@ton/blueprint';
import { randomAddress } from '@ton/test-utils';
import { NFTCollection } from '../wrappers/NFTCollection';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));

    const nftCollection = provider.open(NFTCollection.createFromAddress(address));

        await nftCollection.sendBatchMint(provider.sender(), {
            value: toNano('0.5'),
            queryId: Date.now(),
            nfts: [
                {
                    amount: toNano('0.02'),
                    index: 1,
                    ownerAddress: randomAddress(),
                    content: 'https://your_collection.com/item.json'
                },
                {
                    amount: toNano('0.02'),
                    index: 2,
                    ownerAddress: randomAddress(),
                    content: 'https://your_collection.com/item.json'
                },
            ]
        });

}