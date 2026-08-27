import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-[#6E6E73] uppercase mb-3">
        404
      </p>
      <h1 className="text-3xl font-bold text-[#1D1D1F] sm:text-4xl mb-3">
        Page not found
      </h1>
      <p className="text-[#6E6E73] max-w-md mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="bg-[#0A2540] text-white font-medium py-3 px-8 rounded-full hover:bg-[#003852] transition-all duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
}