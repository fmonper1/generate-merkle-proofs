import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { generateMerkleTree, getMerkleProof } from './getMerkleTree';

const csvWriter = createObjectCsvWriter({
  path: path.resolve(__dirname, 'output_address_proofs.csv'),
  header: [
    { id: 'address', title: 'address' },
    { id: 'proof', title: 'proof' },
  ],
});

const fetchAllowlistAddresses = (filepath: string) => {
  const csvFilePath = path.resolve(__dirname, filepath);
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  const addresses = fileContent.split('\r\n').map((address) => address.trim());
  return addresses;
};

async function processAddresses() {
  const allowlist = fetchAllowlistAddresses('allowlist.final.qa.csv');
  const tree = generateMerkleTree(allowlist);

  console.log('total addresses: ', allowlist.length);
  console.log('root: ', tree.getHexRoot());
  console.log('...');

  console.log('starting batch');
  console.log('...');
  console.time(`program`);

  const data = [];
  try {
    for (let i = 0; i < allowlist.length; i += 1) {
      data.push({
        address: allowlist[i].toLowerCase(),
        proof: getMerkleProof(tree, allowlist[i]),
      });
    }
  } catch (e) {
    console.error(e);
  }
  console.timeEnd(`program`); //Prints something like that-> test: 11374.004ms
  await csvWriter.writeRecords(data);
}

processAddresses();
