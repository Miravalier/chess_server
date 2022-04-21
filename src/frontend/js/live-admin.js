function calculateSize() {
    const size = Math.min(
        document.getElementById("board-container").clientWidth,
        document.getElementById("board-container").clientHeight - 200
    ) - 12;
    $("#board").css("width", size);
}

async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    calculateSize();

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
        calculateSize();
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
