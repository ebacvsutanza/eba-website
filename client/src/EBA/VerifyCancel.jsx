import React from 'react'
import { Link } from 'react-router-dom';

export default function VerifyCancel() {
  return (
    <div className="h-screen center-flex">
      <div className="p-5 rounded shadow-[0_0_5px_rgba(0,0,0,0.3)] text-center space-y-5">
        <p className="text-xl font-semibold">
          Your order has been successfully cancelled
        </p>

        <Link to="/" className='underline text-blue-500'>Go back to homepage</Link>
      </div>
    </div>
  );
}
