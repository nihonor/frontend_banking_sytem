import Image from "next/image";
import React from "react";

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a3977]">
      <Image src="/bk.png" alt="logo" width={250} height={300} className="animate-pulse"/>
    </div>
  );
};

export default LoadingPage;
