import { useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceDetails from "./MarketplaceDetails";
import { writeContractFunction } from "./util";
import { clearConfigCache } from "prettier";

const CreateMarketPlace = ({bspContract = {}, factoryContract, loggedInAccount}) =>{
const [marketData, setMarketData] = useState(),
 [marketplaceData, setMarketPlaceData] = useState([]),
 [marketplacView, setMarketPlaceView] = useState(),
onchange = (e) =>{
    const {name, value} = e.target;
    setMarketData({...marketData, [name]:value});
},
launchMarketPlace = async() =>{
    const {book_name, book_symbol, book_price} = marketData;
    const book = await factoryContract.launchNewBook(
        bspContract.address,
        book_name,
        book_symbol,
        ethers.utils.parseEther(book_price)
    )
    getMarketPlaceData();
},
getMarketPlaceData =async()=>{
    const data = await factoryContract.getActiveBookSales();
    const mData = [];
    data.forEach(async(item, index)=>{
        console.log(item, index);
            const details = {};
            const bookData = await factoryContract.getBookDetails(item);
            details.bookData = bookData;
            details.bookSaleAddress = item;
            mData.push(details);
            if(index+1 === data.length){
                setMarketPlaceData(mData)

            }


    })
  
  
},
bulkMintBookCopies = async(details) =>{
    
    setMarketPlaceView(details)

   
}

useEffect(()=>{
    console.log("factoryContract", factoryContract);
    factoryContract && getMarketPlaceData();
}, [factoryContract])

console.log("marketplacView", marketplacView);

    return(
        <>
     { !marketplacView ?
        <div className="width-100">
            <div className="formWrapper">
            <h2  className="text-left">Launch Marketplace and Book</h2>
                <label>BSP Token Address</label>
                <input name="address" value={ bspContract.address} disabled/>

                <label>Book Name</label>
                <input name="book_name" onChange={onchange}/>

                <label>Book Symbol</label>
                <input name="book_symbol" onChange={onchange}/>

                <label>Book Price</label>
                <input name="book_price" onChange={onchange}/>

                <button onClick={launchMarketPlace}>Launch Marketplace</button>
            </div>
            <div className="formWrapper">
                <h2 className="text-left">Marketplace List</h2>
                <div className="text-left">
                    {console.log(marketplaceData)}
                    {
                        marketplaceData.length && marketplaceData.map((item, index)=>(
                            <p>{index+1}. {item.bookData[0]} <button onClick={()=>{bulkMintBookCopies(item)}}>View</button></p>
                        ))
                    }
                </div>
            </div>
        </div>
        :
         <MarketplaceDetails bspContract = {bspContract} marketplacView = {marketplacView} loggedInAccount={loggedInAccount}/>
    }
        </>
    )
}

export default CreateMarketPlace;