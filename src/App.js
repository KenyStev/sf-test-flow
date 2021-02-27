import React, { useState, useEffect } from 'react';
import './App.css';
import SuperfluidSDK from '@superfluid-finance/js-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { defaultAbiCoder } from '@ethersproject/abi';

function App() {
  const [token, setToken] = useState('0x8ae68021f6170e5a766be613cea0d75236ecca9a');
  const [currentAddress, setCurrentAddress] = useState('');
  const [recipient, setRecipient] = useState('0x42D68d4E81087e43e70f6fd56bE4EE356Da3a3aC');
  const [flowRate, setFlowRate] = useState('385802469135802');

  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ['fDAI']
  });

  useEffect(() => {
    getWallet().then(() => {
      console.log('--> currentAddress: ', currentAddress);
    });
  }, []);

  function getFlowRate() {
    return Math.round((flowRate * 2592000) / 1e18);
  }

  function setFormattedFlowRate(_flowRate) {
    setFlowRate(((_flowRate * 1e18) / 2592000).toFixed(0));
  }

  async function getWallet() {
    const walletAddress = await window.ethereum.request({
      method: 'eth_requestAccounts',
      params: [
        {
          eth_accounts: {}
        }
      ]
    });

    setCurrentAddress(walletAddress[0]);
  }

  const initSF = async () => {
    console.log('--> sf: ', sf);

    await sf.initialize();

    console.log('--> sf.tokens.fDAIx.address: ', sf.tokens.fDAIx.address);

    setToken(sf.tokens.fDAIx.address);
  }

  const sendFlow = async () => {
    await initSF()
    const currentUser = sf.user({
      address: currentAddress,
      token: sf.tokens.fDAIx.address
    });

    console.log('--> currentUser: ', currentUser);

    await currentUser.flow({
      recipient,
      flowRate,
      userData: defaultAbiCoder.encode(['string'], ['SUPERFLUID ROCKS']),
      onTransaction: hash => {
        console.log('--> hash: ', hash);
      }
    });

    const details = await currentUser.details();
    console.log('--> details: ', details);
  }

  console.log('--> recipient: ', recipient);

  return (
    <div className='App'>
      <header className='App-header'>
        <img src='https://app.superfluid.finance/static/media/tetris_streaming.ae7c4d93.gif' className='App-logo' alt='SuperFluid logo' />
        <div className='input-group'>
          <label htmlFor='senderAddress' className='input-label'>Sender:</label>
          <input
            className='input-field'
            name='senderAddress'
            disabled
            value={currentAddress}
          />
        </div>
        <div className='input-group'>
          <label htmlFor='recipientAddress' className='input-label'>Recipient:</label>
          <input
            className='input-field'
            name='recipientAddress'
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
        </div>
        <div className='input-group'>
          <label htmlFor='flowRate' className='input-label'>Monthly flow:</label>
          <input
            type='number'
            className='input-field'
            name='flowRate'
            value={getFlowRate()}
            onChange={e => setFormattedFlowRate(Number(e.target.value))}
          />
        </div>
        <a
          className='App-link'
          href='#'
          onClick={sendFlow}
        >
          Start Sending Flow
        </a>
      </header>
    </div>
  );
}

export default App;
