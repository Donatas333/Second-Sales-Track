import { nanoid } from 'nanoid'

const now = new Date()
const daysAgo = (d) => new Date(now - d * 86400000).toISOString()
const daysFromNow = (d) => new Date(now.getTime() + d * 86400000).toISOString()

export const seedClients = [
  {
    id: 'c001',
    companyName: 'UAB Autoaibė',
    contactName: 'Tomas Kazlauskas',
    city: 'Panevėžys',
    phone: '+370 614 23456',
    notes: 'Didžiausias klientas Panevėžyje. Perka dideliais kiekiais, ypač filtrus ir stabdžius.',
    createdAt: daysAgo(90),
  },
  {
    id: 'c002',
    companyName: 'Servisas Kaunas',
    contactName: 'Rimas Petrauskas',
    city: 'Kaunas',
    phone: '+370 622 34567',
    notes: 'Specializuojasi BMW ir Mercedes. Vertina greitus pristatymus.',
    createdAt: daysAgo(60),
  },
  {
    id: 'c003',
    companyName: 'Autokurtas Vilnius',
    contactName: 'Darius Jonušas',
    city: 'Vilnius',
    phone: '+370 698 45678',
    notes: 'Naujas klientas. Daug dirba su VW grupės automobiliais.',
    createdAt: daysAgo(30),
  },
  {
    id: 'c004',
    companyName: 'UAB Automas',
    contactName: 'Vilius Stankus',
    city: 'Šiauliai',
    phone: '+370 612 56789',
    notes: 'Šeimyninis verslas. Lankosi kartą per mėnesį.',
    createdAt: daysAgo(45),
  },
  {
    id: 'c005',
    companyName: 'Moto Servisas',
    contactName: 'Paulius Grigas',
    city: 'Kaunas',
    phone: '+370 689 67890',
    notes: 'Mažas servisas, bet reguliarus klientas. Domisi Toyota dalimis.',
    createdAt: daysAgo(20),
  },
]

export const seedInteractions = [
  {
    id: 'i001',
    clientId: 'c001',
    type: 'visit',
    date: daysAgo(1),
    summary: 'Aptarėme naujų stabdžių kaladėlių poreikį BMW servisui. Tomas pasakė, kad reikia greito pristatymo. Pateikiau kainas Brembo ir Textar gamintojams.',
    products: [
      { id: 'p001', name: 'Stabdžių kaladėlės priekinės', brand: 'Brembo', sku: 'BRE-P28075', vehicle: 'BMW F30' },
      { id: 'p007', name: 'Stabdžių kaladėlės galinės', brand: 'Textar', sku: 'TEX-2380301', vehicle: 'BMW E90' },
    ],
    nextAction: 'Atsiųsti kainų pasiūlymą',
    nextActionDate: daysFromNow(1),
    createdAt: daysAgo(1),
  },
  {
    id: 'i002',
    clientId: 'c002',
    type: 'phone',
    date: daysAgo(2),
    summary: 'Rimas paskambino dėl amortizatorių Audi A4. Reikia 2 komplektų. Patvirtinau, kad turime Sachs sandėlyje.',
    products: [
      { id: 'p032', name: 'Amortizatorius priekinis', brand: 'Monroe', sku: 'MON-G8090', vehicle: 'Audi A4 B8' },
    ],
    nextAction: 'Pristatyti užsakymą',
    nextActionDate: daysAgo(1),
    createdAt: daysAgo(2),
  },
  {
    id: 'i003',
    clientId: 'c003',
    type: 'visit',
    date: daysAgo(3),
    summary: 'Pirmas vizitas pas naują klientą. Darius domisi VW Golf VII dalimis. Pateikiau katalogą. Labai sudomino Contitech paskirstymo diržai.',
    products: [
      { id: 'p050', name: 'Paskirstymo diržo komplektas', brand: 'Gates', sku: 'GAT-K035649XS', vehicle: 'VW Passat B7' },
      { id: 'p017', name: 'Alyvos filtras', brand: 'Mann', sku: 'MAN-HU712X', vehicle: 'VW Golf VII' },
    ],
    nextAction: 'Išsiųsti katalogą',
    nextActionDate: daysAgo(2),
    createdAt: daysAgo(3),
  },
  {
    id: 'i004',
    clientId: 'c004',
    type: 'email',
    date: daysAgo(4),
    summary: 'Išsiunčiau kainų pasiūlymą filtrų komplektui. Vilius prašė discount nuo 50 vienetų užsakymo.',
    products: [
      { id: 'p015', name: 'Alyvos filtras', brand: 'Mann', sku: 'MAN-HU816X', vehicle: 'BMW F30' },
      { id: 'p021', name: 'Oro filtras', brand: 'Mann', sku: 'MAN-CF1543', vehicle: 'BMW F30' },
      { id: 'p029', name: 'Saloono filtras', brand: 'Mahle', sku: 'MAH-LAK336', vehicle: 'BMW F30' },
    ],
    nextAction: 'Paskambinti',
    nextActionDate: daysFromNow(2),
    createdAt: daysAgo(4),
  },
  {
    id: 'i005',
    clientId: 'c005',
    type: 'visit',
    date: daysAgo(5),
    summary: 'Paulius domisi Toyota Avensis filtrais ir stabdžiais. Aptarėme sezoninius pirkimus. Jis planuoja pirkti didelius kiekius prieš vasarą.',
    products: [
      { id: 'p019', name: 'Alyvos filtras', brand: 'Mahle', sku: 'MAH-OX153D', vehicle: 'Toyota Avensis' },
      { id: 'p008', name: 'Stabdžių kaladėlės priekinės', brand: 'Ferodo', sku: 'FER-FDB1641', vehicle: 'Toyota Avensis' },
    ],
    nextAction: 'Paruošti pasiūlymą',
    nextActionDate: daysFromNow(5),
    createdAt: daysAgo(5),
  },
  {
    id: 'i006',
    clientId: 'c001',
    type: 'visit',
    date: now.toISOString(),
    summary: 'Šiandienis vizitas. Aptarėme naują užsakymą BMW stabdžių diskams. Tomas patenkinas ankstesnio pristatymo kokybe.',
    products: [
      { id: 'p009', name: 'Stabdžių diskas priekinis', brand: 'Zimmermann', sku: 'ZIM-150290720', vehicle: 'BMW F30' },
      { id: 'p063', name: 'Akumuliatorius 70Ah', brand: 'Bosch', sku: 'BOS-S4E070', vehicle: 'BMW F30' },
    ],
    nextAction: 'Išsiųsti sąskaitą',
    nextActionDate: daysFromNow(3),
    createdAt: now.toISOString(),
  },
]
