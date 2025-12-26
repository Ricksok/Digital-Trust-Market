import { ethers } from 'ethers';

/**
 * Verify wallet signature
 */
export const verifyWalletSignature = (
  address: string,
  message: string,
  signature: string
): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
};

/**
 * Generate a message for wallet signing
 */
export const generateWalletMessage = (address: string, nonce: string): string => {
  return `Please sign this message to connect your wallet to Digital Trust Marketplace.\n\nAddress: ${address}\nNonce: ${nonce}`;
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};


