/**
 * @typedef {Object} SubItem
 * @property {number} id - Identifiant unique du sous-item
 * @property {string} name - Nom du sous-item
 */

/**
 * @typedef {Object} MenuItem
 * @property {number} id - Identifiant unique de l'item
 * @property {string} name - Nom de l'item
 * @property {SubItem[]} subItems - Liste des sous-items
 */

/**
 * @typedef {Object} GroupMenuProps
 * @property {boolean} isActive - État d'activation du menu
 * @property {function} onItemClick - Gestionnaire de clic sur un item
 * @property {number} activeItemId - ID de l'item actif
 * @property {number} expandedItem - ID de l'item déplié
 * @property {function} onExpand - Gestionnaire d'expansion d'un item
 */

export {}; 