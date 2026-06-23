// 1. Datos iniciales del proyecto
const pokemonLocal = [
  { nombre: "bulbasaur",  imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",  tipos: ["grass", "poison"] },
  { nombre: "charmander", imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",  tipos: ["fire"] },
  { nombre: "squirtle",   imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",  tipos: ["water"] },
  { nombre: "pikachu",    imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", tipos: ["electric"] },
  { nombre: "jigglypuff", imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", tipos: ["normal", "fairy"] },
  { nombre: "gengar",     imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",  tipos: ["ghost", "poison"] },
];
// Logro Adicional
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
const nuevoPokemon ={
  nombre: "mew",
  imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png",
  tipos: ["psychic"]
}
const pokemonExtra = {
  nombre: "eevee",
  imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
  tipos: ["normal"]
}
const ampliada = [...pokemonLocal, nuevoPokemon, pokemonExtra];


// 2. Selección de elementos del DOM
const contenedor = document.getElementById("resultado");
const buscador = document.getElementById("buscador");

// 3. HU3: Función para crear la tarjeta de un Pokémon de forma segura
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
  articulo.className = "bg-white rounded-xl shadow p-4 text-center";
  articulo.innerHTML = `
    <img src="${img}" alt="${nombre}" class="w-24 h-24 mx-auto">
    <h2 class="capitalize font-bold text-slate-800 mt-2">${nombre}</h2>
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
  const filtrados = ampliada.filter(p => p.nombre.includes(texto));
  render(filtrados); // Re-renderiza con la lista filtrada
});

// 6. Ejecución inicial para pintar todos los Pokémon al cargar la página
render(ampliada);