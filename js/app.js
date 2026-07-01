// 1. Datos iniciales del proyecto y colores por tipo
const coloresPorTipo = {
  grass: "bg-green-200 text-green-800",
  water: "bg-blue-200 text-blue-800",
  fire: "bg-orange-200 text-orange-800",
  electric: "bg-yellow-200 text-yellow-800",
  normal: "bg-gray-200 text-gray-800",
  fairy: "bg-pink-200 text-pink-800",
  ghost: "bg-purple-200 text-purple-800",
  poison: "bg-indigo-200 text-indigo-800",
  psychic: "bg-pink-300 text-pink-900",
}

const mensaje = document.getElementById("mensaje");
const spinner = document.getElementById("spinner");
const contenedor = document.getElementById("resultado");

function crearTarjeta(pokemon) {
  let { nombre, imagen, tipos } = pokemon;
  const articulo = document.createElement("article");
  
  // Mapeo dinámico usando el diccionario de colores
  const badges = tipos.map(tipo => {
    return `<span class="text-xs ${coloresPorTipo[tipo] || 'bg-slate-200 text-slate-700'} px-2 py-1 rounded-full">${tipo}</span>`;
  }).join("");

  articulo.className = "bg-white rounded-xl shadow p-4 text-center";
  articulo.innerHTML = `
    <img src="${imagen}" alt="${nombre}" class="w-24 h-24 mx-auto">
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
    <div class="flex gap-1 justify-center mt-2 flex-wrap">${badges}</div>
  `;
  return articulo;
}

function render(arrayPokemon) {
  contenedor.innerHTML = "";
  arrayPokemon.forEach(function (pokemon) {
    const tarjeta = crearTarjeta(pokemon);   // 2. crea el nodo
    contenedor.appendChild(tarjeta);         // 3. lo inserta en el DOM
  });
}

function adaptarPokemon(data) {
  return {
    nombre: data.name,
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos: data.types.map(t => t.type.name),  // [{type:{name:"electric"}}] → ["electric"]
    stats: data.stats.map(s => ({ nombre: s.stat.name, valor: s.base_stat }))
  };
}

let pokedex = [];   // aquí guardamos la rejilla cargada

async function obtenerPokemon(idONombre) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idONombre}`);
  console.log(response.status);
  console.log(response.ok); //FALSE --> NO HAY POKEMON
  
  if (!response.ok) {                                    // 404, 500, etc.
    throw new Error(`No se encontró "${idONombre}"`);
    // lanza un error propio
  }

  return response.json();
}

async function cargarPokedex() {
  spinner.classList.remove("hidden");
  try {
    const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
    const datos = await Promise.all(nombres.map(obtenerPokemon));
    pokedex = datos.map(adaptarPokemon);
    render(pokedex);
  } catch (error) {
    mensaje.textContent = "No se pudo cargar la Pokédex.";
    mensaje.classList.remove("hidden");
  } finally {
    spinner.classList.add("hidden");
  }
}

cargarPokedex();

const buscador = document.getElementById("buscador");
const boton = document.getElementById("btn-buscar");

async function buscarPokemon(nombre) {
  const data = await obtenerPokemon(nombre.toLowerCase());   // reusa obtenerPokemon de HU1
  return adaptarPokemon(data);
}

function capturar(pokemon) {
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);
    // hace crecer tu colección
  }
  render(pokedex);           // vuelve la colección completa, ya con el nuevo
  buscador.value = "";
}

// muestra la tarjeta del Pokémon encontrado
function mostrarResultado(pokemon) {
  contenedor.innerHTML = "";
  const tarjeta = crearTarjeta(pokemon);
  // estadísticas (solo en el resultado de búsqueda)
  const stats = document.createElement("div");
  stats.className = "mt-2 text-left text-xs space-y-1";
  stats.innerHTML = pokemon.stats.map(s => `<div class="flex justify-between"><span class="capitalize">${s.nombre}</span><span class="font-semibold">${s.valor}</span></div>`).join("");
  tarjeta.appendChild(stats);

  const boton = document.createElement("button");
  boton.textContent = "⚡ Capturar";
  boton.className = "mt-2 w-full bg-yellow-400 font-semibold rounded-lg py-1 hover:bg-yellow-500";
  boton.addEventListener("click", () => capturar(pokemon));
  tarjeta.appendChild(boton);
  // el botón SOLO en el resultado
  contenedor.appendChild(tarjeta);
}

async function mostrarBusqueda(nombre) {
  mensaje.classList.add("hidden"); 
  spinner.classList.remove("hidden");
  try {
    const pokemon = await buscarPokemon(nombre);
    //Me lo trae de la API y luego lo limpia
    mostrarResultado(pokemon);
  } catch (error) {
    mensaje.classList.remove("hidden"); 
    mensaje.textContent = error.message;
  } finally {
    spinner.classList.add("hidden");
  }
}

boton.addEventListener("click", function () {
  //LOGICA DE BUSQUEDA
  const nombre = buscador.value.trim();
  if (nombre !== "") {
    mostrarBusqueda(nombre);
  }
});

// Buscar también con Enter
buscador.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    //LOGICA DE BUSQUEDA
    const nombre = buscador.value.trim();
    if (nombre !== "") {
      mostrarBusqueda(nombre);
    }
  }
});

let offset = 0;   // desde qué Pokémon empezamos

async function cargarMas() {
  // ?limit (cuántos) y ?offset (desde dónde) = parámetros de consulta
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${offset}`);
  const lista = await respuesta.json();   // { results: [{ name, url }, ...] }

  // cada item trae solo name + url → pide el detalle de cada uno en paralelo
  const datos = await Promise.all(
    lista.results.map(item => fetch(item.url).then(r => r.json()))
  );
  
  datos.map(adaptarPokemon).forEach(function (pokemon) {
    if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
      pokedex.push(pokemon);   // sin duplicar
    }
  });
  
  offset += 12;     // la próxima vez, la siguiente página
  render(pokedex);
}

document.getElementById("cargar-mas").addEventListener("click", cargarMas);