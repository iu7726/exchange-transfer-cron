# Exchange Transfer Cron

![Node.js](https://img.shields.io/badge/-Node.js-green?logo=node.js)
![WebSocket](https://img.shields.io/badge/-WebSocket-blue?logo=websockets)

## Description
This project monitors and executes deposits coming into or withdrawals from the exchange.
If a deposit is made, it goes through kyt authentication. Once authentication is complete, it is sent to the wallet and a withdrawal waiting task is executed once kyt authentication is completed.

## Features
- Socket: Connect okx's socket to retrieve deposit and withdrawal information in real time.
- DepositJob: Execute a deposit operation that passes kyt.
- WithdrawJob: Execute withdrawal operations that have passed kyt.

## Install
```shell
$ yarn add
```

## Start
```shell
$ yarn start
```

## Build
```shell
$ tsc
```



