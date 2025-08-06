import React from 'react';
import { Pannellum } from 'pannellum-react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/ExploreParish.css';

const ExploreParish = () => {
  return (
    <div className="explore-parish">
      <div className="explore-header">
        <Link to="/home" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1>Virtual Tour of Sagrada Familia Parish</h1>
      </div>
      
      <div className="panorama-container">
        <Pannellum
          width="100%"
          height="100%"
          image={process.env.PUBLIC_URL + "/images/360altar.jpg"}
          pitch={0}
          yaw={0}
          hfov={110}
          autoLoad
          onLoad={() => {
            console.log("panorama loaded");
          }}
          hotspotDebug={false}
          compass={false}
          showFullscreenCtrl={true}
          showZoomCtrl={true}
          mouseZoom={true}
          draggable={true}
        />
      </div>

      <div className="explore-info">
        <h2>Welcome to Our Virtual Tour</h2>
        <p>
          Experience the beauty and serenity of Sagrada Familia Parish through our interactive 360° virtual tour.
          Take your time to explore the sacred space and discover its architectural wonders.
        </p>
        
        <div className="tour-tips">
          <h3>Tour Tips:</h3>
          <ul>
            <li>Click and drag to look around</li>
            <li>Use the mouse wheel to zoom in and out</li>
            <li>Click the fullscreen button for an immersive experience</li>
            <li>Take your time to appreciate the details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExploreParish; 