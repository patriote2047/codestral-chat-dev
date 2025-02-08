'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import GroupMenu1 from './menus/GroupMenu1';
import GroupMenu2 from './menus/GroupMenu2';
import GroupMenu3 from './menus/GroupMenu3';

// Import des scripts de commandes
import displaySimpleCommandList from './menus/scripts/GroupMenu1/id-11/cmd-simple';
import displayFullCommandList from './menus/scripts/GroupMenu1/id-11/cmd-liste';
import displayCommandDescriptions from './menus/scripts/GroupMenu1/id-11/cmd-desc';
import commandManager from './menus/scripts/GroupMenu1/id-11/cmd-ajout';
import { updateCommandOutput } from '../../../../components/sections/Main/preview/CommandsPreview';

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

    const captureOutput = (callback) => {
        const oldConsoleLog = console.log;
        let output = [];
        
        console.log = (...args) => {
            output.push(args.join(' '));
        };
        
        callback();
        
        console.log = oldConsoleLog;
        return output.join('\n');
    };

    const handleScriptExecution = (groupId, itemId) => {
        // Logique pour le groupe SCANNER (GroupMenu1)
        if (groupId === 1) {
            let output;
            switch(itemId) {
                // COMMANDES
                case 111: // COMMANDES SIMPLES
                    output = captureOutput(() => displaySimpleCommandList());
                    updateCommandOutput(output);
                    return;
                case 112: // TOUTES LES COMMANDES
                    output = captureOutput(() => displayFullCommandList());
                    updateCommandOutput(output);
                    return;
                case 113: // VOIR LES DESCRIPTIONS
                    output = captureOutput(() => displayCommandDescriptions());
                    updateCommandOutput(output);
                    return;
                case 114: // AJOUTER UNE DESCRIPTION
                    output = captureOutput(() => 
                        commandManager.add('nouvelle-commande', 'Description de la nouvelle commande')
                    );
                    updateCommandOutput(output);
                    return;
                
                // ANALYSER
                case 121: return executeScript('analyser/syntaxe');
                case 122: return executeScript('analyser/structure');
                case 123: return executeScript('analyser/erreurs');
                
                // LIRE
                case 131: return executeScript('lire/contenu');
                case 132: return executeScript('lire/metadata');
                case 133: return executeScript('lire/logs');
                
                // EXPLORER
                case 141: return executeScript('explorer/arborescence');
                case 142: return executeScript('explorer/recherche');
                case 143: return executeScript('explorer/filtres');
            }
        }
        // Logique pour le groupe LISTER
        else if (groupId === 2) {
            switch(itemId) {
                // CONFIG
                case 211: return executeScript('config/general');
                case 212: return executeScript('config/avance');
                case 213: return executeScript('config/securite');
                
                // DOSSIER
                case 221: return executeScript('dossier/creer');
                case 222: return executeScript('dossier/deplacer');
                case 223: return executeScript('dossier/copier');
                
                // FICHIER
                case 231: return executeScript('fichier/nouveau');
                case 232: return executeScript('fichier/editer');
                case 233: return executeScript('fichier/supprimer');
                
                // FONCTIONS
                case 241: return executeScript('fonctions/importer');
                case 242: return executeScript('fonctions/exporter');
                case 243: return executeScript('fonctions/compiler');
            }
        }
        // Logique pour le groupe MCP
        else if (groupId === 3) {
            switch(itemId) {
                // CONTROLE
                case 311: return executeScript('mcp/controle/demarrer');
                case 312: return executeScript('mcp/controle/arreter');
                case 313: return executeScript('mcp/controle/pause');
                
                // GESTION
                case 321: return executeScript('mcp/gestion/ajouter');
                case 322: return executeScript('mcp/gestion/supprimer');
                case 323: return executeScript('mcp/gestion/modifier');
                
                // SYSTEME
                case 331: return executeScript('mcp/systeme/update');
                case 332: return executeScript('mcp/systeme/backup');
                case 333: return executeScript('mcp/systeme/restore');
            }
        }
    };

    const executeScript = (scriptPath) => {
        console.log(`Exécution du script: ${scriptPath}`);
        // Ici, on peut ajouter la logique pour exécuter les scripts
        // Par exemple, faire un appel API, exécuter une commande, etc.
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