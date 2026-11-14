import type { StorageInterface } from 'ocache'
import { createMemoryStorage } from 'ocache'

let storage: StorageInterface | undefined

export function useCacheStorage(): StorageInterface {
  return storage ??= createMemoryStorage()
}
