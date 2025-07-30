import React from 'react';
import LightRays from './LightRays';

const LightRaysBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        {/* Main light rays effect - White rays */}
        <div className="w-full h-full">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={1.0}
            lightSpread={0.8}
            rayLength={1.8}
            followMouse={true}
            mouseInfluence={0.12}
            noiseAmount={0.05}
            distortion={0.02}
            fadeDistance={1.2}
            className="opacity-30"
          />
        </div>
        
        {/* Secondary layer for depth - Light gray */}
        <div className="absolute inset-0 opacity-15">
          <LightRays
            raysOrigin="bottom-right"
            raysColor="#f3f4f6"
            raysSpeed={0.7}
            lightSpread={0.5}
            rayLength={1.2}
            followMouse={false}
            noiseAmount={0.08}
            distortion={0.03}
            fadeDistance={0.8}
          />
        </div>

        {/* Tertiary layer - Very subtle center rays */}
        <div className="absolute inset-0 opacity-10">
          <LightRays
            raysOrigin="left"
            raysColor="#e5e7eb"
            raysSpeed={1.3}
            lightSpread={1.2}
            rayLength={0.8}
            followMouse={false}
            noiseAmount={0.06}
            distortion={0.01}
            fadeDistance={0.6}
          />
        </div>

        {/* Ambient particles - White and gray tones */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${5 + Math.random() * 8}s`
            }}
          ></div>
        ))}

        {/* Additional smaller particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-0.5 h-0.5 bg-gray-300/15 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LightRaysBackground;
