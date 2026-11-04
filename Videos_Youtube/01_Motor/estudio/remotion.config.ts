import {Config} from '@remotion/cli/config';

// Calidad de exportación pensada para YouTube (H.264, CRF bajo).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
// WebGL por software (ANGLE + SwiftShader) funciona en cualquier PC/servidor.
// En un PC con GPU puedes cambiarlo a 'angle' para renderizar mucho más rápido.
Config.setChromiumOpenGlRenderer(process.env.REMOTION_GL === 'angle' ? 'angle' : 'swangle');
