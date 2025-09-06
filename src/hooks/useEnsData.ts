import { useState, useEffect } from 'react';
import { createPublicClient, http, Address } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// Create a public client for ENS resolution on mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

interface EnsData {
  name: string | null;
  avatar: string | null;
  loading: boolean;
  error: string | null;
}

export function useEnsData(address: Address | undefined): EnsData {
  const [ensData, setEnsData] = useState<EnsData>({
    name: null,
    avatar: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!address) {
      setEnsData({ name: null, avatar: null, loading: false, error: null });
      return;
    }

    let isCancelled = false;

    const resolveEns = async () => {
      setEnsData(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Resolve ENS name
        const ensName = await publicClient.getEnsName({
          address: address as Address,
        });

        if (isCancelled) return;

        let avatar: string | null = null;
        
        // If we have an ENS name, try to get the avatar
        if (ensName) {
          try {
            avatar = await publicClient.getEnsAvatar({
              name: normalize(ensName),
            });
          } catch (avatarError) {
            console.warn('Failed to resolve avatar for', ensName, avatarError);
          }
        }

        if (!isCancelled) {
          setEnsData({
            name: ensName,
            avatar,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('ENS resolution failed:', error);
          setEnsData({
            name: null,
            avatar: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    };

    resolveEns();

    return () => {
      isCancelled = true;
    };
  }, [address]);

  return ensData;
}

// Hook for multiple addresses
export function useMultipleEnsData(addresses: Address[]): Record<string, EnsData> {
  const [ensDataMap, setEnsDataMap] = useState<Record<string, EnsData>>({});

  useEffect(() => {
    if (addresses.length === 0) {
      setEnsDataMap({});
      return;
    }

    let isCancelled = false;

    const resolveMultipleEns = async () => {
      const newEnsDataMap: Record<string, EnsData> = {};

      // Initialize loading state for all addresses
      addresses.forEach(address => {
        newEnsDataMap[address] = {
          name: null,
          avatar: null,
          loading: true,
          error: null,
        };
      });

      setEnsDataMap(newEnsDataMap);

      // Resolve ENS data for each address
      const promises = addresses.map(async (address) => {
        try {
          const ensName = await publicClient.getEnsName({ address });
          
          let avatar: string | null = null;
          if (ensName) {
            try {
              avatar = await publicClient.getEnsAvatar({
                name: normalize(ensName),
              });
            } catch (avatarError) {
              console.warn('Failed to resolve avatar for', ensName, avatarError);
            }
          }

          return {
            address,
            data: {
              name: ensName,
              avatar,
              loading: false,
              error: null,
            },
          };
        } catch (error) {
          console.error('ENS resolution failed for', address, error);
          return {
            address,
            data: {
              name: null,
              avatar: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          };
        }
      });

      const results = await Promise.all(promises);

      if (!isCancelled) {
        const finalEnsDataMap: Record<string, EnsData> = {};
        results.forEach(({ address, data }) => {
          finalEnsDataMap[address] = data;
        });
        setEnsDataMap(finalEnsDataMap);
      }
    };

    resolveMultipleEns();

    return () => {
      isCancelled = true;
    };
  }, [addresses.join(',')]); // Re-run when addresses change

  return ensDataMap;
}
