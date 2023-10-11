"use client";
import React from "react";
import { connectWallet, getPoolDetails } from "@/utils";
import { useEffect } from "react";
function Page() {
  const getPoolHelper = async () => {
    await getPoolDetails();
  };
  // const conn = connectWallet();
  useEffect(() => {
    getPoolHelper();
  }, []);

  return <div>Page</div>;
}

export default Page;
