export function formatPhotonAddress(p) {
  return [
    p.name,
    p.street,
    p.city || p.town || p.village,
    p.state,
    p.country
  ]
    .filter(Boolean)
    .join(", ")
}

export async function photonSearch(query) {
    const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await res.json();
    return data.features;
}

export async function photonReverse(lat, lng) {
    const res = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`
    )
    const data = await res.json();

    if (!data.features.length) return "";

    return formatPhotonAddress(data.features[0].properties);
}