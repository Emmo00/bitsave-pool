import { createPublicClient, http, isAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

// Create a public client for ENS resolution on mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http() // Uses default public endpoints
})

export interface ResolvedENS {
  address: string
  ensName?: string
  avatar?: string
  displayName: string
}

export class ENSResolutionError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_FORMAT' | 'ENS_NOT_FOUND' | 'NETWORK_ERROR' | 'INVALID_ADDRESS' | 'UNKNOWN_ERROR'
  ) {
    super(message)
    this.name = 'ENSResolutionError'
  }
}

/**
 * Validates and resolves an ENS name or address
 * @param input - ENS name (e.g., "vitalik.eth") or Ethereum address (0x...)
 * @returns Promise<ResolvedENS> - Resolved data including address, ENS name, and avatar
 */
export async function resolveENSOrAddress(input: string): Promise<ResolvedENS> {
  const trimmedInput = input.trim()
  
  if (!trimmedInput) {
    throw new ENSResolutionError('Input cannot be empty', 'INVALID_FORMAT')
  }

  // Check if input is a valid Ethereum address
  if (isAddress(trimmedInput)) {
    try {
      // Try to get reverse ENS lookup for the address
      const ensName = await publicClient.getEnsName({
        address: trimmedInput as `0x${string}`
      })

      let avatar: string | undefined
      if (ensName) {
        // Get avatar for the resolved ENS name
        const avatarResult = await publicClient.getEnsAvatar({
          name: normalize(ensName)
        })
        avatar = avatarResult || undefined
      }

      return {
        address: trimmedInput,
        ensName: ensName || undefined,
        avatar: avatar || undefined,
        displayName: ensName || `${trimmedInput.slice(0, 6)}...${trimmedInput.slice(-4)}`
      }
    } catch (error) {
      // If reverse lookup fails, still return the address
      console.warn('Reverse ENS lookup failed:', error)
      return {
        address: trimmedInput,
        displayName: `${trimmedInput.slice(0, 6)}...${trimmedInput.slice(-4)}`
      }
    }
  }

  // Check if input looks like an ENS name
  if (trimmedInput.includes('.')) {
    try {
      const normalizedName = normalize(trimmedInput)
      
      // Resolve ENS name to address
      const address = await publicClient.getEnsAddress({
        name: normalizedName
      })

      if (!address) {
        throw new ENSResolutionError(
          `ENS name "${trimmedInput}" does not resolve to an address. Make sure it's a valid ENS name.`,
          'ENS_NOT_FOUND'
        )
      }

      // Get avatar for the ENS name
      let avatar: string | undefined
      try {
        const avatarResult = await publicClient.getEnsAvatar({
          name: normalizedName
        })
        avatar = avatarResult || undefined
      } catch (avatarError) {
        // Avatar resolution can fail, but we don't want to fail the whole operation
        console.warn('Failed to resolve avatar for ENS name:', avatarError)
      }

      return {
        address,
        ensName: trimmedInput,
        avatar: avatar || undefined,
        displayName: trimmedInput
      }
    } catch (error) {
      if (error instanceof ENSResolutionError) {
        throw error
      }
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new ENSResolutionError(
            'Network error while resolving ENS. Please check your connection and try again.',
            'NETWORK_ERROR'
          )
        }
        if (error.message.includes('invalid') || error.message.includes('malformed')) {
          throw new ENSResolutionError(
            `"${trimmedInput}" is not a valid ENS name format.`,
            'INVALID_FORMAT'
          )
        }
      }
      
      throw new ENSResolutionError(
        `Failed to resolve ENS name "${trimmedInput}". Please try again.`,
        'UNKNOWN_ERROR'
      )
    }
  }

  throw new ENSResolutionError(
    'Please enter a valid ENS name (e.g., vitalik.eth) or Ethereum address (0x...)',
    'INVALID_FORMAT'
  )
}

/**
 * Validates if a string is a valid ENS name format
 * @param input - String to validate
 * @returns boolean - True if valid ENS name format
 */
export function isValidENSName(input: string): boolean {
  const trimmedInput = input.trim()
  
  // Basic ENS name validation
  // Must contain a dot and end with a valid TLD
  const ensPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  
  return ensPattern.test(trimmedInput)
}

/**
 * Validates if a string is a valid Ethereum address format
 * @param input - String to validate
 * @returns boolean - True if valid Ethereum address format
 */
export function isValidEthereumAddress(input: string): boolean {
  return isAddress(input.trim())
}

/**
 * Generates a fallback avatar URL using a service like Gravatar or identicon
 * @param address - Ethereum address
 * @returns string - Avatar URL
 */
export function generateFallbackAvatar(address: string): string {
  // Using jazzicon-style identicon service
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=transparent`
}
