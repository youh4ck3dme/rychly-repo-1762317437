import type { ServiceCategory } from "../types";

export const serviceCategories: ServiceCategory[] = [
  {
    nameKey: "services.categories.damske",
    subcategories: [
      {
        name: "Dámske – Strih & Styling",
        items: [
          { name: "Strih", price: "30.00 €" },
          { name: "Fúkaná (dlhé vlasy)", price: "30.00 €" },
          { name: "Fúkaná (polodlhé vlasy)", price: "20.00 €" },
          { name: "Finálny styling", price: "20.00 €" },
        ],
      },
      {
        name: "Dámske – Farbenie",
        items: [
          { name: "Farbenie + strih (odrasty)", price: "60.00 €" },
          { name: "Farbenie (odrasty)", price: "45.00 €" },
          { name: "Farbenie (celých vlasov)", price: "70.00 €" },
          { name: "Farbenie + strih (celých vlasov)", price: "90.00 €" },
        ],
      },
      {
        name: "Dámske – Balayage & Melír",
        items: [
          { name: "Balayage (celé vlasy)", price: "150.00 €" },
          { name: "Balayage (doplnenie odrastov)", price: "120.00 €" },
          { name: "Melír (odrasty)", price: "120.00 €" },
          { name: "Melír (celé vlasy)", price: "150.00 €" },
        ],
      },
      {
        name: "Dámske – Odfarbovanie & Regenerácia",
        items: [
          { name: "Čistenie odleskov", price: "100.00 €" },
          { name: "Gumovanie farby", price: "160.00 €" },
          { name: "Methamorphyc quick", price: "35.00 €" },
          { name: "Methamorphyc exclusive", price: "50.00 €" },
          { name: "Brazílsky keratín", price: "130.00 €" },
        ],
      },
      {
        name: "Dámske – Napájanie vlasov & Účesy",
        items: [
          { name: "Napojenie TAPE IN", price: "40.00 €" },
          { name: "Prepojenie TAPE IN", price: "120.00 €" },
          { name: "Copíky (braids)", price: "30.00 €" },
          { name: "Spoločenský účes", price: "40.00 €" },
        ],
      },
    ],
  },
  {
    nameKey: "services.categories.panske",
    subcategories: [
      {
        name: "Pánske – Vlasy",
        items: [
          { name: "Junior strih", price: "15.00 €" },
          { name: "Pánsky strih", price: "19.00 €" },
        ],
      },
      {
        name: "Pánske – Brada & Kombinácie",
        items: [
          { name: "Úprava brady", price: "12.00 €" },
          { name: "Vlasy + brada", price: "27.00 €" },
          { name: "Pánsky špeciál f", price: "40.00 €" },
          { name: "Pánsky špeciál", price: "50.00 €" },
        ],
      },
      {
        name: "Pánske – Farba",
        items: [
          { name: "Trvalá ondulácia", price: "40.00 €" },
          { name: "Zosvetľovanie vlasov", price: "40.00 €" },
          { name: "Farbenie brady", price: "10.00 €" },
          { name: "Tónovanie šedín", price: "10.00 €" },
        ],
      },
      {
        name: "Pánske – Doplnkové služby",
        items: [
          { name: "Depilácia nosa", price: "5.00 €" },
          { name: "Depilácia uší", price: "5.00 €" },
          { name: "Ušné sviečky", price: "10.00 €" },
          { name: "Peeling / Čierna maska", price: "10.00 €" },
        ],
      },
    ],
  },
];
