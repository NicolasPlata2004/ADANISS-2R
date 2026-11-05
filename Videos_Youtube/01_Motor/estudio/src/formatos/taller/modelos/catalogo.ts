// Catálogo de objetos para vitrinas y listas (todas las series de modelos juntas).
import {OBJETOS, type Ficha} from './Objetos';
import {CATALOGO_S02} from './ObjetosS02';
import {CATALOGO_S03} from './ObjetosS03';

export const CATALOGO: Record<string, Ficha> = {...OBJETOS, ...(CATALOGO_S02 as Record<string, Ficha>), ...(CATALOGO_S03 as Record<string, Ficha>)};
