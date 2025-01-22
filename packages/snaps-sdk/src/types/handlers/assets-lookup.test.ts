import { is } from '@metamask/superstruct';

import { FungibleAssetMetadataStruct } from './assets-lookup';

const BTC_ICON_BASE64 =
  'PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMC4wMDAyIiByPSIxOC44ODg5IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfNjlfODQxKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTI0LjgxNTIgMTIuMTcxNkMyNy40MzQyIDEzLjEzMjUgMjkuMzIwNiAxNC41NTYxIDI4Ljg4ODIgMTcuMjg3OUMyOC41NjA5IDE5LjI3NjUgMjcuNTE4OCAyMC4yNDg1IDI2LjExMDYgMjAuNTkxNUMyNy45ODQ1IDIxLjY0MDQgMjguODg2NSAyMy4yMzI1IDI3LjkyMTYgMjYuMDI1MkMyNi43MjE3IDI5LjUyNzggMjQuMDM1OSAyOS44NDU1IDIwLjQ3ODQgMjkuMTY3TDE5LjU2MjUgMzIuODYzNkwxNy40OTU1IDMyLjM1MTNMMTguNDExMyAyOC42NTQ4QzE4LjE4NjQgMjguNTk0OSAxNy45NDk0IDI4LjUzOTcgMTcuNzA2MyAyOC40ODMxQzE3LjM4MTUgMjguNDA3NSAxNy4wNDU4IDI4LjMyOTMgMTYuNzEzNiAyOC4yMzM5TDE1Ljc5NzcgMzEuOTMwN0wxMy43MzQ1IDMxLjQxOTNMMTQuNjUwMyAyNy43MjI2TDEwLjU0MDMgMjYuNjAzMkwxMS41NjE5IDIzLjk4OTRDMTEuNTYxOSAyMy45ODk0IDEzLjExMzIgMjQuNDE2MSAxMy4wODkxIDI0LjM4OTNDMTMuNjY0NSAyNC41MjkyIDEzLjk0NTkgMjQuMTI3MyAxNC4wNjExIDIzLjg0NThMMTUuNTI3OCAxNy45MTk3TDE2LjU5NTEgMTMuNzA3N0MxNi42NDEzIDEzLjI1MjQgMTYuNDk4NyAxMi42NTY4IDE1LjY1OCAxMi40MzAyQzE1LjcxNTIgMTIuMzk2NiAxNC4xNDQ1IDEyLjA1NTEgMTQuMTQ0NSAxMi4wNTUxTDE0Ljc1NjYgOS41Nzc5N0wxOC45OTI2IDEwLjYyNzhMMTkuODg5NyA3LjAwNjg0TDIyLjAyMzcgNy41MzU3M0wyMS4xMjY2IDExLjE1NjdDMjEuNTQxNSAxMS4yNDY5IDIxLjk0NyAxMS4zNTE4IDIyLjM1NjggMTEuNDU3OEwyMi4zNTcgMTEuNDU3OEMyMi40OTE1IDExLjQ5MjYgMjIuNjI2NSAxMS41Mjc1IDIyLjc2MjQgMTEuNTYyMUwyMy42NTk1IDcuOTQxMTJMMjUuNzM1OSA4LjQ1NTcxTDI0LjgxNTIgMTIuMTcxNlpNMTkuMTUyNSAxNy45OTRDMTkuMTg0OCAxOC4wMDM2IDE5LjIxOTQgMTguMDE0IDE5LjI1NjEgMTguMDI1QzIwLjQ5NyAxOC4zOTggMjQuMTc2NiAxOS41MDM3IDI0Ljc5NjQgMTcuMDQxN0MyNS4zNzM1IDE0LjcwMTQgMjIuMTg1NyAxMy45ODY2IDIwLjcwNDUgMTMuNjU0NEMyMC41Mjk2IDEzLjYxNTIgMjAuMzc4NCAxMy41ODEzIDIwLjI2MDEgMTMuNTUwN0wxOS4xNTI1IDE3Ljk5NFpNMTcuNTE5NiAyNS4yOTM5QzE3LjQ1NDQgMjUuMjc0NCAxNy4zOTQzIDI1LjI1NjcgMTcuMzM5OCAyNS4yNDA2TDE4LjQ0NzQgMjAuNzk3NEMxOC41NzgzIDIwLjgzMTQgMTguNzQzOCAyMC44NzAzIDE4LjkzNTIgMjAuOTE1MkMyMC42ODEzIDIxLjMyNTUgMjQuNTgxMyAyMi4yNDIgMjMuOTc1MSAyNC41OTU0QzIzLjM4NjggMjcuMDM5IDE5LjA0ODQgMjUuNzQ4NyAxNy41MTk2IDI1LjI5MzlaIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzY5Xzg0MSIgeDE9IjIwIiB5MT0iMS4xMTEzMyIgeDI9IjIwIiB5Mj0iMzguODg5MSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkZCNjBBIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0Y1ODMwMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=';

describe('FungibleAssetMetadataStruct', () => {
  it.each([
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      fungible: true,
      iconUrl: `data:image/svg+xml;base64,${BTC_ICON_BASE64}`,
      units: [
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          decimals: 8,
        },
      ],
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      fungible: true,
      iconUrl: 'https://metamask.io/sol.svg',
      units: [
        {
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9,
        },
      ],
    },
  ])('validates an object', (value) => {
    expect(is(value, FungibleAssetMetadataStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      fungible: true,
      iconUrl: 'https://metamask.io/btc.svg',
      units: [],
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      fungible: true,
      iconUrl: 'http://metamask.io/btc.svg',
      units: [
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          decimals: 8,
        },
      ],
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      fungible: true,
      iconUrl: 'data:image/png;base64,',
      units: [
        {
          name: 'Bitcoin',
          symbol: 'BTC',
          decimals: 8,
        },
      ],
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, FungibleAssetMetadataStruct)).toBe(false);
  });
});
