async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    console.log(await JsonPost("admin-status", { id }));

    const board = Chessboard('board', {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true,
        onChange: async (oldPosition, newPosition) => {
            console.log(await JsonPost("admin-set-position", {
                id: id,
                position: Chessboard.objToFen(newPosition)
            }));
        },
    });

    const response = await JsonGet("live-board");
    board.position(response.position);

    window.addEventListener("resize", () => {
        board.resize();
    });
}

$(async () => {
    try {
        await main();
    }
    catch {
        $("#board-container").html("<h1>Error: Insufficient permissions!</h1>");
    }
})
