import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ethers } from "ethers";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import CreateMarketPlace from './component/CreateMarketPlace';
import MarketplaceDetails from './component/MarketplaceDetails';
import Customer from './component/Customer';
import { BooksNFT, BSPToken, Marketplace, Factory } from "./abi";

function App() {

    let [blockchainProvider, setBlockchainProvider] = useState(undefined);
    let [metamask, setMetamask] = useState(undefined);
    let [metamaskNetwork, setMetamaskNetwork] = useState(undefined);
    let [metamaskSigner, setMetamaskSigner] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);

    const [nftContract, setNFTContract] = useState(undefined);
    const [bspContract, setBSPContract] = useState(undefined);
    const [mktContract, setMktContract] = useState(undefined);
    const [factoryContract, setFactoryContract] = useState(undefined);
   
    const [etherBalance, setEtherBalance] = useState(undefined);
    const [bspTokenBalance, setBSPTokenBalance] = useState(undefined);
    const [purchasedBooks, setPurchasedBooks] = useState([]);

    const [isError, setError] = useState(false);

    let alertMessage ;

    const connect = async () => {
        try {
            let provider, network, metamaskProvider, signer, accounts;

            if (typeof window.ethereum !== 'undefined') {
                // Connect to RPC  
                console.log('loadNetwork')
                try {
                    //window.ethereum.enable();
                    //await handleAccountsChanged();
                    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    await handleAccountsChanged(accounts);
                } catch (err) {
                    if (err.code === 4001) {
                        // EIP-1193 userRejectedRequest error
                        // If this happens, the user rejected the connection request.
                        console.log('Please connect to MetaMask.');
                    } else {
                        console.error(err);
                    }
                }
                provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/SUZg8eLJKsSOQePMY795lwhLd71Ye47q`)
                //provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/09dc2ddad4014a219f84c8125b0ab7cc`)
                //provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
                
                setBlockchainProvider(provider);
                network = await provider.getNetwork()
                
                setNetworkId(network.chainId);

                // Connect to Metamask  
                metamaskProvider = new ethers.providers.Web3Provider(window.ethereum)
                setMetamask(metamaskProvider)

                signer = await metamaskProvider.getSigner(accounts[0])
                setMetamaskSigner(signer)

                metamaskNetwork = await metamaskProvider.getNetwork();
                setMetamaskNetwork(metamaskNetwork.chainId);

                if (network.chainId !== metamaskNetwork.chainId) {
                    alert("Your Metamask wallet is not connected to " + network.name);

                    setError("Metamask not connected to RPC network");
                }

            } else setError("Could not connect to any blockchain!!");

            return {
                provider, metamaskProvider, signer,
                network: network.chainId
            }

        } catch (e) {
            console.error(e);
            setError(e);
        }

    }

    const handleAccountsChanged = async (accounts) => {
        if (typeof accounts !== "string" || accounts.length < 1) {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        console.log("t1", accounts);
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            alert('Please connect to MetaMask.');
        } else if (accounts[0] !== loggedInAccount) {
            setAccounts(accounts[0]);
        }
    }

    useEffect(() => {
        const init = async () => {

            const { provider, metamaskProvider, signer, network } = await connect();

            const accounts = await metamaskProvider.listAccounts();
            setAccounts(accounts[0]);

            if (typeof accounts[0] == "string") {
                setEtherBalance(ethers.utils.formatEther(
                    (await metamaskProvider.getBalance(accounts[0])).toString()
                ));
            }

            // const nftContract = new ethers.Contract(
            //     BooksNFT.address[network],
            //     BooksNFT.abi,
            //     signer
            // )

            // setNFTContract(nftContract)

            const bspContract = new ethers.Contract(
                BSPToken.address[network],
                BSPToken.abi,
                signer
            )

            setBSPContract(bspContract)

            // const marketplaceContract = new ethers.Contract(
            //     Marketplace.address[network],
            //     Marketplace.abi,
            //     signer
            // )

            // setMktContract(marketplaceContract)

            const factoryContract = new ethers.Contract(
                Factory.address[network],
                Factory.abi,
                signer
            )

            setFactoryContract(factoryContract)


            // Set BSP tokens balance
            const BSPTokenbalance = await bspContract.balanceOf(accounts[0]);
            setBSPTokenBalance(Number(ethers.utils.formatEther(String(BSPTokenbalance))))

            // Set purchased books
            const allBooks = await factoryContract.getActiveBookSales()
            
            for(let i=0; i<allBooks.length; i++) {
                const thisBook = allBooks[i];
                console.log(thisBook);
            }
        }

        init();

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        window.ethereum.on('chainChanged', function (networkId) {
            // Time to reload your interface with the new networkId
            //window.location.reload();
            unsetStates();
        })

    }, []);

    useEffect(() => {
        (async () => {
            if (typeof metamask == 'object' && typeof metamask.getBalance == 'function'
                && typeof loggedInAccount == "string") {
                setEtherBalance(ethers.utils.formatEther(
                    (await metamask.getBalance(loggedInAccount)).toString()
                ));
                
            }
        })()
    }, [loggedInAccount]);

    const unsetStates = useCallback(() => {
        setBlockchainProvider(undefined);
        setMetamask(undefined);
        setMetamaskNetwork(undefined);
        setMetamaskSigner(undefined);
        setNetworkId(undefined);
        setAccounts(undefined);
        setEtherBalance(undefined);
        setBSPTokenBalance(undefined);
        setPurchasedBooks([]);
    }, []);

    const isReady = useCallback(() => {

        return (
            typeof blockchainProvider !== 'undefined'
            && typeof metamask !== 'undefined'
            && typeof metamaskNetwork !== 'undefined'
            && typeof metamaskSigner !== 'undefined'
            && typeof networkId !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof nftContract !== 'undefined'
            && typeof bspContract !== 'undefined'
            && typeof mktContract !== 'undefined'
            && typeof factoryContract !== 'undefined'
            && typeof etherBalance !== 'undefined'
            && typeof bspTokenBalance !== 'undefined'
            && typeof purchasedBooks !== 'undefined'
        );
    }, [
        blockchainProvider,
        metamask,
        metamaskNetwork,
        metamaskSigner,
        networkId,
        loggedInAccount,
        nftContract,
        bspContract,
        mktContract,
        factoryContract,
        etherBalance,
        bspTokenBalance,
        purchasedBooks
    ]);

  return (
    <div className="App">
        <BrowserRouter>
            <Routes>
                <Route exact path="/" 
                    element={<CreateMarketPlace bspContract = {bspContract} factoryContract = {factoryContract} nftContract = {nftContract} loggedInAccount={loggedInAccount}/>}> 
                </Route>
                {/* <Route  path="/marketplace" 
                    element={<MarketplaceDetails bspContract = {bspContract} factoryContract = {factoryContract} nftContract = {nftContract} />}> 
                </Route>
                <Route  path="/customer" 
                    element={<Customer bspContract = {bspContract} factoryContract = {factoryContract} nftContract = {nftContract} loggedInAccount={loggedInAccount}/>}> 
                </Route> */}
                
            </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
