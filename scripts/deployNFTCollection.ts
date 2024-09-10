import { Address, beginCell, Dictionary, toNano } from '@ton/core';
import { buildNftCollectionContentCell, NFTCollection } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';
import { createKeys } from '../wrappers/helpers/keys';

export async function run(provider: NetworkProvider) {

    const nftCollection = provider.open(NFTCollection.createFromConfig({
        ownerAddress: provider.sender().address as Address,
        nextItemIndex: 0,
        collectionContent: buildNftCollectionContentCell(
            {
                collectionContent: 'https://your_collection.com/collection.json',
                commonContent: ''
            }
        ),
        nftItemCode: await compile('NFTItem'),
        royaltyParams: {
            royaltyFactor: 15,
            royaltyBase: 100,
            royaltyAddress: provider.sender().address as Address
        },
        public_key: (await createKeys()).publicKey     
    }, await compile('NFTCollection')));

    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftCollection.address);

}
