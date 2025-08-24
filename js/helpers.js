import {defaultIcon, visitIcon, homeIcon, jobIcon, parkIcon} from "./ui.js";

// * Not'un status değerine göre icon belirle
export function getNoteIcon(status) {
  switch (status) {
    case "visit":
      return visitIcon;
    case "home":
      return homeIcon;
    case "job":
      return jobIcon;
    case "park":
      return parkIcon;
    default:
      return defaultIcon;
  }
}

// * Tarih verisini formatlayan fonksiyon
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("tr", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// * Status değerini Türkçe yapan fonksiyon
export const getStatus = (status) => {
  switch (status) {
    case "visit":
      return "Ziyaret";

    case "park":
      return "Park Yeri";

    case "home":
      return "Ev";

    case "job":
      return "İş";

    default:
      return "Tanımsız";
  }

  // ? export const statusObj = {
  // ?  visit: "Ziyaret",
  // ?  park: "Park Yeri",
  // ?  home: "Ev",
  // ?  job: "İş"
  // ? }
  // ! Her iki fonksiyonda status değerini değiştirmek için kullanılabilir. Tek fark statusObj de default değeri tanımlayamayız. Bunun çözümü de fonksiyonu çağırdığımız yerde || "tanımsız" yazarak çözeriz. Bu fonksiyonu statusObj[note.status] şeklinde çağırırız.
  // ? getStatus fonksiyonunda ise getStatus(note.status) şeklinde çağırırız.
};
