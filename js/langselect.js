$(document).ready(function() {
    // executes when HTML-Document is loaded and DOM is ready
    $('#lang-selector').val('es');
    $('[lang]').hide(); // hide all lang attributes on start.
    $('[lang="es"]').show(); // show just "es" text (you can change it)
    $('#lang-selector').change(function () { // put onchange event when user select option from select
        var lang = $(this).val(); // decide which language to dieslay using switch case. The rest is obvious (i think)
        switch (lang) {
            case 'en':
                $('[lang]').hide();
                $('[lang="en"]').show();
            break;
            case 'es':
                $('[lang]').hide();
                $('[lang="es"]').show();
            break;
            default:
                $('[lang]').hide();
                $('[lang="es"]').show();
            }
            preload();
    });
});