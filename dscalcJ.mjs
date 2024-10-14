function getValues() {
    const {
        inputMontant,
        inputTaux,
        inputAnnee,
        inputPayes
    } = window;
    let montant = Math.abs(inputMontant.valueAsNumber) || 0,
        annee = Math.abs(inputAnnee.valueAsNumber) || 0,
        mois = annee * 12 || 1,
        taux = Math.abs(inputTaux.valueAsNumber) || 0,
        tauxMensuel = taux / 100 / 12,
        payes = Math.abs(inputPayes.valueAsNumber) || 0;
    return {
        montant,
        annee,
        mois,
        taux,
        tauxMensuel,
        payes
    }
}

let calculMensualite = function(montant, tauxMensuel, mois) {
    let remboursementMensuel;
    if (tauxMensuel) {
        remboursementMensuel = montant * tauxMensuel /
            (1 - (Math.pow(1 / (1 + tauxMensuel), mois)));
    } else {
        remboursementMensuel = montant / mois;
    }

    return remboursementMensuel;
}

let calculAmortissement = (montant, tauxMensuel, mois, annee) => {
    let remboursementMensuel = calculMensualite(montant, tauxMensuel, mois);
    console.log(remboursementMensuel);
    let balance = montant; // total
    let amortissementY = [];
    let amortissementM = [];
    for (let y = 0; y < annee; y++) {
        let interestY = 0; //Interest payment for year y
        let montantY = 0; //montant payment for year y
        for (let m = 0; m < 12; m++) {
            let interestM = balance * tauxMensuel; //Interest payment for month m
            let montantM = remboursementMensuel - interestM; //montant payment for month m
            interestY = interestY + interestM;
            montantY = montantY + montantM;
            balance = balance - montantM;
            amortissementM.push({
                remboursementMensuel,
                capitalAmorti: montantM,
                interet: interestM,
                capitalRestantDu: balance
            });
        }
        amortissementY.push({
            remboursementMensuel,
            capitalAmorti: montantY,
            interet: interestY,
            capitalRestantDu: balance
        });
    }

    return {
        remboursementMensuel,
        amortissementY,
        amortissementM
    };
};

function remplirTableau(amortissement, payes) {
    let html = `<thead>
        <tr>
            <th>Période</th>
            <th>Capital Amorti</th>
            <th>Intérêts</th>
            <th>Capital restant dû</th>
            <th>Mensualité</th>
        </tr>
    </thead>`;
    amortissement.slice(payes).forEach(({ remboursementMensuel, capitalAmorti, interet, capitalRestantDu }, index) => html += `
        <tr class=${Math.round(capitalAmorti) < Math.round(interet) ? "warning" : ""}>
            <td>${index + 1 + payes}</td> <!-- Ajout de payes à l'index -->
            <td class="">${Math.round(capitalAmorti)}</td>
            <td class="">${Math.round(interet)}</td>
            <td class="">${Math.round(capitalRestantDu)}</td>
            <td class="">${Math.round(remboursementMensuel)}</td>
        </tr>
    `);
    document.getElementById("inputMensualite").innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function() {
    let {
        montant,
        tauxMensuel,
        mois,
        annee,
        payes
    } = getValues();
    // appel soit amortissementM ou amortissementY
    let { amortissementM } = calculAmortissement(montant, tauxMensuel, mois, annee);

    remplirTableau(amortissementM, payes);
});

Array.from(document.querySelectorAll('input'), input => {
    input.addEventListener("input", function(event) {
        let {
            montant,
            tauxMensuel,
            mois,
            annee,
            payes
        } = getValues();
        // appel soit amortissementM ou amortissementY
        let { amortissementM } = calculAmortissement(montant, tauxMensuel, mois, annee);

        remplirTableau(amortissementM, payes);

        // Vérifier si la valeur dépasse la valeur maximale
        if (input.valueAsNumber > input.max) {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    }, false);
});

// Mettre à jour la valeur maximale de inputPayes lorsque inputAnnee change
document.getElementById('inputAnnee').addEventListener('input', function() {
    const inputAnnee = document.getElementById('inputAnnee');
    const inputPayes = document.getElementById('inputPayes');
    inputPayes.max = inputAnnee.value * 12;

    // Vérifier si la valeur dépasse la valeur maximale
    if (inputPayes.valueAsNumber > inputPayes.max) {
        inputPayes.classList.add('error');
    } else {
        inputPayes.classList.remove('error');
    }
});