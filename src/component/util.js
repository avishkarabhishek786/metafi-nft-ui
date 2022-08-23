
import { ethers } from 'ethers';
import { BooksNFT } from '../abi';
import { Marketplace } from '../abi';

const getMetaMask = () => {
	const providerMetaMask = new ethers.providers.Web3Provider(window.ethereum)
	return providerMetaMask
}



const writeContractFunction = async (bookSaleAddress) => {
	const mProviderInner = getMetaMask();
	const signer = await mProviderInner.getSigner()
    return new ethers.Contract(
		bookSaleAddress,
		BooksNFT.abi,
		signer
	)
}

const writeContractMarketplace = async (bookSaleAddress) => {
	const mProviderInner = getMetaMask();
	const signer = await mProviderInner.getSigner()
    return new ethers.Contract(
		bookSaleAddress,
		Marketplace.abi,
		signer
	)
}
export {writeContractFunction, writeContractMarketplace}