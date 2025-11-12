import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Map, Radio, Crosshair, Settings, Navigation } from 'lucide-react';

const FPVSimulator = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Drone state
  const [drone, setDrone] = useState({
    x: 0, y: 50, z: 0,
    vx: 0, vy: 0, vz: 0,
    pitch: 0, roll: 0, yaw: 0,
    throttle: 0,
    armed: false
  });
  
  const [camera, setCamera] = useState({ pitch: 0, distance: 100 });
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('manual'); // manual, auto, rtl
  const [view, setView] = useState('fpv'); // fpv, chase, map
  const [waypoints, setWaypoints] = useState([]);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [telemetry, setTelemetry] = useState({
    altitude: 50,
    speed: 0,
    battery: 100,
    satellites: 12,
    distance: 0
  });
  
  // Keyboard controls
  const keysPressed = useRef({});
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      
      if (e.key === ' ') {
        e.preventDefault();
        setDrone(prev => ({ ...prev, armed: !prev.armed }));
      }
    };
    
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Physics and control loop
  useEffect(() => {
    if (!isRunning || !drone.armed) return;
    
    const dt = 1/60;
    
    const update = () => {
      setDrone(prev => {
        let newState = { ...prev };
        const keys = keysPressed.current;
        
        if (mode === 'manual') {
          // Manual controls
          if (keys['w']) newState.pitch = Math.max(newState.pitch - 2, -30);
          if (keys['s']) newState.pitch = Math.min(newState.pitch + 2, 30);
          if (keys['a']) newState.roll = Math.max(newState.roll - 2, -30);
          if (keys['d']) newState.roll = Math.min(newState.roll + 2, 30);
          if (keys['q']) newState.yaw -= 2;
          if (keys['e']) newState.yaw += 2;
          if (keys['arrowup']) newState.throttle = Math.min(newState.throttle + 0.05, 1);
          if (keys['arrowdown']) newState.throttle = Math.max(newState.throttle - 0.05, 0);
          
          // Stabilization
          newState.pitch *= 0.95;
          newState.roll *= 0.95;
        } else if (mode === 'auto' && waypoints.length > 0) {
          // Auto mode - fly to waypoints
          const wp = waypoints[currentWaypoint];
          const dx = wp.x - newState.x;
          const dz = wp.z - newState.z;
          const dy = wp.y - newState.y;
          const dist = Math.sqrt(dx*dx + dz*dz);
          
          if (dist < 10) {
            setCurrentWaypoint(prev => (prev + 1) % waypoints.length);
          } else {
            const targetYaw = Math.atan2(dx, dz) * 180 / Math.PI;
            const yawDiff = ((targetYaw - newState.yaw + 540) % 360) - 180;
            newState.yaw += yawDiff * 0.05;
            
            newState.pitch = Math.max(Math.min(-dy * 0.5, 20), -20);
            newState.roll = Math.max(Math.min(yawDiff * 0.3, 20), -20);
            newState.throttle = 0.6;
          }
        }
        
        // Physics
        const pitchRad = newState.pitch * Math.PI / 180;
        const rollRad = newState.roll * Math.PI / 180;
        const yawRad = newState.yaw * Math.PI / 180;
        
        const thrust = newState.throttle * 15;
        const gravity = -9.8;
        
        newState.vy += (thrust + gravity) * dt;
        newState.vx += Math.sin(rollRad) * thrust * 0.3 * dt;
        newState.vz += Math.cos(pitchRad) * thrust * 0.3 * dt;
        
        // Rotate velocities by yaw
        const vxRot = newState.vx * Math.cos(yawRad) - newState.vz * Math.sin(yawRad);
        const vzRot = newState.vx * Math.sin(yawRad) + newState.vz * Math.cos(yawRad);
        
        newState.x += vxRot * dt;
        newState.y += newState.vy * dt;
        newState.z += vzRot * dt;
        
        // Drag
        newState.vx *= 0.98;
        newState.vy *= 0.98;
        newState.vz *= 0.98;
        
        // Ground collision
        if (newState.y < 0) {
          newState.y = 0;
          newState.vy = 0;
          newState.throttle = 0;
        }
        
        return newState;
      });
      
      // Update telemetry
      setTelemetry(prev => ({
        altitude: Math.round(drone.y),
        speed: Math.round(Math.sqrt(drone.vx**2 + drone.vy**2 + drone.vz**2) * 10) / 10,
        battery: Math.max(0, prev.battery - 0.01),
        satellites: 12,
        distance: Math.round(Math.sqrt(drone.x**2 + drone.z**2))
      }));
      
      animationRef.current = requestAnimationFrame(update);
    };
    
    update();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, drone.armed, mode, waypoints, currentWaypoint]);
  
  // Render 3D view
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    const render = () => {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, w, h);
      
      if (view === 'fpv') {
        // FPV view
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, h/2, w, h/2);
        
        // Horizon line
        const horizonOffset = drone.pitch * 5;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h/2 + horizonOffset);
        ctx.lineTo(w, h/2 + horizonOffset);
        ctx.stroke();
        
        // Crosshair
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w/2 - 30, h/2);
        ctx.lineTo(w/2 + 30, h/2);
        ctx.moveTo(w/2, h/2 - 30);
        ctx.lineTo(w/2, h/2 + 30);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(w/2, h/2, 50, 0, Math.PI * 2);
        ctx.stroke();
        
      } else if (view === 'chase') {
        // Chase camera view
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, h - 100, w, 100);
        
        // Draw drone
        ctx.save();
        ctx.translate(w/2, h/2);
        
        const scale = 5;
        const droneY = -drone.y * scale + 200;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-10, droneY - 10, 20, 20);
        
        // Draw waypoints
        waypoints.forEach((wp, i) => {
          const wpX = (wp.x - drone.x) * scale;
          const wpY = -wp.y * scale + 200;
          const wpZ = (wp.z - drone.z) * scale;
          
          ctx.fillStyle = i === currentWaypoint ? '#00ff00' : '#ffff00';
          ctx.beginPath();
          ctx.arc(wpX, wpY + wpZ * 0.5, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        
        ctx.restore();
        
      } else if (view === 'map') {
        // Top-down map view
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, 0, w, h);
        
        // Grid
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 50) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, h);
          ctx.stroke();
        }
        for (let i = 0; i < h; i += 50) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(w, i);
          ctx.stroke();
        }
        
        ctx.save();
        ctx.translate(w/2, h/2);
        
        const scale = 2;
        
        // Draw waypoints and path
        if (waypoints.length > 0) {
          ctx.strokeStyle = '#0000ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          waypoints.forEach((wp, i) => {
            const x = wp.x * scale;
            const y = wp.z * scale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          
          waypoints.forEach((wp, i) => {
            const x = wp.x * scale;
            const y = wp.z * scale;
            ctx.fillStyle = i === currentWaypoint ? '#00ff00' : '#ffff00';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillText((i + 1).toString(), x - 3, y + 4);
          });
        }
        
        // Draw drone
        const droneX = drone.x * scale;
        const droneZ = drone.z * scale;
        
        ctx.save();
        ctx.translate(droneX, droneZ);
        ctx.rotate(drone.yaw * Math.PI / 180);
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-10, 10);
        ctx.lineTo(10, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        ctx.restore();
      }
      
      requestAnimationFrame(render);
    };
    
    render();
  }, [drone, view, waypoints, currentWaypoint]);
  
  const addWaypoint = () => {
    setWaypoints(prev => [...prev, {
      x: drone.x + Math.random() * 100 - 50,
      y: 50 + Math.random() * 50,
      z: drone.z + Math.random() * 100 - 50
    }]);
  };
  
  const reset = () => {
    setDrone({
      x: 0, y: 50, z: 0,
      vx: 0, vy: 0, vz: 0,
      pitch: 0, roll: 0, yaw: 0,
      throttle: 0,
      armed: false
    });
    setTelemetry(prev => ({ ...prev, battery: 100 }));
    setCurrentWaypoint(0);
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Control Bar */}
      <div className="bg-gray-800 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('fpv')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${view === 'fpv' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            <Crosshair size={16} />
            FPV
          </button>
          <button
            onClick={() => setView('chase')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${view === 'chase' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            <Radio size={16} />
            Chase
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${view === 'map' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            <Map size={16} />
            Map
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-2 rounded ${mode === 'manual' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('auto')}
            className={`px-3 py-2 rounded ${mode === 'auto' ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}`}
            disabled={waypoints.length === 0}
          >
            Auto
          </button>
          <button
            onClick={addWaypoint}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded flex items-center gap-2"
          >
            <Navigation size={16} />
            Add Waypoint
          </button>
        </div>
      </div>
      
      {/* Main Display */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className="w-full h-full"
          />
          
          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-4 rounded">
            <div className="space-y-1 font-mono text-sm">
              <div className={`text-lg font-bold ${drone.armed ? 'text-green-400' : 'text-red-400'}`}>
                {drone.armed ? '● ARMED' : '○ DISARMED'}
              </div>
              <div>MODE: <span className="text-yellow-400">{mode.toUpperCase()}</span></div>
              <div>ALT: <span className="text-green-400">{telemetry.altitude}m</span></div>
              <div>SPD: <span className="text-green-400">{telemetry.speed}m/s</span></div>
              <div>DIST: <span className="text-green-400">{telemetry.distance}m</span></div>
              <div>BAT: <span className={telemetry.battery > 20 ? 'text-green-400' : 'text-red-400'}>{Math.round(telemetry.battery)}%</span></div>
              <div>SAT: <span className="text-green-400">{telemetry.satellites}</span></div>
            </div>
          </div>
          
          {/* Attitude Indicator */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 p-4 rounded">
            <div className="space-y-1 font-mono text-sm">
              <div>PITCH: <span className="text-cyan-400">{Math.round(drone.pitch)}°</span></div>
              <div>ROLL: <span className="text-cyan-400">{Math.round(drone.roll)}°</span></div>
              <div>YAW: <span className="text-cyan-400">{Math.round(drone.yaw)}°</span></div>
              <div>THROT: <span className="text-orange-400">{Math.round(drone.throttle * 100)}%</span></div>
            </div>
          </div>
        </div>
        
        {/* Mission Planner Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings size={20} />
            Mission Planner
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Waypoints ({waypoints.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {waypoints.map((wp, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm ${i === currentWaypoint ? 'bg-green-600' : 'bg-gray-700'}`}
                  >
                    <div className="font-bold">WP {i + 1}</div>
                    <div className="text-xs">
                      X: {Math.round(wp.x)}m, Y: {Math.round(wp.y)}m, Z: {Math.round(wp.z)}m
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setWaypoints([])}
                className="mt-2 w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                disabled={waypoints.length === 0}
              >
                Clear All
              </button>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Controls</h3>
              <div className="text-xs space-y-1 bg-gray-700 p-2 rounded">
                <div><kbd className="bg-gray-600 px-1 rounded">Space</kbd> Arm/Disarm</div>
                <div><kbd className="bg-gray-600 px-1 rounded">↑/↓</kbd> Throttle</div>
                <div><kbd className="bg-gray-600 px-1 rounded">W/S</kbd> Pitch</div>
                <div><kbd className="bg-gray-600 px-1 rounded">A/D</kbd> Roll</div>
                <div><kbd className="bg-gray-600 px-1 rounded">Q/E</kbd> Yaw</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Position</h3>
              <div className="text-sm bg-gray-700 p-2 rounded space-y-1">
                <div>X: {Math.round(drone.x)}m</div>
                <div>Y: {Math.round(drone.y)}m</div>
                <div>Z: {Math.round(drone.z)}m</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FPVSimulator;