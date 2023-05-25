import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { useEffect, useState } from 'react';

export const useEthereumProvider = () => {
  const [provider, setProvider] = useState<MetaMaskInpageProvider | null>(null);

  useEffect(() => {
    detectEthereumProvider({
      mustBeMetaMask: true,
    })
      .then((value) => setProvider(value as MetaMaskInpageProvider))
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return provider;
};
