# Cómo crear escenas nuevas (formato Pizarra)

Cada escena es un componente de React en `estudio/src/formatos/pizarra/escenas/`. Para que el plan lo encuentre, regístralo en `estudio/src/motor/registro.ts`.

```tsx
import {ap, easeInOut, sal, useEscena} from '../../../motor/tiempo';
import {Ap, D, Etiqueta, Flecha, Flujo, Lienzo, P, R, T} from '../kit';
import {Diodo} from '../iconos';

export const MiEscena: React.FC = () => {
  const {t, M} = useEscena();          // t = segundos desde que empezó la escena
  const tDiodo = M('diodo', 2.0);       // marca del plan.yaml (o 2.0 s si no existe)
  return (
    <Lienzo>                            {/* lienzo SVG de 1920×1080 */}
      <D d={R.linea(300, 480, 1620, 480)} p={ap(t, 0, 1.0, easeInOut)} />   {/* línea que se dibuja en 1 s */}
      <Diodo x1={760} y1={480} x2={1160} y2={480} p={ap(t, tDiodo, 0.8)} />
      <Ap p={ap(t, tDiodo + 0.3, 0.5)}>                                    {/* aparece con fundido */}
        <T x={960} y={330} s={64} pe={800}>diodo</T>
      </Ap>
      <Flujo pts={[[300, 480], [1620, 480]]} t={t} vel={200} />             {/* corriente que fluye */}
    </Lienzo>
  );
};
```

Y en `plan.yaml`:

```yaml
- id: mi_escena
  escena: MiEscena
  seccion: "1 · EL SENTIDO"
  desde: "frase con la que empieza"
  marcas:
    diodo: "los diodos"          # el diodo se dibuja justo cuando la voz dice "los diodos"
```

## Piezas disponibles

- **Tiempo**: `ap(t, inicio, duración)` va de 0 a 1 (entrada); `sal(t, inicio, duración)` va de 1 a 0 (salida); `mix(a, b, p)` interpola.
- **Dibujo** (`kit.tsx`): `D` (trazo que se dibuja), `T` (texto), `Ap` (aparecer), `Mover`, `Flecha`, `Check`, `Cruz`, `Etiqueta`, `Pildora`, `Flujo` (partículas), `Medidor`, `Manometro`, `Ejes`, `ondaSeno`, `temblor`.
- **Rutas** (`R`): `linea`, `poli`, `rect`, `circulo`, `arco`, `funcion` (gráfica de y = f(x)), `zigzag`, `bobina`.
- **Íconos** (`iconos.tsx`): `Reloj`, `Telefono`, `Enchufe`, `Cargador`, `Bateria`, `Diodo`, `Condensador`, `Tanque`, `Interruptor`, `TransistorPieza`, `Mosfet`, `Resorte`, `Resistencia`, `Coche`, `Ladrillo`, `TransformadorGrande`, `TransformadorFerrita`, `Escudo`, `Alerta`, `Rayo`, `Gota`, `Burbuja`, `Chip`, `FuenteAlterna`, `Lupa`.
- **Colores** (`P`): `papel`, `tinta`, `tinta2`, `gris`, `azul` (lo que fluye o lo bueno), `rojo` (límite o peligro), `azulSuave`, `rojoSuave`.

## Reglas de estilo (las de las referencias preferidas)

1. Fondo papel, trazo negro de 4 px, un azul y un rojo. Nada más.
2. Cada idea dicha, una imagen que cambia. Dispara la animación con una marca, no con un tiempo fijo.
3. No pongas nada debajo de y = 840: ahí van los subtítulos.
4. Números grandes en color cuando la voz dice un dato.
5. Revisa con `node scripts/fotogramas.mjs EP01 carpeta 12.5 30 45` (fotogramas sueltos, rápido) antes de renderizar el video completo.
