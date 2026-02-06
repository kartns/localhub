import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons not showing in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapComponent({ storages, userLocation, onStorageClick }) {
    const center = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : [storages[0]?.latitude || 51.505, storages[0]?.longitude || -0.09]; // Default fallback

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.latitude, userLocation.longitude]}
                        icon={L.icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        })}
                    >
                        <Popup>
                            You are here
                        </Popup>
                    </Marker>
                )}

                {/* Shop Markers */}
                {storages.map(storage => (
                    storage.latitude && storage.longitude && (
                        <Marker
                            key={storage.id}
                            position={[parseFloat(storage.latitude), parseFloat(storage.longitude)]}
                            icon={L.icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34],
                                shadowSize: [41, 41]
                            })}
                            eventHandlers={{
                                click: () => onStorageClick(storage),
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{storage.name}</h3>
                                    <p className="text-sm">{storage.category}</p>
                                    {storage.distance && <p className="text-xs text-gray-500">{storage.distance.toFixed(1)} km away</p>}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    )
}
