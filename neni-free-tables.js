const FormData = require('form-data');
const fetch = require('node-fetch');
const prompts = require('prompts');
const chalk = require('chalk');

(async () => {
    console.log(chalk.bold.underline('Wann suchst du einen freien Tisch im Neni Berlin?'))

    const inputs = await prompts([
        {
            type: 'number',
            name: 'year',
            message: 'Jahr:',
            initial: new Date().getFullYear()
        },
        {
            type: 'number',
            name: 'month',
            message: 'Monat:',
            initial: new Date().getMonth() + 1
        },
        {
            type: 'number',
            name: 'startDay',
            message: 'Frühster Tag:',
            initial: new Date().getDate()
        },
        {
            type: 'number',
            name: 'endDay',
            message: 'Spätester Tag:',
            initial: new Date().getDate() + 1
        },
        {
            type: 'number',
            name: 'startTime',
            message: 'Frühste Stunde:',
            initial: 10
        },
        {
            type: 'number',
            name: 'endTime',
            message: 'Späteste Stunde:',
            initial: 22
        }
    ]);

    const { year, month, startDay, endDay, startTime, endTime } = inputs;

    const promises = [];
    const freeTimes = [];

    for (let day = startDay; day <= endDay; day++) {
        for (let hour = startTime; hour <= endTime; hour++) {
            let formData = new FormData();
            formData.append('startDate', `${day}.${month}.${year}`);
            formData.append('resTime', hour + ':00');
            formData.append('step', '1');
            formData.append('partySize', '4');
            formData.append('submit', 'Anfrage senden');

            promises.push(
                fetch("https://www.neniberlin.de/", {
                    body: formData,
                    method: "post"
                })
                    .then(response => response.text())
                    .then(text => {
                        if (!text.includes('Sorry')) {
                            freeTimes.push(`${year}-${month}-${day}, ${hour}:00 Uhr`);
                        };
                    })
            );
        }
    }

    await Promise.all(promises);
    console.log()

    if (freeTimes.length === 0) {
        console.log(chalk.red.bold('Es konnten keine freien Tische gefunden werden.'))
    } else {
        console.log(chalk.green.bold.underline('Freie Zeiten:'))
        for (const time of freeTimes.sort()) {
            console.log(chalk.green(time));
        }
    }
})();

