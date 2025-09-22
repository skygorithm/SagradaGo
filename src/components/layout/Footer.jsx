import React from "react";

const Footer = () => (
  <footer className="bg-gradient-to-b from-white to-gray-50 text-black py-12 px-4">
    <div className="max-w-7xl mx-auto text-center md:text-left">
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <img src="/images/sagrada.png" alt="Logo" className="h-12 w-auto" />
          <div>
            <h2 className="text-2xl font-bold text-[#6B5F32]">SagradaGo</h2>
            <p className="text-gray-600 text-sm">
              A digital gateway to Sagrada Familia Parish.
            </p>
          </div>
        </div>
        <a
          className="bg-[#6B5F32] p-3 rounded-full hover:bg-[#d1c5a8]"
          href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
          </svg>
        </a>
      </div>
      <p className="text-gray-500 text-sm">
        © 2025 Sagrada Familia Parish. All rights reserved. Built by Group 2 – Sagrada Go Capstone Team
      </p>
    </div>
  </footer>
);

export default Footer;