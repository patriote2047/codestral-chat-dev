'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import GroupMenu1 from './menus/GroupMenu1';
import GroupMenu2 from './menus/GroupMenu2';
import GroupMenu3 from './menus/GroupMenu3';

// Import des scripts de commandes
import { displaySimpleCommandList } from './menus/GroupMenu1/scripts/commands/simple';
import { displayFullCommandList } from './menus/GroupMenu1/scripts/commands/list';



const GroupList = () => {
    const [activeItems, setActiveItems] = useState({});
    const [expandedItems, setExpandedItems] = useState({});
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setActiveItems({});
                setExpandedItems({});
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const updatePreview = (data) => {
        console.log('Envoi des données au Preview:', data);
        const event = new CustomEvent('previewUpdate', { detail: data });
        window.dispatchEvent(event);
    };

    const handleScriptExecution = async (groupId, itemId) => {
        console.log('Exécution du script:', { groupId, itemId });
        
        try {
            let result;
            
            // Groupe SCANNER (GroupMenu1)
            if (groupId === 1) {
                switch(itemId) {
                    case 111: // VOIR COMMANDES SIMPLES
                        result = await displaySimpleCommandList();
                        break;
                    case 112: // VOIR TOUTES LES COMMANDES
                        result = await displayFullCommandList();
                        break;
                    case 113: // VOIR LES DESCRIPTIONS
                        result = await displayCommandDescriptions();
                        break;
                    case 114: // AJOUTER UNE DESCRIPTION
                        result = await commandManager.add('nouvelle-commande', 'Description de la nouvelle commande');
                        break;
                    default:
                        result = { 
                            type: 'info', 
                            content: 'Fonctionnalité en cours de développement...' 
                        };
                }
            }
            // Groupe LISTER (GroupMenu2)
            else if (groupId === 2) {
                result = {
                    type: 'info',
                    content: 'Fonctionnalité en cours de développement...'
                };
            }
            // Groupe MCP (GroupMenu3)
            else if (groupId === 3) {
                result = {
                    type: 'info',
                    content: 'Fonctionnalité en cours de développement...'
                };
            }

            console.log('Résultat de l\'exécution:', result);
            updatePreview(result);
        } catch (error) {
            console.error('Erreur lors de l\'exécution:', error);
            updatePreview({
                type: 'error',
                content: error.message
            });
        }
    };

    const handleItemClick = (groupId, itemId, event) => {
        event.stopPropagation();
        setActiveItems(prev => ({
            ...prev,
            [groupId]: prev[groupId] === itemId ? null : itemId
        }));
        handleScriptExecution(groupId, itemId);
    };

    const handleExpand = (groupId, itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [groupId]: itemId
        }));
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.groupList}>
                <GroupMenu1 
                    onItemClick={handleItemClick}
                    activeItemId={activeItems[1]}
                    expandedItem={expandedItems[1]}
                    onExpand={(itemId) => handleExpand(1, itemId)}
                />
                <GroupMenu2 
                    onItemClick={handleItemClick}
                    activeItemId={activeItems[2]}
                    expandedItem={expandedItems[2]}
                    onExpand={(itemId) => handleExpand(2, itemId)}
                />
                <GroupMenu3 
                    onItemClick={handleItemClick}
                    activeItemId={activeItems[3]}
                    expandedItem={expandedItems[3]}
                    onExpand={(itemId) => handleExpand(3, itemId)}
                />
            </div>
        </div>
    );
};

export default GroupList; 