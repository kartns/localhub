import StorageCard from './StorageCard'

export default function StorageList({ storages, onDelete, onView, onEdit, refreshKey, isPublic = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Brands list">
      {storages.map((storage, index) => (
        <StorageCard
          key={storage.id}
          storage={storage}
          onDelete={onDelete}
          onView={onView}
          onEdit={onEdit}
          refreshKey={refreshKey}
          isPublic={isPublic}
          animationDelay={index * 100}
        />
      ))}
    </div>
  )
}
