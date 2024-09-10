import { Address, toNano } from '@ton/core';
import { NetworkProvider} from '@ton/blueprint';
import { NFTCollection } from '../wrappers/NFTCollection';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));
    const itemAddress = Address.parse(args.length > 0 ? args[0] : await ui.input('Item address'));

    const nftCollection = provider.open(NFTCollection.createFromAddress(address));

        await nftCollection.sendAdminEditNft(provider.sender(), {
            value: toNano('0.05'),
            itemAddress: itemAddress,
            itemOwnerAddress: provider.sender().address as Address,
            itemContent: 'https://your_collection.com/item.json',
            queryId: Date.now()
        });

    ui.write('Item edit transaction sent');
}