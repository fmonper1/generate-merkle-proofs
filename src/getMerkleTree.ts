import { ethers } from 'ethers'
import { MerkleTree } from 'merkletreejs'

const DEFAULT_MERKLE_TREE_OPTIONS = { sortPairs: true }

export function generateLeaf(address: string): Buffer {
  const encodedData = ethers.utils
    .keccak256(
      ethers.utils.defaultAbiCoder.encode(['address'], [ethers.utils.getAddress(address)]),
    )
    .slice(2)
  return Buffer.from(encodedData, 'hex')
}

export function generateMerkleTree(allowlist: string[]): MerkleTree {
  return new MerkleTree(
    allowlist.map(generateLeaf),
    ethers.utils.keccak256,
    DEFAULT_MERKLE_TREE_OPTIONS,
  )
}

export const getMerkleProof = (
  tree: MerkleTree,
  address: string,
  index?: number,
): string[] => {
  const leaf = generateLeaf(address)
  return tree.getHexProof(leaf, index)
}

export const getEncodedMerkleProof = (
  tree: MerkleTree,
  address: string,
  allowlist: string[],
): string => {
  const index = allowlist.findIndex((a) => a === address)
  if (index < 0) {
    throw new Error(`${address} is not on the allowlist`)
  }
  return ethers.utils.defaultAbiCoder.encode(
    ['bytes32[]'],
    [getMerkleProof(tree, address, index)],
  )
}
