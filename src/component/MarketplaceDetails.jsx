import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { writeContractFunction, writeContractMarketplace } from "./util";

const MarketplaceDetails = ({bspContract, marketplacView, loggedInAccount}) =>{
    const {bookData, bookSaleAddress} = marketplacView;
//console.log("marketplacView", marketplacView  )
const [copyData, setCopyData] = useState();
const [bookCount, setBookCount] = useState(0);
const [userBook, setUserBook] = useState();
const [userSellBook, setUserSellBook] = useState(),
onchange = (e) =>{
    const {name, value} = e.target;
    setCopyData({...copyData, [name]:value});
},
bulkMintBookCopies = async() =>{
    const bookContract = await writeContractFunction(bookSaleAddress);

    //console.log("", bookContract, "address", bookData[3], "copyData", copyData.copy_no, copyData.cupy_url);
    const copyUrl = copyData.cupy_url.split(",");
    if(copyData.copy_no != copyUrl.length){
        alert("Copy No and uri mismatch");
        return
    }
    const copyRes = await bookContract.bulkMintBookCopies(
        copyData.copy_no, 
        copyUrl,
        bookData[3]
    )

},
getBookCopyForSale = async() =>{
    const bookContract = await writeContractFunction(bookSaleAddress);
   
    const bookCounts = await bookContract.bookCounts();
    setBookCount(Number(bookCounts));
    const bookCustomerId = await bookContract.getBooksOfCustomer(loggedInAccount);
    const booksellId = await bookContract.getBookCopyForSale();
    const bookName = await bookContract.name();
    console.log("sellId", booksellId)
    const bookUri = await Promise.all(bookCustomerId.map(async(item)=>{
        const uri = await bookContract.tokenURI(item);

        return {uri, bookId:item}
    }))

    const bookUriSell = await Promise.all(booksellId.map(async(item)=>{
        const bookSellDetails = await bookContract.getBookSaleDetails(item);
        const uri = await bookContract.tokenURI(item);
        return {uri, bookSellDetails, bookId:item}
    }))

    setUserSellBook(bookUriSell);
    setUserBook(bookUri);
    
}


const mint = async() =>{
    await bspContract.mint(ethers.utils.parseEther("1000"), {from: loggedInAccount})
}


const approve = async() =>{
    
    await bspContract.approve(bookData[3], ethers.utils.parseEther("1000"), {from: loggedInAccount});
}

const buyBookFromMarketPlace = async() =>{
    const bookContract = await writeContractMarketplace(bookData[3]);
    const bookCounts = await bookContract.purchaseBook({from: loggedInAccount});
}

const sell = async(bookId)=>{
    let selling_price = prompt("Please enter selling price:");
    selling_price = String(Number(selling_price));

    if(!selling_price){
        alert("Price is mandatory!");
        return
    }
    const bookContract = await writeContractFunction(bookSaleAddress);
    const sellDetails = await bookContract.setSaleDetails(
        bookId,
        ethers.utils.parseEther(selling_price),
        bookData[3],
        {from : loggedInAccount}
    )

    console.log("sellDetails", sellDetails)
}

const secBuy = async(bookId) =>{
    const bookContract = await writeContractMarketplace(bookData[3]);
    console.log(String(bookId));
    console.log(bookContract);
    console.log(loggedInAccount);

    //console.log(await bookContract.estimateGas.secondaryPurchase(bookId), {from: loggedInAccount});

    await bookContract.secondaryPurchase(bookId, {
        from: loggedInAccount,
        gasLimit: ethers.BigNumber.from('30000000'),
        //gasPrice: ethers.BigNumber.from("8000000000")
    })
    //console.log("buyDetails", buyDetails);
}

useEffect(()=>{
    getBookCopyForSale()
}, [])

console.log("userBook", userBook, userSellBook)
    return(
        <>
     
        <div className="width-100">
            <div className="formWrapper">
            <h2  className="text-left">Add copy in {bookData[0]} ({bookData[1]})</h2>
               

                <label>No of Copy</label>
                <input name="copy_no" onChange={onchange}/>

                <label>url (use comma for multiple copy)</label>
                <input name="cupy_url" onChange={onchange}/>    

                <button onClick={bulkMintBookCopies}>Add Copy</button>
            </div>
            <div className="formWrapper">
                <h2 className="text-left"></h2>
                <div className="text-left">
                  Total No of Copy {bookCount}
                    <br />
                  <button onClick={mint}>Mint BSP</button>
        <button onClick={approve}>Approve</button>
        <button onClick={buyBookFromMarketPlace}>Buy Book from Marketplace</button>
                </div>
            </div>
        </div>
        <div className="text-left">
        <br/><br/>
            <h3>User Book</h3>
            {
                userBook ? userBook.map((item, index)=>(
                
                   <p style={{width:'100%'}}> <a href={item.uri}> <img src={item.uri} height="250px" alt={item.uri} /> </a> <br/> <span onClick={()=>{sell(item.bookId)}} style={{color:"blue", cursor: "pointer"}} >Set for Sell</span> </p>
               
                ))
                :
                <p>No any book found! please buy</p>
            }

        <h3>User Book for sell</h3>
            {
                userSellBook && userSellBook.map((item, index)=>(
               <>
               <p><a href={item.uri}> <img src={item.uri} height="250px" alt={item.uri} /> </a><br/> <button onClick={()=>{secBuy(item.bookId)}}>Buy for {ethers.utils.formatEther(String(item.bookSellDetails['sellingPrice']))} BSP</button></p>
               </>
               
                ))
            }


            
        </div>

        </>
    )
}

export default MarketplaceDetails;