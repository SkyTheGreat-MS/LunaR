/**
 * Isometric Canvas Renderer
 * 2D lunar surface viewport, procedural building drawings, grid snapping,
 * placement previews, camera pan/zoom, and environmental atmospheric effects.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BUILDING_CATALOG } from '../../game/catalog/buildings';
import { canPlaceBuilding } from '../../game/simulation/engine';
import { GridPosition, PlacedBuilding } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { gridToScreen, screenToGrid, TILE_HEIGHT, TILE_WIDTH } from './isometricUtils';

export const IsometricCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeMission = useGameStore((s) => s.activeMission);
  const placementType = useGameStore((s) => s.placementType);
  const selectedBuilding = useGameStore((s) => s.selectedBuilding);
  const settings = useGameStore((s) => s.settings);

  const placeBuildingAt = useGameStore((s) => s.placeBuildingAt);
  const selectBuilding = useGameStore((s) => s.selectBuilding);

  // Camera state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState<GridPosition | null>(null);

  // Center camera on grid initially
  useEffect(() => {
    if (!canvasRef.current || !activeMission) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setCamera({
      x: rect.width / 2,
      y: rect.height / 3 + 40,
      zoom: 1,
    });
  }, [activeMission?.missionId]);

  // Handle pointer down (pan or click)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(false);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMission) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if dragging camera
    if (e.buttons === 1) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
        setCamera((prev) => ({
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }

    // Calculate grid tile
    const gridPos = screenToGrid(
      mouseX,
      mouseY,
      camera.x,
      camera.y,
      camera.zoom,
      TILE_WIDTH,
      TILE_HEIGHT
    );
    setHoverTile(gridPos);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging || !activeMission) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gridPos = screenToGrid(
      mouseX,
      mouseY,
      camera.x,
      camera.y,
      camera.zoom,
      TILE_WIDTH,
      TILE_HEIGHT
    );

    // If in placement mode: try to place
    if (placementType) {
      placeBuildingAt(gridPos);
      return;
    }

    // Otherwise, check if user clicked on an existing building
    let clicked: PlacedBuilding | null = null;
    // Iterate in reverse (topmost z-order first)
    for (let i = activeMission.buildings.length - 1; i >= 0; i--) {
      const b = activeMission.buildings[i];
      const def = BUILDING_CATALOG[b.type];
      if (!def) continue;

      if (
        gridPos.x >= b.position.x &&
        gridPos.x < b.position.x + def.size.width &&
        gridPos.y >= b.position.y &&
        gridPos.y < b.position.y + def.size.height
      ) {
        clicked = b;
        break;
      }
    }

    selectBuilding(clicked);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.6, Math.min(2.0, prev.zoom * zoomFactor)),
    }));
  };

  // Render loop
  const renderWorld = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMission) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // 1. Space Sky Backdrop (Original Stars & Black Navy Blue Space)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#030712'); // obsidian black
    skyGrad.addColorStop(0.6, '#0b132b'); // deep navy space
    skyGrad.addColorStop(1, '#1c2541'); // lunar horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant Earth in sky
    ctx.save();
    const earthX = width * 0.82;
    const earthY = height * 0.16;
    const earthR = 28;
    const earthGlow = ctx.createRadialGradient(earthX, earthY, earthR * 0.8, earthX, earthY, earthR * 2.2);
    earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    earthGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Earth globe
    const earthBody = ctx.createLinearGradient(earthX - earthR, earthY - earthR, earthX + earthR, earthY + earthR);
    earthBody.addColorStop(0, '#38bdf8');
    earthBody.addColorStop(0.5, '#0284c7');
    earthBody.addColorStop(1, '#0f172a');
    ctx.fillStyle = earthBody;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fill();
    // Swirling cloud hint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(earthX - 4, earthY - 8, 12, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(earthX + 6, earthY + 6, 14, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sparkling Stars in deep space
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const seed = 42;
    for (let i = 0; i < 45; i++) {
      const sx = ((i * 137.5 + seed * 19) % width);
      const sy = ((i * 243.1 + seed * 31) % (height * 0.55));
      const sSize = (i % 3 === 0) ? 1.5 : 1;
      ctx.fillRect(sx, sy, sSize, sSize);
    }

    // Apply Camera Transform
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // 2. Draw Curved Lunar Body Surface (Gentle Moon Curvature)
    const { width: gridW, height: gridH } = activeMission.gridSize;

    // Curved lunar mound geometry enveloping the module site
    const moonCenterX = 0;
    const moonCenterY = ((gridW + gridH) * TILE_HEIGHT) / 4;
    const moonRadX = (gridW * TILE_WIDTH) / 2 + 75;
    const moonRadY = (((gridW + gridH) * TILE_HEIGHT) / 4) + 48;
    const crustDepth = 36;

    ctx.save();

    // A. 3D Lunar Crust Thickness / Cliff Drop below the curve
    ctx.beginPath();
    ctx.ellipse(moonCenterX, moonCenterY + crustDepth, moonRadX, moonRadY, 0, 0, Math.PI);
    ctx.lineTo(moonCenterX - moonRadX, moonCenterY);
    ctx.ellipse(moonCenterX, moonCenterY, moonRadX, moonRadY, 0, Math.PI, 0, true);
    ctx.closePath();

    const cliffGrad = ctx.createLinearGradient(
      moonCenterX - moonRadX,
      moonCenterY,
      moonCenterX + moonRadX,
      moonCenterY + crustDepth + moonRadY
    );
    cliffGrad.addColorStop(0, '#0f172a');
    cliffGrad.addColorStop(0.5, '#1e293b');
    cliffGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = cliffGrad;
    ctx.fill();

    // Lunar basalt strata layers
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 1.5;
    for (let s = 10; s <= 26; s += 8) {
      ctx.beginPath();
      ctx.ellipse(moonCenterX, moonCenterY + s, moonRadX * 0.98, moonRadY * 0.98, 0, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // B. Curved Moon Surface Mound (Subtle Lunar Sphere Dome)
    ctx.beginPath();
    ctx.ellipse(moonCenterX, moonCenterY, moonRadX, moonRadY, 0, 0, Math.PI * 2);

    const moonGrad = ctx.createRadialGradient(
      moonCenterX - 35,
      moonCenterY - 45,
      moonRadX * 0.15,
      moonCenterX,
      moonCenterY,
      moonRadX
    );
    moonGrad.addColorStop(0, '#3a475a'); // sunlit apex
    moonGrad.addColorStop(0.5, '#283344'); // mid-slope regolith
    moonGrad.addColorStop(0.85, '#1e2634'); // curving horizon boundary
    moonGrad.addColorStop(1, '#131922'); // terminator shadow
    ctx.fillStyle = moonGrad;
    ctx.fill();

    // C. Curved Lunar Horizon Rim Glow (Light Blue Silhouette like orbital imagery)
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // D. Natural craters and boulders on the outer curved moon perimeter
    const outerCraters = [
      { x: moonCenterX - moonRadX * 0.65, y: moonCenterY - moonRadY * 0.45, rx: 18, ry: 9 },
      { x: moonCenterX + moonRadX * 0.62, y: moonCenterY - moonRadY * 0.4, rx: 15, ry: 8 },
      { x: moonCenterX - moonRadX * 0.55, y: moonCenterY + moonRadY * 0.5, rx: 20, ry: 10 },
      { x: moonCenterX + moonRadX * 0.58, y: moonCenterY + moonRadY * 0.42, rx: 16, ry: 8 },
      { x: moonCenterX, y: moonCenterY - moonRadY * 0.75, rx: 22, ry: 11 },
      { x: moonCenterX, y: moonCenterY + moonRadY * 0.72, rx: 24, ry: 12 },
    ];

    outerCraters.forEach((c) => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.restore();

    // Draw lunar base plate shadow / elevation
    const drawDiamond = (gx: number, gy: number, fill: string, stroke?: string) => {
      const p = gridToScreen(gx, gy);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + TILE_WIDTH / 2, p.y + TILE_HEIGHT / 2);
      ctx.lineTo(p.x, p.y + TILE_HEIGHT);
      ctx.lineTo(p.x - TILE_WIDTH / 2, p.y + TILE_HEIGHT / 2);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Authentic lunar regolith surface tiles with spherical curve shading
    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const isCrater = (gx * 3 + gy * 7) % 11 === 0;
        const isHighlight = (gx + gy) % 2 === 0;

        // Spherical curve radial shade: center of base is sunlit, edges curve away
        const distFromCenter = Math.hypot(gx - gridW / 2 + 0.5, gy - gridH / 2 + 0.5);
        const curveRatio = Math.min(1, distFromCenter / (gridW * 0.65));

        let tileColor: string;
        if (isCrater) {
          tileColor = '#1e293b';
        } else if (isHighlight) {
          tileColor = curveRatio < 0.4 ? '#37465b' : curveRatio < 0.75 ? '#313e51' : '#293546';
        } else {
          tileColor = curveRatio < 0.4 ? '#2e3b4d' : curveRatio < 0.75 ? '#283444' : '#222c3a';
        }

        const strokeColor = settings.showGridLines ? 'rgba(148, 163, 184, 0.22)' : undefined;
        drawDiamond(gx, gy, tileColor, strokeColor);

        // Crater texture hint
        if (isCrater) {
          const p = gridToScreen(gx, gy);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + TILE_HEIGHT / 2, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Active hovered tile highlight
    if (
      hoverTile &&
      hoverTile.x >= 0 &&
      hoverTile.x < gridW &&
      hoverTile.y >= 0 &&
      hoverTile.y < gridH &&
      !placementType
    ) {
      drawDiamond(hoverTile.x, hoverTile.y, 'rgba(56, 189, 248, 0.25)', '#38bdf8');
    }

    // 3. Draw Placed Buildings sorted in isometric painter order (X + Y)
    const sortedBuildings = [...activeMission.buildings].sort((a, b) => {
      const aDef = BUILDING_CATALOG[a.type];
      const bDef = BUILDING_CATALOG[b.type];
      const aZ = a.position.x + a.position.y + (aDef ? aDef.size.width + aDef.size.height : 0);
      const bZ = b.position.x + b.position.y + (bDef ? bDef.size.width + bDef.size.height : 0);
      return aZ - bZ;
    });

    sortedBuildings.forEach((b) => {
      drawBuildingSprite(ctx, b, b.id === selectedBuilding?.id);
    });

    // 4. Draw Placement Ghost Preview
    if (placementType && hoverTile) {
      const def = BUILDING_CATALOG[placementType];
      if (def) {
        const { width: bw, height: bh } = def.size;
        const check = canPlaceBuilding(activeMission.gridSize, activeMission.buildings, placementType, hoverTile);
        const canAfford = activeMission.resources.credits >= def.cost;
        const isValid = check.valid && canAfford;

        // Highlight footprint tiles
        for (let dy = 0; dy < bh; dy++) {
          for (let dx = 0; dx < bw; dx++) {
            const tx = hoverTile.x + dx;
            const ty = hoverTile.y + dy;
            const fillColor = isValid
              ? 'rgba(34, 197, 94, 0.45)' // Emerald green
              : 'rgba(239, 68, 68, 0.45)'; // Amber red
            const strokeColor = isValid ? '#22c55e' : '#ef4444';
            drawDiamond(tx, ty, fillColor, strokeColor);
          }
        }

        // Draw ghost building silhouette
        ctx.save();
        ctx.globalAlpha = 0.75;
        drawBuildingSprite(ctx, {
          id: 'ghost',
          type: placementType,
          position: hoverTile,
          enabled: true,
          builtOnDay: activeMission.day,
        }, false);
        ctx.restore();
      }
    }

    // 5. Environmental Dust Storm Effects
    if (activeMission.environment.dustStormLevel > 0.1 && !settings.reducedMotion) {
      ctx.fillStyle = 'rgba(217, 119, 6, 0.15)'; // warm amber haze
      ctx.fillRect(-1000, -1000, 3000, 3000);

      // Dust flecks
      ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
      const t = Date.now() * 0.002;
      for (let i = 0; i < 30; i++) {
        const px = ((i * 73 + t * 40) % (gridW * TILE_WIDTH)) - 200;
        const py = ((i * 51 + t * 25) % (gridH * TILE_HEIGHT)) - 100;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore(); // restore camera
    ctx.restore(); // restore screen
  }, [
    activeMission,
    camera,
    hoverTile,
    placementType,
    selectedBuilding,
    settings.showGridLines,
    settings.reducedMotion,
  ]);

  // Request Animation Frame loop for smooth rendering
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderWorld();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderWorld]);

  // Procedural isometric building drawing helper
  const drawBuildingSprite = (
    ctx: CanvasRenderingContext2D,
    b: PlacedBuilding,
    isSelected: boolean
  ) => {
    const def = BUILDING_CATALOG[b.type];
    if (!def) return;

    const { width: bw, height: bh } = def.size;

    // Center screen anchor of the building base
    const pTop = gridToScreen(b.position.x, b.position.y);
    const pRight = gridToScreen(b.position.x + bw, b.position.y);
    const pBottom = gridToScreen(b.position.x + bw, b.position.y + bh);
    const pLeft = gridToScreen(b.position.x, b.position.y + bh);

    const centerX = (pTop.x + pBottom.x) / 2;
    const centerY = (pTop.y + pBottom.y) / 2;

    ctx.save();

    // Selection ring
    if (isSelected) {
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.lineTo(pLeft.x, pLeft.y);
      ctx.closePath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Concrete foundation pad
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pBottom.x, pBottom.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.closePath();
    ctx.fillStyle = b.enabled ? '#475569' : '#334155';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vertical building structure
    if (b.type === 'habitat') {
      // 2x2 Geodesic Living Dome
      const domeR = 34;
      const domeCenterY = centerY - 14;

      // Dome shadow/gradient
      const domeGrad = ctx.createRadialGradient(
        centerX - 8,
        domeCenterY - 10,
        6,
        centerX,
        domeCenterY,
        domeR
      );
      domeGrad.addColorStop(0, '#f8fafc'); // shiny white
      domeGrad.addColorStop(0.6, '#cbd5e1'); // lunar grey
      domeGrad.addColorStop(1, '#64748b'); // shaded base

      ctx.beginPath();
      ctx.arc(centerX, domeCenterY, domeR, Math.PI, 0, false);
      ctx.lineTo(centerX + domeR, centerY + 2);
      ctx.lineTo(centerX - domeR, centerY + 2);
      ctx.closePath();
      ctx.fillStyle = domeGrad;
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Airlock tunnel protruding south
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(centerX - 8, centerY - 6, 16, 14);
      ctx.fillStyle = '#0284c7'; // airlock door
      ctx.fillRect(centerX - 5, centerY, 10, 8);

      // Observation portal ring
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX - 10, domeCenterY - 8, 5, 0, Math.PI * 2);
      ctx.arc(centerX + 10, domeCenterY - 8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Top comms antenna
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, domeCenterY - domeR);
      ctx.lineTo(centerX, domeCenterY - domeR - 16);
      ctx.stroke();
      ctx.fillStyle = '#ef4444'; // blinking red beacon
      ctx.beginPath();
      ctx.arc(centerX, domeCenterY - domeR - 16, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === 'solar_array') {
      // 2x1 Angled Photovoltaic Wing
      const pY = centerY - 18;

      // Support pylons
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 14, centerY);
      ctx.lineTo(centerX - 14, pY + 8);
      ctx.moveTo(centerX + 14, centerY);
      ctx.lineTo(centerX + 14, pY + 8);
      ctx.stroke();

      // Panel angled surface
      ctx.beginPath();
      ctx.moveTo(centerX - 36, pY - 8);
      ctx.lineTo(centerX + 36, pY - 8);
      ctx.lineTo(centerX + 26, pY + 16);
      ctx.lineTo(centerX - 46, pY + 16);
      ctx.closePath();

      const solarGrad = ctx.createLinearGradient(centerX - 36, pY, centerX + 36, pY);
      solarGrad.addColorStop(0, '#1e3a8a'); // dark blue silicon
      solarGrad.addColorStop(0.5, '#3b82f6'); // blue reflection
      solarGrad.addColorStop(1, '#1e40af');
      ctx.fillStyle = b.enabled ? solarGrad : '#475569';
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Grid wafer lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, pY - 8);
      ctx.lineTo(centerX - 10, pY + 16);
      ctx.moveTo(centerX - 18, pY - 8);
      ctx.lineTo(centerX - 28, pY + 16);
      ctx.moveTo(centerX + 18, pY - 8);
      ctx.lineTo(centerX + 8, pY + 16);
      ctx.stroke();
    } else if (b.type === 'battery_bank') {
      // 1x1 Power Storage Cuboid
      const boxW = 26;
      const boxH = 24;
      const boxTop = centerY - boxH;

      // Front Face
      ctx.fillStyle = b.enabled ? '#1e293b' : '#334155';
      ctx.fillRect(centerX - boxW / 2, boxTop, boxW, boxH);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(centerX - boxW / 2, boxTop, boxW, boxH);

      // Glowing LED charge bars
      ctx.fillStyle = b.enabled ? '#34d399' : '#64748b';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(centerX - boxW / 2 + 5, boxTop + 5 + i * 6, boxW - 10, 3);
      }
    } else if (b.type === 'greenhouse') {
      // 2x2 Glass Bio-Dome
      const r = 30;
      const domeY = centerY - 10;

      // Translucent green dome
      const ghGrad = ctx.createRadialGradient(centerX - 8, domeY - 6, 4, centerX, domeY, r);
      ghGrad.addColorStop(0, 'rgba(74, 222, 128, 0.85)');
      ghGrad.addColorStop(0.7, 'rgba(22, 163, 74, 0.65)');
      ghGrad.addColorStop(1, 'rgba(21, 128, 61, 0.9)');

      ctx.beginPath();
      ctx.arc(centerX, domeY, r, Math.PI, 0, false);
      ctx.lineTo(centerX + r, centerY);
      ctx.lineTo(centerX - r, centerY);
      ctx.closePath();
      ctx.fillStyle = b.enabled ? ghGrad : 'rgba(100, 116, 139, 0.7)';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Interior hydroponic crop ribs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, domeY, r * 0.65, Math.PI, 0);
      ctx.stroke();
    } else if (b.type === 'water_recycler') {
      // 1x1 Distillation Column & Tank
      const colW = 20;
      const colH = 30;
      const colTop = centerY - colH;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(centerX - colW / 2, colTop, colW, colH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(centerX - colW / 2, colTop, colW, colH);

      // Blue fluid level indicator
      ctx.fillStyle = b.enabled ? '#38bdf8' : '#64748b';
      ctx.fillRect(centerX - colW / 2 + 4, colTop + 10, colW - 8, 16);

      // Top condenser coil
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, colTop - 4, 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.type === 'radiation_shielding') {
      // 2x1 Thick Interlocking Regolith Bastion
      const wallH = 28;
      const wTop = centerY - wallH;

      ctx.fillStyle = '#64748b'; // dense basalt rock
      ctx.fillRect(centerX - 30, wTop, 60, wallH);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 30, wTop, 60, wallH);

      // Stone block joints
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 30, wTop + 14);
      ctx.lineTo(centerX + 30, wTop + 14);
      ctx.moveTo(centerX, wTop);
      ctx.lineTo(centerX, wTop + 14);
      ctx.moveTo(centerX - 15, wTop + 14);
      ctx.lineTo(centerX - 15, centerY);
      ctx.moveTo(centerX + 15, wTop + 14);
      ctx.lineTo(centerX + 15, centerY);
      ctx.stroke();
    } else if (b.type === 'research_rover') {
      // 1x1 Rover Vehicle
      const rY = centerY - 14;

      // Chassis
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(centerX - 14, rY, 28, 12);
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - 14, rY, 28, 12);

      // Big rocker-bogie wheels
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(centerX - 12, rY + 14, 5, 0, Math.PI * 2);
      ctx.arc(centerX, rY + 14, 5, 0, Math.PI * 2);
      ctx.arc(centerX + 12, rY + 14, 5, 0, Math.PI * 2);
      ctx.fill();

      // Sensor mast
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX + 8, rY);
      ctx.lineTo(centerX + 8, rY - 12);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(centerX + 5, rY - 14, 6, 4);
    }

    // Disabled status badge overlay
    if (!b.enabled) {
      ctx.fillStyle = '#f59e0b'; // amber
      ctx.beginPath();
      ctx.arc(centerX, centerY - 25, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('II', centerX, centerY - 22);
    }

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating Camera / Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
        <button
          onClick={() => setCamera((c) => ({ ...c, zoom: Math.min(2.0, c.zoom + 0.15) }))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-base font-bold transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setCamera((c) => ({ ...c, zoom: Math.max(0.6, c.zoom - 0.15) }))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-base font-bold transition-colors"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              setCamera({ x: rect.width / 2, y: rect.height / 3 + 40, zoom: 1 });
            }
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-mono transition-colors"
          title="Recenter Outpost"
        >
          ⊙
        </button>
      </div>

      {/* Placement Mode Active Indicator Bar */}
      {placementType && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 border border-sky-400 text-slate-800 px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-3 text-xs">
          <span className="font-semibold text-sky-700">Placing: {BUILDING_CATALOG[placementType].name}</span>
          <span className="text-slate-400">Click ground to build</span>
          <button
            onClick={() => useGameStore.getState().setPlacementType(null)}
            className="ml-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] text-slate-600 font-semibold"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
