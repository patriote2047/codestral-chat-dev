import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import chalk from 'chalk';

function formatTime(date, options = {}) {
    return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: options.showSeconds ? '2-digit' : undefined,
        hour12: false,
        timeZone: options.timeZone || 'Europe/Paris'
    }).format(date);
}

function formatDate(date, options = {}) {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: options.shortDate ? undefined : 'long',
        year: 'numeric',
        month: options.shortDate ? '2-digit' : 'long',
        day: 'numeric'
    }).format(date);
}

function getTimeZoneInfo(timeZone = 'Europe/Paris') {
    const date = new Date();
    const timeZoneOffset = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(timeZoneOffset / 60));
    const offsetMinutes = Math.abs(timeZoneOffset % 60);
    const offsetSign = timeZoneOffset > 0 ? '-' : '+';
    
    return {
        name: timeZone,
        offset: `UTC${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`,
        abbreviation: new Intl.DateTimeFormat('fr-FR', {
            timeZoneName: 'short',
            timeZone
        }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || ''
    };
}

function showTime(options = {}) {
    const now = new Date();
    const timeZoneInfo = getTimeZoneInfo(options.timeZone);
    
    let output = '';
    output += chalk.blue('\n🕒 Heure actuelle\n\n');
    output += chalk.yellow('  ' + formatDate(now, options) + '\n');
    output += chalk.green('  ' + formatTime(now, options) + '\n');
    output += chalk.gray('  ' + timeZoneInfo.name + '\n');
    output += chalk.gray('  ' + timeZoneInfo.offset + ' (' + timeZoneInfo.abbreviation + ')\n\n');
    
    console.log(output);
}

function getCurrentTime(args) {
    const now = new Date();
    
    // Format simple HH:MM
    if (args.includes('--short')) {
        return format(now, 'HH:mm');
    }
    
    // Format avec secondes
    if (args.includes('--seconds')) {
        return format(now, 'HH:mm:ss');
    }
    
    // Format complet avec date
    if (args.includes('--full')) {
        return format(now, "EEEE d MMMM yyyy'\n'HH:mm:ss", { locale: fr });
    }

    // Format par défaut
    return format(now, 'HH:mm:ss');
}

// Récupérer les arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('\n📋 Utilisation:\n');
    console.log('  node show-time.mjs [option]\n');
    console.log('Options:');
    console.log('  --short    Affiche l\'heure au format court (HH:MM)');
    console.log('  --seconds  Affiche l\'heure avec les secondes');
    console.log('  --full     Affiche la date et l\'heure complètes\n');
    process.exit(0);
}

// Afficher l'heure selon le format demandé
const time = getCurrentTime(args);
console.log(time);

// Analyser les arguments de la ligne de commande
const options = {
    showSeconds: args.includes('--seconds') || args.includes('-s'),
    shortDate: args.includes('--short') || args.includes('-S'),
    timeZone: args.find(arg => arg.startsWith('--tz='))?.split('=')[1] || 'Europe/Paris'
};

// Si aucun argument spécifique n'est fourni, afficher l'heure complète
if (args.length === 0) {
    showTime(options);
} 