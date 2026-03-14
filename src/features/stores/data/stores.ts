export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  hours: string;
  statusLabel: string;
  opensAt: string;
  closesAt: string;
  services: string[];
  lat: number;
  lng: number;
}

export const storeLocations: StoreLocation[] = [
  {
    id: "downtown-freshmart",
    name: "Downtown FreshMart",
    address: "123 Market Street, Financial District",
    city: "New York, NY",
    postalCode: "10001",
    phone: "+1 (555) 123-4567",
    hours: "Mon-Sun: 7am - 11pm",
    statusLabel: "Open Now",
    opensAt: "07:00",
    closesAt: "23:00",
    services: ["Pickup", "Express delivery", "Fresh bakery"],
    lat: 40.7506,
    lng: -73.9972,
  },
  {
    id: "uptown-freshmart",
    name: "Uptown FreshMart",
    address: "456 North Avenue, Harlem",
    city: "New York, NY",
    postalCode: "10027",
    phone: "+1 (555) 987-6543",
    hours: "Mon-Sun: 8am - 10pm",
    statusLabel: "Open Now",
    opensAt: "08:00",
    closesAt: "22:00",
    services: ["Pickup", "Organic produce", "Pharmacy essentials"],
    lat: 40.8153,
    lng: -73.9583,
  },
  {
    id: "westside-freshmart",
    name: "Westside FreshMart",
    address: "789 Boulevard Road, Upper West Side",
    city: "New York, NY",
    postalCode: "10024",
    phone: "+1 (555) 456-7890",
    hours: "Mon-Sat: 7am - 10pm, Sun: 8am - 9pm",
    statusLabel: "Closes at 10pm",
    opensAt: "07:00",
    closesAt: "22:00",
    services: ["Pickup", "Prepared meals", "Bulk pantry"],
    lat: 40.7861,
    lng: -73.9777,
  },
  {
    id: "brooklyn-freshmart",
    name: "Brooklyn FreshMart",
    address: "88 Atlantic Avenue, Brooklyn Heights",
    city: "Brooklyn, NY",
    postalCode: "11201",
    phone: "+1 (555) 321-2288",
    hours: "Mon-Sun: 7am - 11pm",
    statusLabel: "Open Now",
    opensAt: "07:00",
    closesAt: "23:00",
    services: ["Pickup", "Curbside", "Household essentials"],
    lat: 40.6905,
    lng: -73.9967,
  },
];
