// ============================================================
// Ma ToDo — Framework7 + localStorage
// ============================================================

var $$ = Dom7;

var CLE = 'ma-todo-taches';
var filtreActif = 'toutes';
var taches = chargerTaches();

var app = new Framework7({
    el: '#app',
    name: 'MaToDo',
    theme: 'auto',
    routes: routes,
    view: {
        browserHistory: true,
        browserHistorySeparator: '#!'
    }
});

var mainView = app.views.create('.view-main', {
    url: '/'
});

function nettoyerTexte(texte) {
    return String(texte)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function sauvegarder() {
    try {
        localStorage.setItem(CLE, JSON.stringify(taches));
        console.log('Sauvegarde réussie :', taches);
    } catch (error) {
        console.error('Erreur localStorage sauvegarde :', error);
    }
}

function chargerTaches() {
    try {
        var data = localStorage.getItem(CLE);

        if (!data) {
            return [];
        }

        var resultat = JSON.parse(data);

        if (Array.isArray(resultat)) {
            return resultat;
        }

        return [];
    } catch (error) {
        console.error('Erreur localStorage chargement :', error);
        return [];
    }
}

function tachesVisibles() {
    if (filtreActif === 'afaire') {
        return taches.filter(function (t) {
            return !t.fait;
        });
    }

    if (filtreActif === 'faites') {
        return taches.filter(function (t) {
            return t.fait;
        });
    }

    return taches;
}

function afficherTaches() {
    var liste = $$('.liste-taches');

    if (liste.length === 0) {
        return;
    }

    liste.empty();

    var listeFiltre = tachesVisibles();

    if (listeFiltre.length === 0) {
        liste.append(`
            <li class="item-content">
                <div class="item-inner">
                    <div class="item-title text-color-gray">
                        Aucune tâche à afficher
                    </div>
                </div>
            </li>
        `);
    }

    listeFiltre.forEach(function (tache) {
        var li = `
            <li class="item-content tache-item" data-id="${tache.id}">
                <div class="item-media">
                    <label class="checkbox">
                        <input type="checkbox" ${tache.fait ? 'checked' : ''}>
                        <i class="icon-checkbox"></i>
                    </label>
                </div>

                <div class="item-inner">
                    <div class="item-title ${tache.fait ? 'tache-faite' : ''}">
                        ${nettoyerTexte(tache.texte)}
                    </div>

                    <div class="item-after">
                        <a href="#" class="btn-suppr">
                            <i class="icon f7-icons">trash</i>
                        </a>
                    </div>
                </div>
            </li>
        `;

        liste.append(li);
    });

    mettreAJourCompteur();
    mettreAJourBoutonsFiltre();
}

function ajouterTache() {
    var champTache = $$('#saisie-tache');

    if (champTache.length === 0) {
        return;
    }

    var saisieTache = champTache.val();

    if (saisieTache.trim() === '') {
        app.dialog.alert('Veuillez saisir une tâche.');
        return;
    }

    var newId = taches.reduce(function (max, t) {
        return Math.max(max, t.id);
    }, 0) + 1;

    var nouvelleTache = {
        id: newId,
        texte: saisieTache.trim(),
        fait: false
    };

    taches.push(nouvelleTache);

    sauvegarder();
    afficherTaches();

    champTache.val('');
}

function supprimerTache(id) {
    id = parseInt(id, 10);

    taches = taches.filter(function (t) {
        return t.id !== id;
    });

    sauvegarder();
    afficherTaches();
}

function basculerTache(id, estCochee) {
    id = parseInt(id, 10);

    var tache = taches.find(function (t) {
        return t.id === id;
    });

    if (tache) {
        tache.fait = estCochee;
        sauvegarder();
        afficherTaches();
    }
}

function mettreAJourCompteur() {
    var restantes = taches.filter(function (t) {
        return !t.fait;
    }).length;

    $$('.compteur').text(restantes + ' tâche(s) restante(s)');
}

function mettreAJourBoutonsFiltre() {
    $$('.filtre-btn').removeClass('button-active');
    $$('.filtre-btn[data-filtre="' + filtreActif + '"]').addClass('button-active');
}

$$(document).on('click', '#btn-ajouter', function (e) {
    e.preventDefault();
    ajouterTache();
});

$$(document).on('keydown', '#saisie-tache', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        ajouterTache();
    }
});

$$(document).on('click', '.btn-suppr', function (e) {
    e.preventDefault();

    var id = $$(this).parents('.item-content').attr('data-id');

    app.dialog.confirm(
        'Voulez-vous vraiment supprimer cette tâche ?',
        'Confirmation',
        function () {
            supprimerTache(id);
        }
    );
});

$$(document).on('change', '.liste-taches input[type="checkbox"]', function () {
    var id = $$(this).parents('.item-content').attr('data-id');
    var estCochee = this.checked;

    basculerTache(id, estCochee);
});

$$(document).on('click', '.filtre-btn', function (e) {
    e.preventDefault();

    filtreActif = $$(this).attr('data-filtre');
    afficherTaches();
});

$$(document).on('page:init', '.page[data-name="taches"]', function () {
    afficherTaches();
});

$$(document).on('page:afterin', '.page[data-name="taches"]', function () {
    afficherTaches();
});