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
const nombres = ["bulbasaur", "charmander", "squirtle", "pikachu", "jigglypuff", "gengar", "mew", "eevee"];
let pokedex = [];   // aquí guardamos la rejilla cargada

// 2. Selección de elementos del DOM
const contenedor = document.getElementById("resultado");
const buscador = document.getElementById("buscador");

// 3. HU3: Función para crear la tarjeta de un Pokémon de forma segura
function adaptarPokemon(data){
  return {
    nombre: data.name,
    imagen: data.sprites?.front_default ?? "https://via.placeholder.com/96?text=?",
    tipos: data.types?.map(t => t.type.name) ?? []
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

// 5. HU4: Filtrar en vivo con el buscador
buscador.addEventListener("input", function () {
  const texto = buscador.value.toLowerCase();
  const filtrados = pokedex.filter(p => p.nombre.includes(texto));
  render(filtrados); // Re-renderiza con la lista filtrada
});

// 6. Ejecución inicial para pintar todos los Pokémon al cargar la página
contenedor.innerHTML = `
  <div class="col-span-full text-center py-12">
    <div class="inline-block w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2"></div>
    <p class="text-slate-500 font-medium">Cargando…</p>
  </div>
`;

const promesas = nombres.map(function (nombre) {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`)
    .then(function (response) {
      return response.json(); 
    });
});

Promise.all(promesas)
  .then(function (datosCrudos) {
    pokedex = datosCrudos.map(adaptarPokemon);
    render(pokedex);
  })
  .catch(function () {
    contenedor.innerHTML = `<p class="col-span-full text-center text-red-600 font-bold py-6">No se pudo cargar.</p>`;
  });