// 1. Datos iniciales del proyecto
// Logro Adicional de anterior entrega
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
let pokedex = [];   // aquí guardamos la rejilla cargada
let offset = 0;     // desde qué Pokémon empezamos (HU5)

// 2. Selección de elementos del DOM
const contenedor = document.getElementById("resultado");
const buscador = document.getElementById("buscador");
const boton = document.getElementById("btn-buscar");

// 3. HU3: Función para crear la tarjeta de un Pokémon de forma segura
// HU4: Extendida para mapear las estadísticas del JSON anidado
function adaptarPokemon(data){
  return {
    nombre: data.name,
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos: data.types?.map(t => t.type.name) ?? [],
    stats: data.stats?.map(s => ({ nombre: s.stat.name, valor: s.base_stat })) ?? [] // ← HU4
  }
}

function crearTarjeta(pokemon) {
  const { nombre, imagen, tipos } = pokemon;

  const [principal] = tipos ?? []; // Desestructuración con valor por defecto
  
  // Operador ?? por si falta la imagen (Blindaje)
  const img = imagen ?? "https://via.placeholder.com/96?text=?";
  
  // Operador ?. por si el array 'tipos' no existe en el objeto
  const badges = tipos?.map(function (tipo) {
    return `<span class="text-xs ${coloresPorTipo[tipo] || 'bg-slate-200 text-slate-700'} px-2 py-1 rounded-full">${tipo}</span>`;
  }).join("") ?? "";

  const articulo = document.createElement("article");
  articulo.className = "bg-white rounded-xl shadow p-4 text-center border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer";
  articulo.innerHTML = `
    <img src="${img}" alt="${nombre}" class="w-24 h-24 mx-auto">
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
    <p class="text-xs text-slate-400 capitalize mt-1 mb-2">Principal: ${principal ?? 'Ninguno'}</p>
    <div class="flex gap-1 justify-center mt-2 flex-wrap">${badges}</div>
  `;
  
  return articulo;
}

// 4. HU2: El patrón Render (Limpia, procesa e inserta)
function render(lista) {
  contenedor.innerHTML = ""; // 1. limpia lo anterior
  lista.forEach(function (pokemon) {
    const tarjeta = crearTarjeta(pokemon); // 2. crea el nodo
    contenedor.appendChild(tarjeta);       // 3. lo inserta en el DOM
  });
}

async function obtenerPokemon(idONombre) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idONombre}`);
  return response.json();
}

async function cargarPokedex() {
  // HU1: Colocamos el spinner de carga antes de arrancar
  contenedor.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="inline-block w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2"></div>
      <p class="text-slate-500 font-medium">Cargando…</p>
    </div>
  `;
  
  const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar"];
  const datos = await Promise.all(nombres.map(obtenerPokemon));   
  pokedex = datos.map(adaptarPokemon);
  offset = 6; // Seteamos el offset inicial tras cargar los primeros 6
  render(pokedex);
}

async function buscarPokemon(nombre) {
  const data = await obtenerPokemon(nombre.toLowerCase());   
  return adaptarPokemon(data);
}

function capturar(pokemon) {
  if (!pokedex.some(p => p.nombre === pokemon.nombre)) {
    pokedex.push(pokemon);   // hace crecer tu colección
  }
  render(pokedex);           // vuelve la colección completa, ya con el nuevo
  buscador.value = "";
}

// HU3 y HU4: Muestra el resultado de búsqueda con estadísticas y botón de captura sin alterar crearTarjeta
function mostrarResultado(pokemon) {
  const tarjeta = crearTarjeta(pokemon);

  // HU4: estadísticas (solo en el resultado de búsqueda)
  const stats = document.createElement("div");
  stats.className = "mt-3 pt-2 border-t border-slate-100 text-left text-xs space-y-1";
  stats.innerHTML = pokemon.stats.map(s => `
    <div class="flex justify-between"><span class="capitalize text-slate-500">${s.nombre}</span><span class="font-semibold text-slate-700">${s.valor}</span></div>
  `).join("");
  tarjeta.appendChild(stats);

  // HU3: botón capturar (solo en el resultado de búsqueda)
  const botonCapturar = document.createElement("button");
  botonCapturar.textContent = "⚡ Capturar";
  botonCapturar.className = "mt-3 w-full bg-yellow-400 font-semibold rounded-lg py-1.5 hover:bg-yellow-500 transition-colors text-sm";
  botonCapturar.addEventListener("click", () => capturar(pokemon));
  tarjeta.appendChild(botonCapturar);

  contenedor.innerHTML = "";
  contenedor.appendChild(tarjeta);
}

async function mostrarBusqueda(nombre) {
  try {
    const pokemon = await buscarPokemon(nombre);
    mostrarResultado(pokemon);
  } catch (error) {
    contenedor.innerHTML = `<p class="col-span-full text-center text-red-600 font-bold py-6">No se encontró ningún Pokémon con ese nombre.</p>`;
  }
}

// 5. HU4: Filtrar en vivo con el buscador (Reemplazado por búsqueda real en la API en HU2)
boton.addEventListener("click", function () {
  const nombre = buscador.value.trim();
  if (nombre !== "") mostrarBusqueda(nombre);
});

buscador.addEventListener("keydown", function (event) {
  if (event.key === "Enter") boton.click();
});

// HU5: Cargar más con parámetros de consulta (?limit y ?offset)
async function cargarMas() {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${offset}`);
  const lista = await respuesta.json();   

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

// 6. Ejecución inicial para pintar todos los Pokémon al cargar la página
cargarPokedex();