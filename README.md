# TON NFT Collection with Secure Direct Minting by asymetric signed requests

This repository contains smart contracts for an NFT collection on the TON blockchain, implementing and extending the [TEP-0062 NFT standard](https://github.com/ton-blockchain/TEPs/blob/master/text/0062-nft-standard.md). The project includes two smart contracts: one for the NFT collection and one for individual NFT items. 

## Key Feature: Secure Direct Minting

**These smart contracts support direct minting protected by asymmetric signatures.**  The contract owner creates and signs minting request messages using asymmetric cryptography. These signed messages are then provided to users, who can send them to the smart contract to mint their NFTs directly. This approach ensures that only authorized mints occur while allowing users to initiate the minting process themselves.

This approach shifts the responsibility for minting from the contract owner to the blockchain functionality, enhancing security and transparency. The NFT index serves as its unique identifier, protecting against replay attacks. Additionally, the signed message includes a content cell, allowing the owner to predetermine the content of minted NFTs. This gives the contract owner control over the NFT content while delegating the minting process to users.

In addition to the secure direct minting feature, the collection contract supports modifying the content of both the collection and all deployed items.

## Project Structure

- `contracts/`: Source code of all smart contracts and their dependencies
- `wrappers/`: Wrapper classes (implementing `Contract` from ton-core) for the contracts, including [de]serialization primitives and compilation functions
- `scripts/`: Utility scripts, including deployment scripts

## Getting Started

### Prerequisites

Ensure you have Node.js and yarn (or npm) installed on your system.

### Installation

1. Clone this repository
2. Run `yarn install` or `npm install` to install dependencies

### Building

To build the project, run:

```
yarn blueprint build NFTCollection
```

or

```
npx blueprint build NFTCollection
```

### Deployment

To deploy the NFT collection, use the `deployNFTCollection` script:

```
yarn blueprint run deployNFTCollection
```

or

```
npx blueprint run deployNFTCollection
```

### Minting

To mint an NFT directly from a user's wallet using the secure direct minting feature, use the `mintUser` script:

```
yarn blueprint run mintUser
```

or

```
npx blueprint run mintUser
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
