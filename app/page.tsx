"use client"
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Rocket, Moon, Sparkles, DollarSign } from 'lucide-react';
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

      setMessage(`🚀 TO THE MOON! Token created successfully! 🌕`);
      setContractInfo({ txid });
      
      setTimeout(async () => {
        const info = await checkTokenBalance(txid);
        setAssetInfo(info);
      }, 5000);

    } catch (error) {
      setMessage(`😢 Wen moon? Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!contractInfo?.txid) {
      setMessage('🤔 Ser, you need to create a token first!');
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
      setMessage(`🎉 WAGMI! Tokens minted successfully! 💎🙌, Transaction ID: ${txid}`);

      const info = await checkTokenBalance(contractInfo.txid);
      setAssetInfo(info);

    } catch (error) {
      setMessage(`😭 NGMI: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-b from-purple-100 to-pink-100">
      <Card className="mb-6 border-4 border-yellow-400 bg-white shadow-xl">
        <CardHeader className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
          <CardTitle className="flex items-center gap-2 text-white text-3xl font-bold">
            <Moon className="h-8 w-8 animate-pulse" />
            Meme Token Moon Machine
            <Sparkles className="h-8 w-8 animate-bounce" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-xl font-bold text-purple-600">🚀 Wen Moon? Now Moon! 🌕</p>
            <p className="text-sm text-gray-600">Not financial advice. DYOR. NFA.</p>
          </div>

          <form onSubmit={createToken} className="space-y-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <label className="block text-sm font-bold text-purple-600 mb-1">
                🔑 Secret Keys Ser (WIF)
              </label>
              <input
                type="password"
                name="wif"
                className="w-full p-3 border-2 border-yellow-400 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                value={formData.wif}
                onChange={handleInputChange}
                placeholder="Your super secret key (trust me bro)"
                required
              />
              <p className="text-sm text-purple-600 mt-1">
                🎁 Get test coins: https://dev.glittr.fi/
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-600 mb-1">
                  🏷️ Token Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 border-2 border-yellow-400 rounded-lg"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="SafeElonDogeMoon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-600 mb-1">
                  💎 Token Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  className="w-full p-3 border-2 border-yellow-400 rounded-lg"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="$SEDM"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-600 mb-1">
                📝 Memescription
              </label>
              <textarea
                name="description"
                className="w-full p-3 border-2 border-yellow-400 rounded-lg"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="100x guaranteed! To the moon! 🚀 (NFA)"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-600 mb-1">
                🖼️ Meme URL
              </label>
              <input
                type="url"
                name="memeUrl"
                className="w-full p-3 border-2 border-yellow-400 rounded-lg"
                value={formData.memeUrl}
                onChange={handleInputChange}
                placeholder="Drop your dankest meme URL"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-bold text-purple-600 mb-1">
                  💰 Total Supply
                </label>
                <input
                  type="number"
                  name="totalSupply"
                  className="w-full p-3 border-2 border-yellow-400 rounded-lg"
                  value={formData.totalSupply}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-600 mb-1">
                  🎁 Amount Per Mint
                </label>
                <input
                  type="number"
                  name="amountPerMint"
                  className="w-full p-3 border-2 border-yellow-400 rounded-lg"
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transform hover:scale-105 transition-transform font-bold text-lg"
                disabled={loading}
              >
                <Rocket className="h-6 w-6 animate-bounce" />
                {loading ? 'Launching...' : 'LFG! 🚀'}
              </button>

              {contractInfo?.txid && (
                <button
                  type="button"
                  onClick={handleMint}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 transform hover:scale-105 transition-transform font-bold text-lg"
                  disabled={loading}
                >
                  <DollarSign className="h-6 w-6 animate-pulse" />
                  {loading ? 'Minting...' : 'Print Money! 🖨️'}
                </button>
              )}
            </div>
          </form>

          {message && (
            <Alert className="mt-6 border-2 border-yellow-400 bg-gradient-to-r from-purple-100 to-pink-100">
              <AlertDescription className="text-center font-bold text-lg">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {contractInfo?.txid && (
            <Alert className="mt-6 border-2 border-yellow-400">
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-bold text-purple-600">🎯 Contract TX ID:</div>
                  <div className="break-all bg-gray-100 p-2 rounded">{contractInfo.txid}</div>
                  <div className="mt-4">
                    <a 
                      href={`https://hackathon-explorer.glittr.fi/tx/${contractInfo.txid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-bold flex items-center gap-2"
                    >
                      🔍 View on Explorer
                    </a>
                  </div>
                  {assetInfo && (
                    <div className="mt-4">
                      <div className="font-bold text-purple-600">💎 Asset Info:</div>
                      <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto">
                        {assetInfo}
                      </pre>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemeTokenGenerator;