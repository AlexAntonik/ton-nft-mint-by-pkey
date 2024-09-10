import { Address, toNano } from '@ton/core';
import { NetworkProvider} from '@ton/blueprint';
import { NFTCollection } from '../wrappers/NFTCollection';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));

    const nftCollection = provider.open(NFTCollection.createFromAddress(address));

        await nftCollection.sendAdminMintNft(provider.sender(), {
            value: toNano('0.05'),
            amount: toNano('0.05'),
            itemIndex: 1,
            itemOwnerAddress: provider.sender().address as Address,
            itemContent: '',
            queryId: Date.now()
        });

}