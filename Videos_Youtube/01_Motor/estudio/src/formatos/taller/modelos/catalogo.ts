// Catálogo de objetos para vitrinas y listas (todas las series de modelos juntas).
import {OBJETOS, type Ficha} from './Objetos';
import {CATALOGO_S02} from './ObjetosS02';
import {CATALOGO_S03} from './ObjetosS03';
import {CATALOGO_S04} from './ObjetosS04';
import {CATALOGO_S05} from './ObjetosS05';
import {CATALOGO_S06} from './ObjetosS06';
import {CATALOGO_S07} from './ObjetosS07';
import {CATALOGO_S08} from './ObjetosS08';
import {CATALOGO_S09} from './ObjetosS09';
import {CATALOGO_S10} from './ObjetosS10';

export const CATALOGO: Record<string, Ficha> = {...OBJETOS, ...(CATALOGO_S02 as Record<string, Ficha>), ...(CATALOGO_S03 as Record<string, Ficha>), ...(CATALOGO_S04 as Record<string, Ficha>), ...(CATALOGO_S05 as Record<string, Ficha>), ...(CATALOGO_S06 as Record<string, Ficha>), ...(CATALOGO_S07 as Record<string, Ficha>), ...(CATALOGO_S08 as Record<string, Ficha>), ...(CATALOGO_S09 as Record<string, Ficha>), ...(CATALOGO_S10 as Record<string, Ficha>)};
