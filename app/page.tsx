"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Rocket, Coins } from 'lucide-react';
import { Account } from "@glittr-sdk/sdk";
import { createMemeToken, mintMemeTokens, checkTokenBalance } from '../app/lib/contracts';

const MemeTokenGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    memeUrl: '',
    totalSupply: 1000000,
    amountPerMint: 1000,
    wif: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [contractInfo, setContractInfo] = useState<{
    txid: string;
    blockHeight?: number;
  } | null>(null);
  const [assetInfo, setAssetInfo] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createToken = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const account = new Account({
        wif: formData.wif,
        network: "regtest"
      });

      const txid = await createMemeToken(account, {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        memeUrl: formData.memeUrl,
        totalSupply: formData.totalSupply,
        amountPerMint: formData.amountPerMint
      });

      setMessage(`Token created successfully! Transaction ID: ${txid}`);
      setContractInfo({ txid }); // Store contract info for minting
      
      // Wait a moment then check asset info
      setTimeout(async () => {
        const info = await checkTokenBalance(txid);
        setAssetInfo(info);
      }, 5000);

    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!contractInfo?.txid) {
      setMessage('Please create a token first');
      return;
    }

    setLoading(true);
    try {
      const account = new Account({
        wif: formData.wif,
        network: "regtest"
      });

      // Use block height if available, otherwise default to latest
      const blockTxTuple: [number, number] = [
        contractInfo.blockHeight || 101832, 
        1
      ];

      const txid = await mintMemeTokens(account, blockTxTuple);
      setMessage(`Tokens minted successfully! Transaction ID: ${txid}`);

      // Update asset info after minting
      const info = await checkTokenBalance(contractInfo.txid);
      setAssetInfo(info);

    } catch (error) {
      setMessage(`Error minting tokens: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6" />
            Meme Token Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bitcoin Private Key (WIF)</label>
              <input
                type="password"
                name="wif"
                className="w-full p-2 border rounded"
                value={formData.wif}
                onChange={handleInputChange}
                placeholder="Enter your WIF"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Get test Bitcoin from: https://dev.glittr.fi/
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Token Name</label>
              <input
                type="text"
                name="name"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., DogeMoon"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Token Symbol</label>
              <input
                type="text"
                name="symbol"
                className="w-full p-2 border rounded"
                value={formData.symbol}
                onChange={handleInputChange}
                placeholder="e.g., DGMN"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                className="w-full p-2 border rounded"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your meme token..."
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meme Image URL</label>
              <input
                type="url"
                name="memeUrl"
                className="w-full p-2 border rounded"
                value={formData.memeUrl}
                onChange={handleInputChange}
                placeholder="https://your-meme-image.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Supply</label>
                <input
                  type="number"
                  name="totalSupply"
                  className="w-full p-2 border rounded"
                  value={formData.totalSupply}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount Per Mint</label>
                <input
                  type="number"
                  name="amountPerMint"
                  className="w-full p-2 border rounded"
                  value={formData.amountPerMint}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                <Rocket className="h-5 w-5" />
                {loading ? 'Creating Token...' : 'Launch Token'}
              </button>

              {contractInfo?.txid && (
                <button
                  type="button"
                  onClick={handleMint}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  <Coins className="h-5 w-5" />
                  {loading ? 'Minting...' : 'Mint Tokens'}
                </button>
              )}
            </div>
          </form>

          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {contractInfo?.txid && (
            <Alert className="mt-4">
              <AlertDescription>
                <div>Contract Transaction ID: {contractInfo.txid}</div>
                <div className="mt-2">
                  Explorer Link:{' '}
                  <a 
                    href={`https://hackathon-explorer.glittr.fi/tx/${contractInfo.txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on Explorer
                  </a>
                </div>
                {assetInfo && (
                  <div className="mt-2">
                    <div className="font-semibold">Asset Info:</div>
                    <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                      {assetInfo}
                    </pre>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemeTokenGenerator;