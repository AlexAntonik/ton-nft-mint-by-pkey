import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary, toNano } from '@ton/core';
import { CollectionMint, MintValue } from './helpers/collectionHelpers';
import { encodeOffChainContent } from './helpers/content';

import { sign } from 'ton-crypto';
import { create } from 'domain';
import { createKeys } from './helpers/keys';

export type RoyaltyParams = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

export type NFTCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number;
    collectionContent: Cell;
    nftItemCode: Cell;
    royaltyParams: RoyaltyParams;
    public_key: Buffer;
};

export type NftCollectionContent = {
    collectionContent: string;
    commonContent: string;
};

export function buildNftCollectionContentCell(data: NftCollectionContent): Cell {
    let contentCell = beginCell();

    let collectionContent = encodeOffChainContent(data.collectionContent);

    let commonContent = beginCell();
    commonContent.storeStringTail(data.commonContent);

    contentCell.storeRef(collectionContent);
    contentCell.storeRef(commonContent);

    return contentCell.endCell();
}

export function nftCollectionConfigToCell(config: NFTCollectionConfig): Cell {
    return beginCell()
    .storeAddress(config.ownerAddress)
    .storeUint(config.nextItemIndex, 64)
    .storeRef(config.collectionContent)
    .storeRef(config.nftItemCode)
    .storeRef(
        beginCell()
            .storeUint(config.royaltyParams.royaltyFactor, 16)
            .storeUint(config.royaltyParams.royaltyBase, 16)
            .storeAddress(config.royaltyParams.royaltyAddress)
    )
    .storeBuffer(config.public_key)
    .endCell();
}

export class NFTCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NFTCollection(address);
    }

    static createFromConfig(config: NFTCollectionConfig, code: Cell, workchain = 0) {
        const data = nftCollectionConfigToCell(config);
        const init = { code, data };
        return new NFTCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendUserMintNft(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint;
            queryId: number;
            itemOwnerAddress: Address;
            itemContent: string;
            amount: bigint;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftMessage = beginCell();

        nftMessage.storeAddress(opts.itemOwnerAddress);
        nftMessage.storeRef(nftContent);

        const unsignedBody = beginCell()
            .storeUint(Date.now(),64)
            .storeCoins(opts.amount)
            .storeRef(nftMessage)
            .storeCoins( toNano('0.01'));

        const hash = unsignedBody.endCell().hash();

        const signature = sign(hash, (await createKeys()).secretKey);

        const body = beginCell()
            .storeUint(25, 32) // op-code
            .storeUint(opts.queryId, 64)
            .storeBuffer(signature)
            .storeBuilder(unsignedBody)
            .endCell();

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }

    
    async sendAdminEditNft(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint;
            queryId: number;
            itemAddress: Address;
            itemOwnerAddress: Address;
            itemContent: string;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftMessage = beginCell();
        nftMessage.storeRef(nftContent);

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(5, 32) //op-code
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.itemAddress)
                .storeRef(nftMessage)
            .endCell(),
        });
    }
    async sendAdminMintNft(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint;
            queryId: number;
            itemIndex: number;
            itemOwnerAddress: Address;
            itemContent: string;
            amount: bigint;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftMessage = beginCell();

        nftMessage.storeAddress(opts.itemOwnerAddress);
        nftMessage.storeRef(nftContent);

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32) //op-code
                .storeUint(opts.queryId, 64)
                .storeUint(opts.itemIndex, 64)
                .storeCoins(opts.amount)
                .storeRef(nftMessage)
            .endCell(),
        });
    }

    async sendBatchMint(provider: ContractProvider, via: Sender,
        opts: {
            value: bigint;
            queryId: number;
            nfts: CollectionMint[];
        }
    ) {

        if (opts.nfts.length > 250) {
            throw new Error('More than 250 items');
        }

        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintValue);
            for (const nft of opts.nfts) {
                dict.set(nft.index, nft);
            }

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(2, 32)
                .storeUint(opts.queryId, 64)
                .storeDict(dict)
            .endCell(),
        });
    }

    async getRoyaltyParams(provider: ContractProvider) {
        const result = await provider.get('royalty_params', []);
        return {
            royaltyFactor: result.stack.readBigNumber(),
            royaltyBase: result.stack.readBigNumber(),
            royaltyAddress: result.stack.readAddress()
        };
    }
    
    async getNftCollectionData(provider: ContractProvider) {
        const result = await provider.get('get_collection_data', []);
        return {
            nextItemIndex: result.stack.readBigNumber(),
            collectionContent: result.stack.readCell(),
            ownerAddress: result.stack.readAddress()
        };
    }
}
