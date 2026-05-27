import fs from 'fs';

export default function GravarLog(msg: string) {
    
    const data = new Date().toLocaleString('sv-SE',{timeZone: 'America/Maceio'});

    const path : string = './logs/log_error.txt';

    const logEntry : string = `${data} - ${msg}\n\n`;

    fs.appendFileSync(path, logEntry, 'utf-8');
}