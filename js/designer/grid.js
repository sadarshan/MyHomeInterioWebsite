/* Iso projection: 2:1 dimetric.
 * World coords are inches (x=right along wall, y=into room, z=up).
 * Origin is back-left corner of the room floor.
 */
window.MK = window.MK || {};

MK.grid = (function () {
  const PX_PER_IN = 1.6;
  /* Standard 2:1-ish dimetric. World x runs along the back wall to the right,
   * y runs into the room from the back wall, z is up. Screen y grows downward. */
  const ISO_X = { x:  0.866, y:  0.500 };
  const ISO_Y = { x: -0.866, y:  0.500 };

  function project(xIn, yIn, zIn = 0) {
    const sx = (xIn * ISO_X.x + yIn * ISO_Y.x) * PX_PER_IN;
    const sy = (xIn * ISO_X.y + yIn * ISO_Y.y) * PX_PER_IN - zIn * PX_PER_IN;
    return { x: sx, y: sy };
  }

  /* Inverse: from a 2D screen point on the floor plane back to world (xIn, yIn).
   * Solving the 2x2: sx = a*xIn + c*yIn ; sy = b*xIn + d*yIn (z=0). */
  function unproject(sx, sy) {
    const a = ISO_X.x * PX_PER_IN, c = ISO_Y.x * PX_PER_IN;
    const b = ISO_X.y * PX_PER_IN, d = ISO_Y.y * PX_PER_IN;
    const det = a * d - b * c;
    const xIn = ( d * sx - c * sy) / det;
    const yIn = (-b * sx + a * sy) / det;
    return { xIn, yIn };
  }

  function snap(valIn, gridIn = 6) {
    return Math.round(valIn / gridIn) * gridIn;
  }

  function clampToRoom(xIn, yIn, wIn, dIn, room) {
    return {
      x: Math.max(0, Math.min(room.widthIn - wIn, xIn)),
      y: Math.max(0, Math.min(room.depthIn - dIn, yIn))
    };
  }

  return { PX_PER_IN, project, unproject, snap, clampToRoom };
})();
