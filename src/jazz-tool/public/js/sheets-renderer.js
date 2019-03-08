function renderPDF(pdf) {
    const options = {
        pdfOpenParams: { view: 'FitV'}
    };
    PDFObject.embed(pdf,'#pdf-content', options);
}

// API returns data like:
// [
//   {
//     "description": "Description1", 
//     "name": "Song1", 
//     "object_url": "https://s3.amazonaws.com/user-uploaded-pdfs/dan/pdf1.pdf"
//   }, 
//   {
//     "description": "Description2", 
//     "name": "Song2", 
//     "object_url": "https://s3.amazonaws.com/user-uploaded-pdfs/dan/pdf2.pdf"
//   }
// ]

$.get("/api/sheets", (data) => {
    if (data) {
        $('#pdf-content').show();
        $('#instructions').hide();
        let $songButton, $songText, $songDescription;
        data.forEach((song, i) => {
            $songButton = $('<button>').addClass('list-group-item list-group-item-action song-button');
            $songText = $('<span>').addClass('song-span');
            $songDescription = $('<span>').addClass('description-span');

            if (i === 0) {
                $songButton.addClass('active');
            }
            $songText.text(song.name);
            $songDescription.text(song.description);
            $songButton.append($songText);
            $songButton.append($songDescription);
            $songButton.attr('id', song.object_url);
            
            // On click, highlight currently selected button and render pdf with id of button (url)
            $songButton.click(c => {
                $('button').removeClass('active');
                const target = c.currentTarget;
                $(target).addClass('active');
                renderPDF(target.id);
            });

            // Right clicked
            $songButton.on('contextmenu', e => {
                var top = e.pageY - 10;
                var left = e.pageX - 90;
                $("#context-menu").css({
                    display: "block",
                    top: top,
                    left: left
                }).addClass("show");

                const song_url = e.currentTarget.id;
                
                // Handle clicking of delete option
                $("#context-menu #delete").on("click", () => {
                    $.get('api/delete', { url: song_url });
                    bootbox.confirm("Are you sure you would like to delete this sheet?", (result) => { 
                        if (result) {
                            $(this).parent().removeClass("show").hide(); 
                            location.reload(); // refresh to see change
                        }
                    });
                });

                // Handle clicking of rename option
                $("#context-menu #rename").on("click", () => {
                    $('#modalRename').modal('show');
                    $('#songUrl').val(song_url);
                });

                // Handle clicking of fullscreen option
                $("#context-menu #fullscreen").on("click", () => {
                    const win = window.open(song_url, '_blank');
                    win.focus();
                });

                // Close dropdown on click away
                $('.content').on("click", () => {
                    $("#context-menu").removeClass("show").hide();
                });
                return false; // blocks default browser right click menu
            });

            $('#sheet-list').append($songButton);
        });
        pdf = data[0].object_url;
        renderPDF(pdf);
        return;
    }
    $('#pdf-content').hide();
});