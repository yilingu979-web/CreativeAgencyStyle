export const createFluidConfig = ({ isMobile }) => ({
    IMMEDIATE: false,
    TRIGGER: 'hover',
    SIM_RESOLUTION: isMobile ? 64 : 128,
    DYE_RESOLUTION: isMobile ? 512 : 1024,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 3.5,
    VELOCITY_DISSIPATION: 1.5,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: isMobile ? 12 : 20,
    CURL: 3,
    SPLAT_RADIUS: isMobile ? 0.45 : 0.6,
    SPLAT_FORCE: 6500,
    SHADING: !isMobile,
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: true,
    BLOOM: false,
    SUNRAYS: false,
});

export const shouldEnableFluidCursor = ({ reducedMotion, hasWebGL }) => !reducedMotion && hasWebGL;

export const pointerEventToMouseInit = ({ clientX, clientY }) => ({ clientX, clientY });
