function RenderPGN(url) {
    return `<ct-pgn-viewer has-url="true">${url}</ct-pgn-viewer>`
}

$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    $("#game").html(RenderPGN(`/pgn/${id}`));
})
