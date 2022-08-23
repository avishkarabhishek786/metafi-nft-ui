import { useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceDetails from "./MarketplaceDetails";
import { writeContractFunction } from "./util";

const Customer = ({bspContract, loggedInAccount}) =>{
    console.log("loggedInAccount", loggedInAccount)
    const mint = async() =>{
        await bspContract.mint(ethers.utils.parseEther("1000"), {from: loggedInAccount})
    }
    return(
        <>
        <button onClick={mint}>Mint BSP</button>
        </>
    )
}

export default Customer;