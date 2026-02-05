import StorageCard from './StorageCard'

export default function StorageList({ storages, onDelete, onView, onEdit, refreshKey }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storages.map((storage, index) => (
        <StorageCard
          key={storage.id}
          storage={storage}
          onDelete={onDelete}
          onView={onView}
          onEdit={onEdit}
          refreshKey={refreshKey}
          animationDelay={index * 100}
        />
      ))}
    </div>
  )
}
