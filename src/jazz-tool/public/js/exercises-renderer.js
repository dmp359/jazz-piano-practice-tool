function renderPDF(pdf) {
    const options = {
        pdfOpenParams: { view: 'FitV'}
    };
    PDFObject.embed(pdf,'#pdf-content', options);
}

// API returns data like:
// [
//   {
//     "name": "Ex1", 
//     "object_url": "https://s3.amazonaws.com/user-uploaded-pdfs/public/pdf1.pdf"
//   }, 
//   {
//     "name": "Ex2", 
//     "object_url": "https://s3.amazonaws.com/user-uploaded-pdfs/public/pdf2.pdf"
//   }
// ]
$.get("/api/exercises", (data) => {
    if (data) {
        $('#pdf-content').show();
        let $songButton, $songText;
        data.forEach((song, i) => {
            $songButton = $('<button>').addClass('list-group-item list-group-item-action song-button');
            $songText = $('<span>').addClass('song-span');
            if (i === 0) {
                $songButton.addClass('active');
            }
            $songText.text(song.name);
            $songButton.append($songText);
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