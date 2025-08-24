import {formatDate, getNoteIcon, getStatus} from "./helpers.js";
import {ui, personIcon} from "./ui.js";

// Global Değişkenler
const STATE = {
  map: null,
  layer: null,
  clickedCoords: null,
  notes: JSON.parse(localStorage.getItem("notes") || "[]"),
};

// * Kullanıcının konumuna göre haritayı yükle
window.navigator.geolocation.getCurrentPosition(
  // Konuma izin verilirse
  (e) => loadMap([e.coords.latitude, e.coords.longitude]),
  // Konuma izin verilmezse
  () => {
    loadMap([41.104187, 29.051014]);
  }
);

// ! Leaflet haritasının kurulumunu yapan fonksiyon
function loadMap(position) {
  // Haritanın kurulumu
  STATE.map = L.map("map", {zoomControl: false}).setView(position, 11);

  // Haritayı arayüze ekle
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(STATE.map);

  // Controller position
  L.control.zoom({position: "bottomright"}).addTo(STATE.map);

  // Harita üzerinde layer oluştur
  STATE.layer = L.layerGroup().addTo(STATE.map);

  // Ekrana marker bas
  const marker = L.marker(position, {icon: personIcon}).addTo(STATE.map);

  // Marker'a popup ekle
  marker.bindPopup("<b>Buradasın</b><br>");

  // Haritaya tıklama olayını için izleyici ekle
  STATE.map.on("click", onMapClick);

  renderNoteCards(STATE.notes);
  renderMarker(STATE.notes);
}

// * Haritaya tıklanınca çalışan fonksiyon
function onMapClick(e) {
  // Son tıklanılan konumu kaydet(geçici)
  STATE.clickedCoords = [e.latlng.lat, e.latlng.lng];

  // Aside alanındaki formu aktif et
  ui.aside.classList.add("add");

  // Aside alanındaki başlığı güncelle
  ui.asideTitle.textContent = "Yeni Not";
}

// Iptal butonuna tıklanınca aside alanını kapatan fonksiyon
ui.cancelButton.addEventListener("click", () => {
  ui.aside.classList.remove("add");

  ui.asideTitle.textContent = "Notlar";
});

// Ok emojisine tıklanınca aside aç/kapa
ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});

// Form gönderildiği zaman
ui.form.addEventListener("submit", (e) => {
  // Sayfa yenilemeyi engelle
  e.preventDefault();

  // Formdaki verilere eriş
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // Eğer form doldurulmadıysa kullanıcıya uyarı ver
  if (!title || !date || !status) {
    return alert("Lütfen formu doldurunuz");
  }

  // Kaydedilecek nesneyi oluştur
  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: STATE.clickedCoords,
  };

  // Yeni notu notes dizisine ekle
  STATE.notes.push(newNote);

  // Localstorage a kaydet
  localStorage.setItem("notes", JSON.stringify(STATE.notes));

  // Aside kısmının ekleme modunu kapat
  ui.aside.classList.remove("add");
  ui.asideTitle.textContent = "Notlar";

  // Notları ekrana bas
  renderNoteCards(STATE.notes);
  renderMarker(STATE.notes);
});

// Not marker larını ekrana bas
function renderMarker(notes) {
  // Haritadaki katmana daha önceden eklenmiş marker'ları temile
  STATE.layer.clearLayers();

  // Notes dizisindeki herbir not için marker ekrana bas
  notes.forEach((note) => {
    // Notun Iconunu belirleyecek fonksiyon
    const icon = getNoteIcon(note.status);
    // Marker oluştur
    const marker = L.marker(note.coords, {icon}).addTo(STATE.layer);

    // Notların başlığını popup olarak marker'a ekliyoruz
    marker.bindPopup(`<p class="popup">${note.title}</p>`);
  });
}

// Not Kartlarını ekrana bas
function renderNoteCards(notes) {
  // notes dizisindeki her elemanı dönerek bir liste elemanı oluştur
  const notesHtml = notes
    .map(
      (note) => `
        <li>
          <div>
            <h3>${note.title}</h3>
            <p>${formatDate(note.date)}</p>
            <p class="status">${getStatus(note.status)}</p>
          </div>
          <div class="icons">
            <i data-id=${note.id} id="fly-btn" class="bi bi-airplane-fill"></i>
            <i data-id=${note.id} id="trash-btn" class="bi bi-trash"></i>
          </div>
        </li>
  `
    )
    .join("");

  // Oluşturulan ntoe elemanlarını ekrana bas
  ui.noteList.innerHTML = notesHtml;

  // Trash btn'e eriş
  document.querySelectorAll("#trash-btn").forEach((btn) => {
    // Notun ID değerine eriş
    const id = +btn.dataset.id;
    // Tıklanma olayını izliyoruz
    btn.addEventListener("click", () => deleteNote(id));
  });

  // Fly btn'e eriş
  document.querySelectorAll("#fly-btn").forEach((btn) => {
    // Notun ID değerine eriş
    const id = +btn.dataset.id;
    // Tıklanma olayını izliyoruz
    btn.addEventListener("click", () => flyToNote(id));
  });
}
// Notu silen bu fonksiyon
const deleteNote = (id) => {
  // Kullanıcıda silme onayı al
  if (!confirm("Notu silmek istediğinizden")) return;

  // ID' si bilinen notu kaldır
  STATE.notes = STATE.notes.filter((note) => note.id !== id);

  // Localstorage' ı güncelle
  localStorage.setItem("notes", JSON.stringify(STATE.notes));
  renderMarker(STATE.notes);
  renderNoteCards(STATE.notes);
};

// Notu haritada gösteren fonksiyon
const flyToNote = (id) => {
  // Tıklanılan notun verilerine eriş
  const note = STATE.notes.find((note) => note.id === id);

  // Haritada göster
  STATE.map.flyTo(note.coords, 15);
};
