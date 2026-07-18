import React from 'react';

export default function FloorPlan2D({
  plotWidth = 40,
  plotLength = 60,
  floors = 2,
  bedrooms = 3,
  bathrooms = 2,
  currentFloor = 0, // 0 for Ground, 1 for First
  style = 'Modern Villa',
  layoutOption = 'A', // 'A', 'B', 'C' matching options
  layoutData = null // Dynamic Gemini blueprint data
}) {
  // SVG size configuration
  const svgWidth = 500;
  const svgHeight = 400;
  const padding = 40;

  // Calculate scaling factors to fit the plot inside the SVG
  const scaleX = (svgWidth - padding * 2) / plotWidth;
  const scaleY = (svgHeight - padding * 2) / plotLength;
  const scale = Math.min(scaleX, scaleY);

  // Scaled dimensions
  const w = plotWidth * scale;
  const h = plotLength * scale;
  const px = (svgWidth - w) / 2;
  const py = (svgHeight - h) / 2;

  // House footprint (leaving setbacks)
  const setbackSide = Math.max(3, plotWidth * 0.1);
  const setbackFront = Math.max(5, plotLength * 0.12);
  const setbackBack = Math.max(4, plotLength * 0.1);

  const houseWidth = Math.max(15, plotWidth - setbackSide * 2);
  const houseHeight = Math.max(20, plotLength - setbackFront - setbackBack);

  const hw = houseWidth * scale;
  const hh = houseHeight * scale;
  const hx = px + setbackSide * scale;
  const hy = py + setbackBack * scale;

  const rooms = [];
  const walls = [];
  const doors = [];
  const windows = [];
  const furniture = []; // Detailed furniture layout

  const addWall = (x1, y1, x2, y2) => {
    walls.push({ x1: hx + x1 * scale, y1: hy + y1 * scale, x2: hx + x2 * scale, y2: hy + y2 * scale });
  };

  const addRoom = (label, rx, ry, rw, rh, type = 'room') => {
    rooms.push({
      label,
      x: hx + rx * scale,
      y: hy + ry * scale,
      w: rw * scale,
      h: rh * scale,
      widthFt: Math.round(rw),
      heightFt: Math.round(rh),
      type
    });
  };

  const addDoor = (dx, dy, angle, size = 3) => {
    doors.push({ x: hx + dx * scale, y: hy + dy * scale, size: size * scale, angle });
  };

  const addWindow = (wx, wy, wSize = 4, isVertical = false) => {
    windows.push({ x: hx + wx * scale, y: hy + wy * scale, size: wSize * scale, isVertical });
  };

  const addFurniture = (type, fx, fy, fw, fh, rotation = 0) => {
    furniture.push({ type, x: fx, y: fy, w: fw, h: fh, rotation });
  };

  // --- Dynamic Layout Options Subdivision & Furniture Population ---

  if (layoutData) {
    layoutData.rooms?.forEach(r => {
      if (r.floor == currentFloor) {
        addRoom(r.label, r.x - setbackSide, r.y - setbackBack, r.w, r.h, r.type);
      }
    });
    layoutData.walls?.forEach(w => {
      if (w.floor === undefined || w.floor == currentFloor) {
        addWall(w.x1 - setbackSide, w.y1 - setbackBack, w.x2 - setbackSide, w.y2 - setbackBack);
      }
    });
    layoutData.doors?.forEach(d => {
      if (d.floor === undefined || d.floor == currentFloor) {
        addDoor(d.x - setbackSide, d.y - setbackBack, d.angle, d.size);
      }
    });
    layoutData.windows?.forEach(w => {
      if (w.floor === undefined || w.floor == currentFloor) {
        addWindow(w.x - setbackSide, w.y - setbackBack, w.size, w.isVertical);
      }
    });
    layoutData.furniture?.forEach(f => {
      if (f.floor === undefined || f.floor == currentFloor) {
        addFurniture(f.type, f.x - setbackSide, f.y - setbackBack, f.w, f.h, f.rotation);
      }
    });
  } else {
    if (layoutOption === 'A') {
      // LAYOUT A: Modern Open Concept
      if (currentFloor === 0) {
        const splitY = houseHeight * 0.45;
        
        // Master Suite
        addRoom('Master Suite', 0, 0, houseWidth * 0.65, splitY, 'bedroom');
        addFurniture('bed', houseWidth * 0.32, splitY * 0.4, 6.5, 6.5, 0);
        
        // Bath
        addRoom('Attached Bath', houseWidth * 0.65, 0, houseWidth * 0.35, splitY * 0.6, 'bathroom');
        addFurniture('toilet', houseWidth * 0.75, splitY * 0.2, 2, 2.5, 180);
        addFurniture('sink', houseWidth * 0.9, splitY * 0.2, 2, 2, 180);
        
        addRoom('Entry Vestibule', houseWidth * 0.65, splitY * 0.6, houseWidth * 0.35, splitY * 0.4, 'utility');
        
        addWall(houseWidth * 0.65, 0, houseWidth * 0.65, splitY);
        addWall(houseWidth * 0.65, splitY * 0.6, houseWidth, splitY * 0.6);

        // Huge open-plan Lounge and Kitchen
        const livingH = houseHeight - splitY;
        addRoom('Open Lounge & Kitchen', 0, splitY, houseWidth, livingH, 'living');
        
        // Lounge sofa
        addFurniture('sofa', houseWidth * 0.3, splitY + livingH * 0.45, 9, 7.5, 0);
        
        // Kitchen counter
        addFurniture('kitchen', houseWidth * 0.8, splitY + livingH * 0.35, 3.5, 9, 90);
        
        // Dining table
        addFurniture('dining', houseWidth * 0.75, splitY + livingH * 0.75, 4.5, 6, 0);

        addWall(0, splitY, houseWidth, splitY);

        if (floors > 1) {
          addRoom('Staircase ➔', houseWidth - 6, splitY + 1, 5, 5, 'stairs');
          addWall(houseWidth - 6, splitY, houseWidth - 6, splitY + 6);
          addWall(houseWidth - 6, splitY + 6, houseWidth, splitY + 6);
        }

        addWall(houseWidth * 0.4, splitY + livingH * 0.4, houseWidth * 0.4, splitY + livingH * 0.9);

        // Doors & Windows
        addDoor(houseWidth * 0.3, houseHeight, 180, 4);
        addDoor(houseWidth * 0.65 - 3.5, splitY, 90, 3);
        addDoor(houseWidth * 0.65 + 0.5, splitY * 0.6, 0, 2.5);
        
        addWindow(houseWidth * 0.15, houseHeight, 6, false);
        addWindow(houseWidth * 0.7, houseHeight, 6, false);
        addWindow(0, splitY + livingH * 0.5, 6, true);
        addWindow(houseWidth * 0.3, 0, 5, false);
      } else {
        // First Floor Layout A
        const splitY = houseHeight * 0.5;
        
        addRoom('Luxe Guest Room', 0, 0, houseWidth * 0.5, splitY, 'bedroom');
        addFurniture('bed', houseWidth * 0.25, splitY * 0.45, 6.5, 6.5, 0);

        addRoom('Lounge/Gym', houseWidth * 0.5, 0, houseWidth * 0.5, splitY, 'living');
        addFurniture('sofa', houseWidth * 0.75, splitY * 0.45, 8, 4.5, 0);
        
        const balconyH = 5;
        addRoom('Sunset Glass Balcony', 0, houseHeight - balconyH, houseWidth, balconyH, 'balcony');
        
        addRoom('Kids Bedroom', 0, splitY, houseWidth * 0.6, houseHeight - splitY - balconyH, 'bedroom');
        addFurniture('bed', houseWidth * 0.3, splitY + (houseHeight - splitY - balconyH) * 0.45, 6, 6, 0);

        addRoom('Bath 2', houseWidth * 0.6, splitY, houseWidth * 0.4, houseHeight - splitY - balconyH, 'bathroom');
        addFurniture('toilet', houseWidth * 0.75, splitY + 2.5, 2, 2.5, 180);
        addFurniture('sink', houseWidth * 0.88, splitY + 2.5, 2, 2, 180);

        addWall(houseWidth * 0.5, 0, houseWidth * 0.5, splitY);
        addWall(0, splitY, houseWidth, splitY);
        addWall(houseWidth * 0.6, splitY, houseWidth * 0.6, houseHeight - balconyH);
        addWall(0, houseHeight - balconyH, houseWidth, houseHeight - balconyH);

        addDoor(1.5, houseHeight - balconyH, 180, 3);
        addDoor(houseWidth * 0.6 + 0.5, splitY + 0.5, 0, 2.5);
      }

    } else if (layoutOption === 'B') {
      // LAYOUT B: Smart Space-Saver
      if (currentFloor === 0) {
        const splitX = houseWidth * 0.5;
        const splitY = houseHeight * 0.45;

        addRoom('Bedroom 1', 0, 0, splitX, splitY, 'bedroom');
        addFurniture('bed', splitX * 0.5, splitY * 0.45, 6, 6, 0);

        addRoom('Common Bath', splitX, 0, houseWidth * 0.25, splitY * 0.6, 'bathroom');
        addFurniture('toilet', splitX + houseWidth * 0.12, splitY * 0.2, 1.8, 2.2, 180);
        
        addRoom('Attached Bath', splitX + houseWidth * 0.25, 0, houseWidth * 0.25, splitY * 0.6, 'bathroom');
        addFurniture('toilet', houseWidth - 2, splitY * 0.2, 1.8, 2.2, 180);

        addRoom('Study Room', splitX, splitY * 0.6, houseWidth * 0.5, splitY * 0.4, 'utility');
        
        addWall(splitX, 0, splitX, splitY);
        addWall(splitX + houseWidth * 0.25, 0, splitX + houseWidth * 0.25, splitY * 0.6);
        addWall(splitX, splitY * 0.6, houseWidth, splitY * 0.6);
        addWall(0, splitY, houseWidth, splitY);

        const livingH = houseHeight - splitY;
        addRoom('Compact Living', 0, splitY, houseWidth * 0.55, livingH, 'living');
        addFurniture('sofa', houseWidth * 0.28, splitY + livingH * 0.45, 7, 5, 0);

        addRoom('Kitchenette', houseWidth * 0.55, splitY, houseWidth * 0.45, livingH, 'kitchen');
        addFurniture('kitchen', houseWidth * 0.75, splitY + livingH * 0.45, 3, 7, 90);

        addWall(houseWidth * 0.55, splitY, houseWidth * 0.55, houseHeight);

        // Doors
        addDoor(houseWidth * 0.2, houseHeight, 180, 3);
        addDoor(splitX - 3.5, splitY, 90, 3);
        addDoor(splitX + 0.5, splitY * 0.6, 0, 2.5);
        addDoor(houseWidth - 3.5, splitY * 0.6, 180, 2.5);
      } else {
        // First Floor Layout B
        const splitX = houseWidth * 0.5;
        const splitY = houseHeight * 0.5;

        addRoom('Bedroom 2', 0, 0, splitX, splitY, 'bedroom');
        addFurniture('bed', splitX * 0.5, splitY * 0.45, 6, 6, 0);

        addRoom('Bedroom 3', splitX, 0, splitX, splitY, 'bedroom');
        addFurniture('bed', splitX + splitX * 0.5, splitY * 0.45, 6, 6, 0);
        
        addRoom('Lounge Area', 0, splitY, houseWidth * 0.6, houseHeight - splitY, 'living');
        addFurniture('sofa', houseWidth * 0.3, splitY + (houseHeight - splitY) * 0.5, 7, 4.5, 0);

        addRoom('Bath 3', houseWidth * 0.6, splitY, houseWidth * 0.4, houseHeight - splitY, 'bathroom');
        addFurniture('toilet', houseWidth * 0.75, splitY + 2.5, 1.8, 2.2, 180);

        addWall(splitX, 0, splitX, splitY);
        addWall(0, splitY, houseWidth, splitY);
        addWall(houseWidth * 0.6, splitY, houseWidth * 0.6, houseHeight);
      }

    } else {
      // LAYOUT C: Vastu-Compliant Courtyard
      const splitX = houseWidth * 0.45;
      const splitY = houseHeight * 0.45;

      if (currentFloor === 0) {
        const courtW = houseWidth * 0.22;
        const courtH = houseHeight * 0.18;
        const courtX = (houseWidth - courtW) / 2;
        const courtY = (houseHeight - courtH) / 2;

        addRoom('Kitchen (SE)', houseWidth * 0.6, houseHeight - splitY * 0.8, houseWidth * 0.4, splitY * 0.8, 'kitchen');
        addFurniture('kitchen', houseWidth * 0.8, houseHeight - splitY * 0.4, 3, 6, 90);

        addRoom('Guest Bed (NW)', 0, 0, splitX, splitY, 'bedroom');
        addFurniture('bed', splitX * 0.5, splitY * 0.45, 6, 6, 0);

        addRoom('Pooja Room', splitX, 0, houseWidth * 0.25, splitY * 0.5, 'utility');
        
        addRoom('Common Bath', splitX + houseWidth * 0.25, 0, houseWidth * 0.3, splitY * 0.5, 'bathroom');
        addFurniture('toilet', houseWidth - 2.5, splitY * 0.25, 1.8, 2.2, 180);

        addRoom('Air Courtyard 🍃', courtX, courtY, courtW, courtH, 'balcony');

        addRoom('Vastu Living', 0, splitY, courtX, houseHeight - splitY, 'living');
        addFurniture('sofa', courtX * 0.5, splitY + (houseHeight - splitY) * 0.45, 6, 4.5, 0);

        addRoom('Dining Foyer', courtX + courtW, splitY, houseWidth - (courtX + courtW), houseHeight - splitY - (splitY * 0.8), 'dining');
        addFurniture('dining', houseWidth - 4.5, splitY + 2.5, 3.5, 5, 0);

        // Courtyard outlines
        addWall(0, splitY, courtX, splitY);
        addWall(courtX, 0, courtX, courtY);
        addWall(courtX + courtW, 0, courtX + courtW, courtY);
        
        addWall(courtX, courtY, courtX + courtW, courtY);
        addWall(courtX, courtY + courtH, courtX + courtW, courtY + courtH);
        addWall(courtX, courtY, courtX, courtY + courtH);
        addWall(courtX + courtW, courtY, courtX + courtW, courtY + courtH);

        addWall(houseWidth * 0.6, houseHeight - splitY * 0.8, houseWidth * 0.6, houseHeight);
        addWall(houseWidth * 0.6, houseHeight - splitY * 0.8, houseWidth, houseHeight - splitY * 0.8);
      } else {
        // First Floor Layout C
        const courtW = houseWidth * 0.22;
        const courtH = houseHeight * 0.18;
        const courtX = (houseWidth - courtW) / 2;
        const courtY = (houseHeight - courtH) / 2;

        addRoom('Master Bed (SW)', 0, splitY, houseWidth * 0.6, houseHeight - splitY, 'bedroom');
        addFurniture('bed', houseWidth * 0.3, splitY + (houseHeight - splitY) * 0.5, 6.5, 6.5, 0);

        addRoom('Air Courtyard 🍃', courtX, courtY, courtW, courtH, 'balcony');
        
        addRoom('Family lounge', 0, 0, houseWidth, courtY, 'living');
        addFurniture('sofa', houseWidth * 0.5, courtY * 0.5, 8, 4.5, 0);

        addRoom('Bedroom 2', houseWidth * 0.6, splitY, houseWidth * 0.4, houseHeight - splitY, 'bedroom');
        addFurniture('bed', houseWidth * 0.8, splitY + (houseHeight - splitY) * 0.5, 6, 6, 0);
      }
    }
  }

  // Set colors based on style
  const getStyleColor = () => {
    switch (style.toLowerCase()) {
      case 'modern villa':
      case 'modern':
        return { primary: '#6366f1', secondary: '#818cf8', bg: '#0b0f19', walls: '#ffffff' };
      case 'minimalist':
        return { primary: '#10b981', secondary: '#34d399', bg: '#090d16', walls: '#e5e7eb' };
      case 'traditional':
        return { primary: '#f59e0b', secondary: '#fbbf24', bg: '#100b05', walls: '#f3f4f6' };
      case 'industrial':
        return { primary: '#ef4444', secondary: '#f87171', bg: '#0e0e11', walls: '#9ca3af' };
      default:
        return { primary: '#6366f1', secondary: '#818cf8', bg: '#0b0f19', walls: '#ffffff' };
    }
  };

  const colors = getStyleColor();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Blueprint Header */}
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
          Layout Alternative: {layoutOption} (Scale: 1px = ~{(1/scale).toFixed(2)}ft)
        </span>
        <span className="text-sm font-semibold text-gray-300">
          {currentFloor === 0 ? 'Ground Floor Blueprint' : `Floor ${currentFloor + 1} Blueprint`}
        </span>
      </div>

      {/* Blueprint Drawing */}
      <div className="relative w-full rounded-xl overflow-hidden glass-panel border border-indigo-500/20 p-4 flex items-center justify-center bg-gray-950/80">
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="max-h-[380px] w-full"
        >
          {/* Plot Boundary */}
          <rect
            x={px}
            y={py}
            width={w}
            height={h}
            fill="none"
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={px + w/2}
            y={py - 8}
            textAnchor="middle"
            fill="#94a3b8"
            className="text-[10px] font-mono"
          >
            Width: {plotWidth} ft
          </text>
          <text
            x={px - 8}
            y={py + h/2}
            textAnchor="middle"
            transform={`rotate(-90 ${px - 8} ${py + h/2})`}
            fill="#94a3b8"
            className="text-[10px] font-mono"
          >
            Depth: {plotLength} ft
          </text>

          {/* Setback area representation */}
          <rect
            x={hx}
            y={hy}
            width={hw}
            height={hh}
            fill={colors.bg}
            fillOpacity="0.8"
            stroke={colors.primary}
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Rooms */}
          {rooms.map((room, idx) => {
            let fillCol = 'rgba(99, 102, 241, 0.03)';
            let strokeCol = 'rgba(99, 102, 241, 0.15)';
            if (room.type === 'bedroom') {
              fillCol = 'rgba(139, 92, 246, 0.05)';
              strokeCol = 'rgba(139, 92, 246, 0.2)';
            } else if (room.type === 'bathroom') {
              fillCol = 'rgba(16, 185, 129, 0.05)';
              strokeCol = 'rgba(16, 185, 129, 0.2)';
            } else if (room.type === 'kitchen') {
              fillCol = 'rgba(239, 68, 68, 0.05)';
              strokeCol = 'rgba(239, 68, 68, 0.2)';
            } else if (room.type === 'balcony') {
              fillCol = room.label.includes('Courtyard') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.05)';
              strokeCol = room.label.includes('Courtyard') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.2)';
            }

            return (
              <g key={`room-${idx}`}>
                <rect
                  x={room.x}
                  y={room.y}
                  width={room.w}
                  height={room.h}
                  fill={fillCol}
                  stroke={strokeCol}
                  strokeWidth={room.label.includes('Courtyard') ? "1.5" : "1"}
                  strokeDasharray={room.label.includes('Courtyard') ? "2 2" : "0"}
                />
                <text
                  x={room.x + room.w / 2}
                  y={room.y + room.h / 2 - 4}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  className="text-[11px] font-semibold tracking-wide"
                >
                  {room.label}
                </text>
                <text
                  x={room.x + room.w / 2}
                  y={room.y + room.h / 2 + 10}
                  textAnchor="middle"
                  fill="#64748b"
                  className="text-[9px] font-mono"
                >
                  {room.widthFt}' x {room.heightFt}'
                </text>
              </g>
            );
          })}



          {/* Internal & External Walls (Thick Lines) */}
          <g stroke={colors.walls} strokeWidth="3" strokeLinecap="square">
            <line x1={hx} y1={hy} x2={hx + hw} y2={hy} />
            <line x1={hx + hw} y1={hy} x2={hx + hw} y2={hy + hh} />
            <line x1={hx} y1={hy + hh} x2={hx + hw} y2={hy + hh} />
            <line x1={hx} y1={hy} x2={hx} y2={hy + hh} />

            {walls.map((wall, idx) => (
              <line
                key={`wall-${idx}`}
                x1={wall.x1}
                y1={wall.y1}
                x2={wall.x2}
                y2={wall.y2}
              />
            ))}
          </g>

          {/* Window Symbols */}
          <g stroke="#38bdf8" strokeWidth="2">
            {windows.map((win, idx) => {
              if (win.isVertical) {
                return (
                  <g key={`win-${idx}`}>
                    <line x1={win.x} y1={win.y - win.size / 2} x2={win.x} y2={win.y + win.size / 2} stroke="#000" strokeWidth="5" />
                    <line x1={win.x - 1} y1={win.y - win.size / 2} x2={win.x - 1} y2={win.y + win.size / 2} />
                    <line x1={win.x + 1} y1={win.y - win.size / 2} x2={win.x + 1} y2={win.y + win.size / 2} />
                  </g>
                );
              } else {
                return (
                  <g key={`win-${idx}`}>
                    <line x1={win.x - win.size / 2} y1={win.y} x2={win.x + win.size / 2} y2={win.y} stroke="#000" strokeWidth="5" />
                    <line x1={win.x - win.size / 2} y1={win.y - 1} x2={win.x + win.size / 2} y2={win.y - 1} />
                    <line x1={win.x - win.size / 2} y1={win.y + 1} x2={win.x + win.size / 2} y2={win.y + 1} />
                  </g>
                );
              }
            })}
          </g>

          {/* Door Openings */}
          {doors.map((door, idx) => {
            const size = door.size;
            let pathD = '';
            let lineX2 = door.x;
            let lineY2 = door.y;

            if (door.angle === 0) {
              lineY2 = door.y - size;
              pathD = `M ${door.x} ${door.y - size} A ${size} ${size} 0 0 1 ${door.x + size} ${door.y}`;
            } else if (door.angle === 90) {
              lineX2 = door.x + size;
              pathD = `M ${door.x + size} ${door.y} A ${size} ${size} 0 0 1 ${door.x} ${door.y + size}`;
            } else if (door.angle === 180) {
              lineY2 = door.y + size;
              pathD = `M ${door.x} ${door.y + size} A ${size} ${size} 0 0 1 ${door.x - size} ${door.y}`;
            } else {
              lineX2 = door.x - size;
              pathD = `M ${door.x - size} ${door.y} A ${size} ${size} 0 0 1 ${door.x} ${door.y - size}`;
            }

            return (
              <g key={`door-${idx}`}>
                <circle cx={door.x} cy={door.y} r={size * 0.1} fill={colors.primary} />
                <line
                  x1={door.x}
                  y1={door.y}
                  x2={lineX2}
                  y2={lineY2}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
