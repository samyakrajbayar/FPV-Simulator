# FPV Drone Simulator with Ground Control Station

A comprehensive First-Person View (FPV) drone flight simulator with integrated ground control station and mission planning capabilities. Built with React and HTML5 Canvas for realistic flight dynamics and autonomous navigation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Features

### 🚁 Flight Modes
- **Manual Mode** - Full manual control with gyroscopic stabilization
- **Auto Mode** - Autonomous waypoint-based navigation
- **Return to Launch (RTL)** - Planned feature for automatic return

### 📹 Camera Views
- **FPV View** - First-person perspective with artificial horizon and crosshair HUD
- **Chase Camera** - Third-person view following the drone
- **Map View** - Top-down tactical map with flight path visualization

### 🎮 Ground Control Station (GCS)
Real-time telemetry display including:
- Altitude (meters)
- Ground speed (m/s)
- Battery percentage with low-battery warning
- GPS satellite count
- Distance from home
- Armed/disarmed status
- Current flight mode

### 🗺️ Mission Planner
- Dynamic waypoint creation
- Visual waypoint list with coordinates
- Automatic waypoint sequencing
- Flight path preview on map
- Mission clear functionality
- Real-time waypoint tracking

### ⚙️ Realistic Physics Engine
- 6 Degrees of Freedom (6DOF) flight dynamics
- Gravity simulation (9.8 m/s²)
- Thrust vectoring based on attitude
- Aerodynamic drag modeling
- Ground collision detection
- Velocity-based inertial movement

## Controls

### Keyboard Controls
| Key | Function |
|-----|----------|
| `Space` | Arm/Disarm motors |
| `↑` | Increase throttle |
| `↓` | Decrease throttle |
| `W` | Pitch forward |
| `S` | Pitch backward |
| `A` | Roll left |
| `D` | Roll right |
| `Q` | Yaw left (rotate counter-clockwise) |
| `E` | Yaw right (rotate clockwise) |

### UI Controls
- **Start/Pause** - Begin or pause simulation
- **Reset** - Return drone to home position and reset telemetry
- **FPV/Chase/Map** - Switch between camera views
- **Manual/Auto** - Toggle flight modes
- **Add Waypoint** - Create new waypoint near current position
- **Clear All** - Remove all waypoints from mission

## Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Recommended: Physical keyboard for optimal control

### Installation
1. Copy the component code into your React application
2. Ensure you have the required dependencies:
   ```bash
   npm install react lucide-react
   ```
3. Import and use the component:
   ```jsx
   import FPVSimulator from './FPVSimulator';
   
   function App() {
     return <FPVSimulator />;
   }
   ```

### Quick Start Guide

#### First Flight (Manual Mode)
1. **Arm the drone** - Press `Space` to arm motors (indicator turns green)
2. **Take off** - Press and hold `↑` to increase throttle above 50%
3. **Stabilize** - Once airborne, adjust throttle to maintain altitude
4. **Navigate** - Use `W/A/S/D` for pitch and roll, `Q/E` for yaw
5. **Land** - Reduce throttle with `↓` until drone touches ground
6. **Disarm** - Press `Space` to disarm motors

#### Autonomous Mission (Auto Mode)
1. Fly manually or start from default position
2. Click **"Add Waypoint"** multiple times to create a flight path
3. Switch to **Map View** to see waypoint locations
4. Click **"Auto"** mode to begin autonomous navigation
5. Drone will automatically fly to each waypoint in sequence
6. Mission loops continuously until manual intervention

## Telemetry Reference

### HUD Elements
- **ARM Status** - Green (●) when armed, Red (○) when disarmed
- **MODE** - Current flight mode (MANUAL/AUTO)
- **ALT** - Altitude above ground level in meters
- **SPD** - Current ground speed in meters per second
- **DIST** - Horizontal distance from home position
- **BAT** - Battery remaining percentage (warning at <20%)
- **SAT** - GPS satellites visible (fixed at 12 for simulation)

### Attitude Indicators
- **PITCH** - Nose up (+) or down (-) angle in degrees
- **ROLL** - Left (-) or right (+) bank angle in degrees
- **YAW** - Compass heading in degrees (0-360)
- **THROT** - Throttle position as percentage (0-100%)

## Flight Tips

### Manual Flight
- Start with small control inputs to get a feel for the physics
- Throttle around 60% is typically needed to maintain hover
- The drone self-stabilizes pitch and roll when controls are released
- Watch your battery - it drains continuously during flight
- Use Map view to orient yourself and avoid getting lost

### Autonomous Missions
- Create waypoints in a logical sequence
- Waypoints appear yellow (pending) or green (active target)
- Ensure adequate battery for mission completion
- Switch to Manual mode anytime to regain control
- Monitor altitude on waypoint approach

### Advanced Techniques
- Practice figure-8 patterns in Manual mode
- Use yaw to rotate without translating
- Combine pitch and roll for diagonal movement
- Plan circular missions using multiple waypoints
- Use Chase camera to practice cinematic movements

## Technical Details

### Performance
- Simulation runs at 60 FPS (frames per second)
- Physics calculations use fixed timestep (1/60s)
- Canvas rendering optimized for smooth animation
- Minimal CPU usage (~5-10% on modern systems)

### Physics Constants
- Gravity: -9.8 m/s²
- Maximum pitch/roll: ±30°
- Drag coefficient: 0.98 per frame
- Thrust multiplier: 15x throttle
- Stabilization: 95% per frame

### Coordinate System
- X-axis: East/West (positive = East)
- Y-axis: Altitude (positive = Up)
- Z-axis: North/South (positive = North)
- Yaw: 0° = North, increases clockwise

## Troubleshooting

### Drone Won't Take Off
- Ensure motors are armed (press Space, look for green indicator)
- Increase throttle above 50% with arrow up key
- Check that simulation is running (click Start button)

### Unstable Flight
- Reduce control sensitivity by making smaller inputs
- Allow time for stabilization between maneuvers
- Ensure throttle is adequate (50-70% for hover)

### Auto Mode Not Working
- Create at least one waypoint first
- Ensure drone is armed
- Check that Auto button is highlighted in green
- Verify battery is not depleted

### Poor Performance
- Close unnecessary browser tabs
- Ensure hardware acceleration is enabled
- Try reducing browser zoom level
- Check system resources (CPU/GPU usage)

## Roadmap

### Planned Features
- [ ] Return to Launch (RTL) mode
- [ ] Altitude hold assistance in Manual mode
- [ ] Position hold (loiter) mode
- [ ] Camera gimbal control
- [ ] Wind simulation
- [ ] Multiple drone types (quadcopter, hexacopter)
- [ ] Crash detection and damage model
- [ ] Replay/recording functionality
- [ ] Customizable control sensitivity
- [ ] Virtual joystick for touchscreen devices
- [ ] Terrain elevation mapping
- [ ] Obstacles and collision avoidance
- [ ] Battery consumption based on throttle

## Contributing

Contributions are welcome! Areas for improvement:
- Enhanced physics modeling (prop wash, ground effect)
- More realistic aerodynamics
- Additional camera modes (orbit, follow terrain)
- Mission planning tools (survey patterns, inspection routes)
- Multiplayer support
- VR headset integration

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by professional GCS software (Mission Planner, QGroundControl)
- Physics engine inspired by real quadcopter dynamics
- Built with React and Lucide React icons

## Support

For issues, questions, or suggestions:
- Check the Troubleshooting section above
- Review control reference and flight tips
- Experiment with different flight modes and camera views

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Active Development

Happy Flying! 🚁
