# Register document

This project is a smart contract in Solidity responsible for storing documents and their signatories.

To install the project, you will need Node.js installed on your machine.
After installing or updating Node.js, simply run the npm install command.

#### Comandos com NPM:
```shell
npm run test
npm run coverage
npm run compile
npm run deploy
npm run update
npm run verify
```

#### Comandos com YARN:
```shell
yarn test
yarn coverage
yarn compile
yarn deploy
yarn update
yarn verify
```

To enable gas estimation in tests, go to the hardhat.config.ts file. In the `gasReporter` session change `enabled: false` to `enabled: true`.
#### Attention, it is very important that each and every smart contract has 100% test coverage, as data recorded on the blockchain will never be changed.