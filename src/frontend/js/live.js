function calculateSize() {
    const size = Math.min(
        document.getElementById("board-container").clientWidth,
        document.getElementById("board-container").clientHeight
    ) - 12;
    $("#board").css("height", size);
    $("#board").css("width", size);
}

$(function () {
    calculateSize();
    const board = Chessboard('board');
    window.board_object = board;
    board.start();

    window.addEventListener("resize", () => {
        calculateSize();
        board.resize();
    });

    const refreshInterval = setInterval(async () => {
        const response = await JsonGet("live-board");
        board.position(response.position);
    }, 5000);

    let ws_prefix = (window.location.protocol === "https://" ? "wss:" : "ws:");
    const ws = new WebSocket(`${ws_prefix}//${window.location.host}/api/live-board-ws`);
    let seq = 0;
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.seq > seq) {
            seq = data.seq;
            board.position(data.position);
            console.log(`Received position: ${data.position}`);
        }
        else {
            console.log(`Received old position: Incoming seq ${data.seq} vs stored seq ${seq}.`);
        }
    };
})
