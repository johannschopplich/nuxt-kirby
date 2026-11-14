import type { StorageInterface } from 'ocache'
import { useStorage } from 'nitropack/runtime'
import { createBlobStorage } from 'ocache'

/** Every key starts with the `server.storage` base, so the entries land in the mount it names. */
export function useCacheStorage(): StorageInterface {
  const nitroStorage = useStorage()

  return createBlobStorage({
    get: key => nitroStorage.getItemRaw(key),
    set: (key, value, opts) => value === null
      ? nitroStorage.removeItem(key)
      : nitroStorage.setItemRaw(key, value, opts),
  })
}
