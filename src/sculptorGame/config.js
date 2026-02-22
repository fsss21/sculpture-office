/**
 * Базовый путь к данным игры (папка public/gameData).
 * Используется для загрузки quiz JSON, изображений и звуков.
 */
export const GAME_DATA_BASE = '/gameData'

export const getDataUrl = (filename) => `${GAME_DATA_BASE}/data/${filename}`
export const getSoundUrl = (path) => path.startsWith('/') ? `${GAME_DATA_BASE}${path}` : `${GAME_DATA_BASE}/${path}`
export const getImageUrl = (path) => {
  if (!path) return ''
  return path.startsWith('/') ? `${GAME_DATA_BASE}${path}` : `${GAME_DATA_BASE}/${path}`
}
