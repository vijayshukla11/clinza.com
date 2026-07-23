import React from "react";

export const TopShippingBar: React.FC = () => {
  return (
    <div className="w-full bg-[#111111] text-white h-[40px] flex items-center justify-center text-[11px] font-sans font-semibold tracking-widest uppercase px-4 z-50 relative">
      <span>FREE SHIPPING ON ORDERS ABOVE ₹1499</span>
    </div>
  );
};

export default TopShippingBar;
